import { useState, useEffect, useMemo } from "react";
import {
    Card,
    Button,
    Space,
    Row,
    Col,
    Divider,
    message,
    Empty,
    Badge,
    Spin,
    Select,
    Checkbox,
} from "antd";
import {
    ShoppingCartOutlined,
    GiftOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const { Option } = Select;

const Cart = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const { cartCount, setCartCount } = useAppContext();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [promotions, setPromotions] = useState([]);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    const userId = localStorage.getItem("userId");
    const baseURL = "http://160.250.5.26:5000";

    // ================= LOAD CART =================
    const handleGetCartItems = async () => {
        if (!userId) {
            setCartItems([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await api.get(`/Cart/GetCartByUser/${userId}`);
            const rawItems = res.data?.cartItems || [];

            const mapped = rawItems.map((item) => ({
                variantId: item.productVariantId,
                cartItemId: item.cartItemId,
                quantity: item.quantity,
                giaBan: item.productVariant?.salePrice || 0,
                name:
                    item.productVariant?.product?.name ||
                    `Sản phẩm #${item.productVariantId}`,
                color: item.productVariant?.color?.name || null,
                size: item.productVariant?.size?.name || null,
                stock: item.productVariant?.stock || 9999,
                image: item.productVariant?.product?.productImages?.[0]?.url
                    ? baseURL + item.productVariant.product.productImages[0].url
                    : "https://via.placeholder.com/150",
            }));

            setCartItems(mapped);
            setSelectedItems(mapped.map((i) => i.variantId));
        } catch (err) {
            console.log(err);
            messageApi.error("Không thể tải giỏ hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetCartItems();
    }, [userId]);

    // ================= LOAD PROMOTIONS =================
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const res = await api.get("/KhuyenMai/GetAllPromotions");
                const raw = res.data || [];
                const now = new Date();
                const activePromos = raw.filter(
                    (p) =>
                        p.status &&
                        new Date(p.startDate) <= now &&
                        new Date(p.endDate) >= now
                );
                setPromotions(activePromos);
            } catch (err) {
                console.log(err);
            }
        };
        fetchPromotions();
    }, []);

    // ================= UPDATE QUANTITY =================
    const updateQuantity = async (item, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            const diff = newQuantity - item.quantity;

            if (diff > 0) {
                await api.put(
                    `/Cart/increase-quantity/${item.cartItemId}?quantity=${diff}`
                );
            } else if (diff < 0) {
                await api.put(
                    `/Cart/decrease-quantity/${
                        item.cartItemId
                    }?quantity=${-diff}`
                );
            }

            setCartItems((prev) =>
                prev.map((i) =>
                    i.variantId === item.variantId
                        ? { ...i, quantity: newQuantity }
                        : i
                )
            );
        } catch (err) {
            console.log(err);
            messageApi.error("Cập nhật số lượng thất bại");
        }
    };

    // ================= REMOVE ITEM =================
    const removeItemFE = async (cartItemId) => {
        try {
            await api.delete(`/CartItems/${cartItemId}`);
            messageApi.success("Xoá sản phẩm khỏi giỏ hàng thành công");
            setCartItems((prev) =>
                prev.filter((item) => item.cartItemId !== cartItemId)
            );
            setCartCount(cartCount - 1);
        } catch (error) {
            console.log(error);
        }
    };

    // ================= SELECTED ITEMS =================
    const selectedCartItems = cartItems.filter((item) =>
        selectedItems.includes(item.variantId)
    );

    const subtotal = selectedCartItems.reduce(
        (sum, item) => sum + item.giaBan * item.quantity,
        0
    );

    let discountAmount = 0;
    let shipping = subtotal > 500000 ? 0 : 30000;

    if (selectedPromo) {
        const discountValue = parseFloat(selectedPromo.discountValue) || 0;
        const scope = selectedPromo.scope?.toLowerCase();

        if (scope === "toàn sản phẩm") {
            discountAmount = (subtotal * discountValue) / 100;
        } else if (scope === "vận chuyển") {
            shipping = shipping * (1 - discountValue / 100);
        }
    }

    const total = subtotal - discountAmount + shipping;

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);

    // ================= ELIGIBLE PROMOTIONS =================
    const eligiblePromotions = useMemo(() => {
        return promotions.filter((p) => {
            const minAmountMatch = p.condition?.match(/[\d.,]+/);
            const minAmount = minAmountMatch
                ? parseFloat(minAmountMatch[0].replace(/[.,]/g, ""))
                : 0;

            return subtotal >= minAmount;
        });
    }, [promotions, subtotal]);

    if (loading)
        return (
            <Spin size="large" style={{ marginTop: 100, display: "block" }} />
        );

    // ===================== RENDER =====================
    return (
        <div style={{ padding: "20px" }}>
            {contextHolder}
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {/* HEADER */}
                <Card
                    style={{
                        marginBottom: 24,
                        borderRadius: 8,
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #ccc",
                    }}
                    bordered={false}
                >
                    <Space size="middle" align="center">
                        <Badge count={cartItems.length} showZero>
                            <ShoppingCartOutlined
                                style={{ fontSize: 32, color: "#667eea" }}
                            />
                        </Badge>
                        <div>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: 28,
                                    fontWeight: "bold",
                                }}
                            >
                                Giỏ Hàng Của Bạn
                            </h1>
                            <p style={{ margin: 0, color: "#666" }}>
                                {cartItems.length} sản phẩm đang chờ thanh toán
                            </p>
                        </div>
                    </Space>
                </Card>

                {/* EMPTY CART */}
                {cartItems.length === 0 ? (
                    <Card bordered={false} style={{ borderRadius: 8 }}>
                        <Empty description="Giỏ hàng trống">
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate("/")}
                            >
                                Tiếp tục mua sắm
                            </Button>
                        </Empty>
                    </Card>
                ) : (
                    <Row gutter={24}>
                        {/* LEFT LIST */}
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" style={{ width: "100%" }}>
                                {cartItems.map((item) => (
                                    <Card
                                        key={item.variantId}
                                        hoverable
                                        style={{
                                            borderRadius: 8,
                                            background: "rgba(255,255,255,0.95)",
                                            border: "1px solid #ccc",
                                        }}
                                    >
                                        <Row gutter={16} align="middle">
                                            <Col xs={2}>
                                                <Checkbox
                                                    checked={selectedItems.includes(
                                                        item.variantId
                                                    )}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedItems([
                                                                ...selectedItems,
                                                                item.variantId,
                                                            ]);
                                                        } else {
                                                            setSelectedItems(
                                                                selectedItems.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        item.variantId
                                                                )
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Col>

                                            <Col xs={6}>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    style={{
                                                        width: "100%",
                                                        height: 120,
                                                        objectFit: "cover",
                                                        borderRadius: 8,
                                                    }}
                                                />
                                            </Col>

                                            <Col xs={16}>
                                                <Row justify="space-between">
                                                    <Col>
                                                        <h3>{item.name}</h3>
                                                        <p style={{ color: "#888" }}>
                                                            {item.color &&
                                                                `Màu: ${item.color}`}{" "}
                                                            {item.size &&
                                                                ` | Size: ${item.size}`}
                                                        </p>
                                                        <strong style={{ color: "#667eea" }}>
                                                            {formatPrice(item.giaBan)}
                                                        </strong>
                                                    </Col>

                                                    <Col>
                                                        <Button
                                                            danger
                                                            type="text"
                                                            icon={<DeleteOutlined />}
                                                            onClick={() =>
                                                                removeItemFE(item.cartItemId)
                                                            }
                                                        />
                                                    </Col>
                                                </Row>

                                                <Row justify="space-between" style={{ marginTop: 16 }}>
                                                    <Col>
                                                        <Space>
                                                            Số lượng:
                                                            <Button
                                                                onClick={() =>
                                                                    updateQuantity(item, item.quantity - 1)
                                                                }
                                                            >
                                                                -
                                                            </Button>
                                                            <span>{item.quantity}</span>
                                                            <Button
                                                                onClick={() =>
                                                                    updateQuantity(item, item.quantity + 1)
                                                                }
                                                            >
                                                                +
                                                            </Button>
                                                        </Space>
                                                    </Col>

                                                    <Col>
                                                        <strong>{formatPrice(item.giaBan * item.quantity)}</strong>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </Space>
                        </Col>

                        {/* RIGHT SUMMARY */}
                        <Col xs={24} lg={8}>
                            <Card
                                title={
                                    <Space>
                                        <GiftOutlined style={{ color: "#667eea" }} />
                                        <span>Tổng đơn hàng</span>
                                    </Space>
                                }
                            >
                                <Select
                                    style={{ width: "100%" }}
                                    placeholder="Chọn khuyến mãi"
                                    value={selectedPromo?.promotionId || undefined}
                                    onChange={(val) => {
                                        const promo = eligiblePromotions.find(
                                            (p) => p.promotionId === val
                                        );
                                        setSelectedPromo(promo || null);
                                    }}
                                >
                                    {eligiblePromotions.map((promo) => (
                                        <Option key={promo.promotionId} value={promo.promotionId}>
                                            {promo.code} - {promo.discountDisplay} ({promo.condition})
                                        </Option>
                                    ))}
                                </Select>

                                <Divider />

                                <Row justify="space-between">
                                    <Col>Tạm tính</Col>
                                    <Col>{formatPrice(subtotal)}</Col>
                                </Row>

                                {selectedPromo &&
                                    selectedPromo.scope?.toLowerCase() === "toàn sản phẩm" && (
                                        <Row justify="space-between">
                                            <Col>
                                                Giảm ({selectedPromo.discountDisplay})
                                            </Col>
                                            <Col>-{formatPrice(discountAmount)}</Col>
                                        </Row>
                                    )}

                                <Row justify="space-between">
                                    <Col>Vận chuyển</Col>
                                    <Col>{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</Col>
                                </Row>

                                <Divider />

                                <Row justify="space-between">
                                    <strong>Tổng cộng</strong>
                                    <strong style={{ color: "#667eea" }}>{formatPrice(total)}</strong>
                                </Row>

                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    style={{ marginTop: 20 }}
                                    onClick={() => {
                                        if (selectedItems.length === 0) {
                                            messageApi.warning("Vui lòng chọn sản phẩm để thanh toán");
                                            return;
                                        }
                                        const checkoutItems = cartItems.filter((item) =>
                                            selectedItems.includes(item.variantId)
                                        );
                                        sessionStorage.setItem("checkoutItems", JSON.stringify(checkoutItems));
                                        navigate("/checkout");
                                    }}
                                >
                                    Thanh toán
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                )}
            </div>
        </div>
    );
};

export default Cart;