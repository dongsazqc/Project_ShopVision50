import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Checkbox, InputNumber, Image, message, Spin, Empty } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const baseURL = "http://160.250.5.26:5000";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const { setCartCount } = useAppContext();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const userId = localStorage.getItem("userId");

  // Lấy ảnh sản phẩm chuẩn
  const getProductImageUrl = async (productId) => {
    try {
      const res = await api.get(`/products/${productId}/images/checkimages`);
      const raw = res.data?.$values || res.data || [];
      if (raw.length === 0) return "https://via.placeholder.com/150";
      const primary = raw.find(img => img.isPrimary || img.isMain || img.anhChinh) || raw[0];
      return baseURL + primary.url;
    } catch (err) {
      console.error("Lỗi load ảnh sản phẩm:", err);
      return "https://via.placeholder.com/150";
    }
  };

  // Load giỏ hàng + ảnh
  const loadCart = async () => {
    if (!userId) {
      console.log("No userId, không load cart");
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/Cart/GetCartByUser/${userId}`);
      const rawItems = res.data?.cartItems || [];
      console.log("Dữ liệu giỏ hàng raw:", rawItems);

      const mappedItems = await Promise.all(
        rawItems.map(async (item) => {
          console.log("item full data:", item);
          const productId = item.productVariant?.product?.id || item.productVariant?.productId || null;
          console.log("Lấy ảnh cho productId:", productId);

          let imageUrl = "https://via.placeholder.com/150";

          if (productId) {
            imageUrl = await getProductImageUrl(productId);
          }

          return {
            variantId: item.productVariantId,
            cartItemId: item.cartItemId,
            quantity: item.quantity,
            giaBan: item.productVariant?.salePrice || 0,
            name: item.productVariant?.product?.name || `Sản phẩm #${item.productVariantId}`,
            color: item.productVariant?.color?.name || null,
            size: item.productVariant?.size?.name || null,
            stock: item.productVariant?.stock || 9999,
            image: imageUrl,
            sku: item.productVariant?.sku || "",
          };
        })
      );

      setCartItems(mappedItems);
      setSelectedItems(mappedItems.map(i => i.variantId));
      const totalQuantity = mappedItems.reduce((sum, i) => sum + i.quantity, 0);
      setCartCount(totalQuantity);
    } catch (err) {
      console.error("Lỗi tải giỏ hàng:", err);
      messageApi.error("Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [userId]);

  // Update số lượng
  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1 || newQuantity > item.stock) {
      messageApi.warning(`Số lượng tối đa: ${item.stock}`);
      return;
    }
    try {
      const diff = newQuantity - item.quantity;
      if (diff > 0) {
        await api.put(`/Cart/increase-quantity/${item.cartItemId}?quantity=${diff}`);
      } else if (diff < 0) {
        await api.put(`/Cart/decrease-quantity/${item.cartItemId}?quantity=${-diff}`);
      }
      setCartItems(prev =>
        prev.map(i => (i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i))
      );
      setCartCount(prev => prev + diff);
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
      messageApi.error("Cập nhật số lượng thất bại");
    }
  };

  // Xoá item
  const removeItem = async (cartItemId, itemName) => {
    try {
      setIsRemoving(true);
      await api.delete(`/CartItems/${cartItemId}`);
      messageApi.success(`Đã xoá "${itemName}" khỏi giỏ hàng`);
      const itemToRemove = cartItems.find(i => i.cartItemId === cartItemId);
      setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
      if (itemToRemove) {
        setCartCount(prev => prev - itemToRemove.quantity);
        setSelectedItems(prev => prev.filter(id => id !== itemToRemove.variantId));
      }
    } catch (error) {
      console.error("Lỗi xoá sản phẩm:", error);
      messageApi.error("Xoá sản phẩm thất bại");
    } finally {
      setIsRemoving(false);
    }
  };

  // Chọn tất cả / bỏ chọn tất cả
  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(i => i.variantId));
    }
  };

  // Tổng tiền
  const selectedCartItems = cartItems.filter(i => selectedItems.includes(i.variantId));
  const subtotal = selectedCartItems.reduce((sum, i) => sum + i.giaBan * i.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  const formatPrice = price =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(price);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        {contextHolder}
        <Spin size="large" tip="Đang tải giỏ hàng..." />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: 20 }}>
        {contextHolder}
        <Card>
          <Empty description="Giỏ hàng của bạn đang trống">
            <Button type="primary" onClick={() => navigate("/")}>
              Mua sắm ngay
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {contextHolder}
      <Card
        title={
          <>
            <Checkbox
              checked={selectedItems.length === cartItems.length && cartItems.length > 0}
              onChange={toggleSelectAll}
            >
              Chọn tất cả ({cartItems.length})
            </Checkbox>
            <Button
              danger
              style={{ marginLeft: 10 }}
              disabled={selectedItems.length === 0 || isRemoving}
              onClick={() => {
                selectedItems.forEach(id => {
                  const item = cartItems.find(i => i.variantId === id);
                  if (item) removeItem(item.cartItemId, item.name);
                });
              }}
            >
              Xoá đã chọn
            </Button>
          </>
        }
      >
        {cartItems.map(item => (
          <Card key={item.variantId} style={{ marginBottom: 10 }}>
            <Row align="middle" gutter={16}>
              <Col xs={2}>
                <Checkbox
                  checked={selectedItems.includes(item.variantId)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedItems(prev => [...prev, item.variantId]);
                    } else {
                      setSelectedItems(prev => prev.filter(id => id !== item.variantId));
                    }
                  }}
                />
              </Col>
              <Col xs={6}>
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  style={{ objectFit: "contain" }} // hoặc "cover" tuỳ ý, "contain" thì giữ tỉ lệ, không bị crop
                  preview={false} // nếu không cần zoom ảnh
                  fallback="https://via.placeholder.com/150"
                />
              </Col>
              <Col xs={16}>
                <h4 style={{ margin: 0 }}>{item.name}</h4>
                {item.color && <div>Màu: {item.color}</div>}
                {item.size && <div>Size: {item.size}</div>}
                <div style={{ fontWeight: "bold" }}>{formatPrice(item.giaBan)}</div>

                <Row justify="space-between" align="middle" style={{ marginTop: 10 }}>
                  <Col>
                    <Button
                      size="small"
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <InputNumber
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={value => updateQuantity(item, value)}
                      controls={false}
                      style={{ margin: "0 5px", width: 60 }}
                    />
                    <Button
                      size="small"
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </Button>
                  </Col>
                  <Col style={{ fontWeight: "bold" }}>
                    {formatPrice(item.giaBan * item.quantity)}
                  </Col>
                  <Col>
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      loading={isRemoving}
                      onClick={() => removeItem(item.cartItemId, item.name)}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        ))}
      </Card>

      <Card title="Tổng đơn hàng" style={{ marginTop: 20 }}>
        <Row justify="space-between" style={{ marginBottom: 10 }}>
          <span>Tạm tính ({selectedItems.length} sản phẩm)</span>
          <span>{formatPrice(subtotal)}</span>
        </Row>
        <Row justify="space-between" style={{ marginBottom: 10 }}>
          <span>Phí vận chuyển</span>
          <span>{shipping === 0 ? "MIỄN PHÍ" : formatPrice(shipping)}</span>
        </Row>
        <Row justify="space-between" style={{ borderTop: "1px solid #e8e8e8", paddingTop: 10 }}>
          <strong>Tổng cộng</strong>
          <strong style={{ fontSize: 18 }}>{formatPrice(total)}</strong>
        </Row>

        <Button
          type="primary"
          block
          size="large"
          disabled={selectedItems.length === 0}
          style={{ marginTop: 20 }}
          onClick={() => {
            if (selectedItems.length === 0) {
              messageApi.warning("Vui lòng chọn sản phẩm để thanh toán");
              return;
            }
            const checkoutItems = cartItems.filter(i => selectedItems.includes(i.variantId));
            sessionStorage.setItem("checkoutItems", JSON.stringify(checkoutItems));
            navigate("/checkout");
          }}
        >
          Thanh toán ({selectedItems.length})
        </Button>
      </Card>
    </div>
  );
};

export default Cart;
