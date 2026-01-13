import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Divider,
  Radio,
  message,
  Spin,
  Tag,
  Space,
} from "antd";
import {
  GiftOutlined,
  CheckCircleOutlined,
  ShoppingOutlined
} from "@ant-design/icons";
import api from "../utils/axios";
import { useAppContext } from "../context/AppContext";

const Checkout = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [checkoutData, setCheckoutData] = useState({
    items: [],
    subtotal: 0,
    discountAmount: 0,
    shipping: 0,
    total: 0,
    promotion: null
  });

  // Format price function
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0
    }).format(price);

  // =========================================
  // 1) LẤY DỮ LIỆU BUY NOW HOẶC CART
  // =========================================
  useEffect(() => {
    // Lấy dữ liệu checkout đầy đủ từ Cart (bao gồm promotion)
    const checkoutDataFromCart = JSON.parse(
      sessionStorage.getItem("checkoutData")
    );
    
    if (checkoutDataFromCart && checkoutDataFromCart.items && checkoutDataFromCart.items.length > 0) {
      console.log("Checkout data loaded:", checkoutDataFromCart);
      setCheckoutData(checkoutDataFromCart);
      return;
    }

    // Nếu có mua ngay (cần update buyNow để có cấu trúc tương tự)
    const buyNow = JSON.parse(sessionStorage.getItem("buyNow"));
    if (buyNow) {
      const buyNowData = {
        items: [buyNow],
        subtotal: buyNow.giaBan * buyNow.quantity,
        discountAmount: 0,
        shipping: buyNow.giaBan * buyNow.quantity > 500000 ? 0 : 30000,
        total: buyNow.giaBan * buyNow.quantity + (buyNow.giaBan * buyNow.quantity > 500000 ? 0 : 30000),
        promotion: null
      };
      setCheckoutData(buyNowData);
      return;
    }

    // Nếu user đã login nhưng session rỗng → fetch từ server
    if (token) {
      fetchCartFromServer();
    } else {
      messageApi.warning("Không có sản phẩm để thanh toán");
      navigate("/");
    }
  }, []);

  // =========================================
  // 2) FETCH CART SERVER (fallback)
  // =========================================
  const fetchCartFromServer = async () => {
    if (!userId) {
      messageApi.warning("Bạn chưa đăng nhập");
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/Cart/GetCartByUser/${userId}`);
      const data = res.data;

      const serverCart = data.cartItems || [];

      if (serverCart.length === 0) {
        messageApi.warning("Giỏ hàng của bạn đang trống");
        return navigate("/");
      }

      const items = serverCart.map((item) => ({
        variantId: item.productVariantId,
        cartItemId: item.cartItemId,
        quantity: item.quantity,
        giaBan: item.productVariant?.salePrice || item.price || 0,
        name:
          item.productVariant?.product?.name ||
          `Sản phẩm #${item.productVariantId}`,
        color: item.productVariant?.color?.name || null,
        size: item.productVariant?.size?.name || null,
        image: item.productVariant?.product?.productImages?.[0]?.url
          ? "http://160.250.5.26:5000" +
            item.productVariant.product.productImages[0].url
          : "https://via.placeholder.com/150",
        stock: item.productVariant?.stock || 9999,
      }));

      const subtotal = items.reduce((sum, item) => sum + item.giaBan * item.quantity, 0);
      const shipping = subtotal > 500000 ? 0 : 30000;
      const total = subtotal + shipping;

      setCheckoutData({
        items,
        subtotal,
        discountAmount: 0,
        shipping,
        total,
        promotion: null
      });
    } catch (err) {
      console.error(err);
      messageApi.error("Không thể tải giỏ hàng từ server");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // 3) FETCH USER PROFILE → AUTOFILL
  // =========================================
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        setUserLoading(true);
        const res = await api.get(`/Users/getById/${userId}`);
        form.setFieldsValue({
          recipientName: res.data.fullName || "",
          recipientPhone: res.data.phone || "",
          shippingAddress: res.data.defaultAddress || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  if (checkoutData.items.length === 0)
    return <Spin style={{ marginTop: 100 }} size="large" />;

  // =========================================
  // 4) SUBMIT ĐẶT HÀNG
  // =========================================
  const { setCartCount } = useAppContext();
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Mảng orderItems theo chuẩn JSON 2 có price
      const orderItems = checkoutData.items.map((item) => ({
        productVariantId: item.variantId,
        quantity: item.quantity,
        price: item.giaBan,
      }));

      // Thanh toán kiểu COD
      const payments = [
        {
          method: "Cash",
          amount: checkoutData.total,
          cashReceived: checkoutData.total,
          cashChange: 0,
        },
      ];

      // Chuẩn bị payload cho order
      const orderPayload = {
        orderDate: new Date().toISOString(),
        orderType: "Online",
        status: 0,
        totalAmount: checkoutData.total,
        subtotal: checkoutData.subtotal,
        discountAmount: checkoutData.discountAmount,
        shippingFee: checkoutData.shipping,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        shippingAddress: values.shippingAddress,
        userId: Number(userId),
        orderItems: orderItems,
        payments: payments,
        promotionCode: checkoutData.promotion?.code || null,
        promotionDiscount: checkoutData.discountAmount || 0,
      };

      console.log("Order payload:", orderPayload);

      // ================== TẠO ĐƠN HÀNG ==================
      await api.post("/Orders/Add", orderPayload);
      messageApi.success("Đơn hàng đã được tạo, chờ xử lý");

      // ================== XÓA SẢN PHẨM KHỎI GIỎ HÀNG SERVER ==================
      if (userId) {
        const cartItemIds = checkoutData.items
          .map((item) => item.cartItemId)
          .filter(Boolean);

        // Xóa từng item
        for (let id of cartItemIds) {
          await api.delete(`/CartItems/${id}`);
        }

        // Cập nhật lại cartCount trong context
        setCartCount(0);
      }

      // ================== XÓA LOCAL STORAGE ==================
      sessionStorage.removeItem("buyNow");
      sessionStorage.removeItem("checkoutData");
      localStorage.removeItem("cart");

      navigate("/ordersuccess");
    } catch (error) {
      console.error("Order error:", error);
      messageApi.error("Đặt hàng thất bại: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {contextHolder}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: 20, color: '#1890ff' }}>Thanh toán đơn hàng</h2>

        {userLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[32, 24]}>
            {/* FORM THANH TOÁN */}
            <Col xs={24} lg={14}>
              <Card 
                title="Thông tin giao hàng" 
                bordered={false}
                style={{ marginBottom: 24 }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{ paymentMethod: "COD" }}
                >
                  <Form.Item
                    label="Họ và tên"
                    name="recipientName"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ tên" },
                    ]}
                  >
                    <Input placeholder="Nguyễn Văn A" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Số điện thoại"
                    name="recipientPhone"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      {
                        pattern: /^0\d{9,10}$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    ]}
                  >
                    <Input placeholder="0123456789" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Địa chỉ giao hàng"
                    name="shippingAddress"
                    rules={[
                      { required: true, message: "Vui lòng nhập địa chỉ" },
                    ]}
                  >
                    <Input.TextArea rows={3} size="large" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
                  </Form.Item>

                  <Form.Item
                    label="Phương thức thanh toán"
                    name="paymentMethod"
                    initialValue="COD"
                  >
                    <Radio.Group disabled>
                      <Radio value="COD">Thanh toán khi nhận hàng (COD)</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{ 
                      background: "#52c41a", 
                      borderColor: "#52c41a",
                      height: 50,
                      fontSize: 16,
                      fontWeight: 'bold'
                    }}
                    block
                    size="large"
                    icon={<CheckCircleOutlined />}
                  >
                    Xác nhận đặt hàng
                  </Button>
                </Form>
              </Card>
            </Col>

            {/* TÓM TẮT ĐƠN HÀNG */}
            <Col xs={24} lg={10}>
              <Card 
                title="Tóm tắt đơn hàng" 
                bordered={false}
                style={{ position: 'sticky', top: 20 }}
              >
                {/* Danh sách sản phẩm */}
                <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 20 }}>
                  {checkoutData.items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: 15, paddingBottom: 15, borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: 15 }}>{item.name}</strong>
                          <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                            {item.color && <span>Màu: {item.color} </span>}
                            {item.size && <span>| Size: {item.size}</span>}
                          </div>
                          <div style={{ fontSize: 13, marginTop: 2 }}>Số lượng: {item.quantity}</div>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: 10 }}>
                          <div style={{ fontWeight: 'bold', color: '#ff4d4f', fontSize: 15 }}>
                            {formatPrice(item.giaBan)}
                          </div>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {formatPrice(item.giaBan * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chi tiết giá */}
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span>Tạm tính</span>
                    <span style={{ fontWeight: 'bold' }}>{formatPrice(checkoutData.subtotal)}</span>
                  </div>

                  {/* Hiển thị discount nếu có */}
                  {checkoutData.discountAmount > 0 && checkoutData.promotion && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span>
                        <Space>
                          <GiftOutlined style={{ color: '#52c41a' }} />
                          <span>Giảm giá ({checkoutData.promotion.code})</span>
                        </Space>
                      </span>
                      <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                        -{formatPrice(checkoutData.discountAmount)}
                      </span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span>Phí vận chuyển</span>
                    <span style={{ fontWeight: checkoutData.shipping === 0 ? 'bold' : 'normal' }}>
                      {checkoutData.shipping === 0 ? (
                        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>MIỄN PHÍ</span>
                      ) : (
                        formatPrice(checkoutData.shipping)
                      )}
                    </span>
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20 }}>
                    <strong>Tổng tiền</strong>
                    <strong style={{ color: "#ff4d4f", fontSize: 22 }}>
                      {formatPrice(checkoutData.total)}
                    </strong>
                  </div>

                  {/* Thông tin promotion */}
                  {checkoutData.promotion && (
                    <div style={{ 
                      marginTop: 16, 
                      padding: 12, 
                      backgroundColor: '#f6ffed', 
                      borderRadius: 6,
                      border: '1px solid #b7eb8f'
                    }}>
                      <Space align="center">
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <span>Mã khuyến mãi đã áp dụng:</span>
                        <Tag color="red" style={{ fontSize: 12 }}>
                          {checkoutData.promotion.discountDisplay}
                        </Tag>
                        <span style={{ fontWeight: 'bold', fontSize: 12 }}>{checkoutData.promotion.code}</span>
                      </Space>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  );
};

export default Checkout;