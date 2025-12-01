import { useState, useEffect } from "react";
import {
    Card,
    Button,
    InputNumber,
    Input,
    Tag,
    Space,
    Row,
    Col,
    Divider,
    message,
    Empty,
    Badge,
    Spin,
} from "antd";
import {
    DeleteOutlined,
    ShoppingCartOutlined,
    TagOutlined,
    GiftOutlined,
} from "@ant-design/icons";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);

    const userId = localStorage.getItem("userId"); // Giả sử lưu userId

    // Load giỏ hàng từ backend
    useEffect(() => {
        const fetchCart = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/Cart/GetCartByUser/${7}`);
                setCartItems(res.data.cartItems.$values || []);
            } catch (err) {
                message.error("Không thể tải giỏ hàng");
            } finally {
                setLoading(false);
            }
        };

        setTimeout(fetchCart, 0); // tránh cảnh báo cascading render
    }, [userId]);

    // Cập nhật số lượng
    const updateQuantity = async (item, value) => {
        if (value < 1) return;
        try {
            const payload = {
                cartItemId: item.cartItemId,
                quantity: value,
                price: item.productVariant.salePrice * value,
                productVariantId: item.productVariantId,
                cartId: 7,
            };
            await api.patch(`/CartItems/${item.cartItemId}`, payload);
            setCartItems((items) =>
                items.map((item) =>
                    item.variantId === item.variantId
                        ? { ...item, quantity: value }
                        : item
                )
            );
            message.success("Cập nhật số lượng thành công");
        } catch {
            message.error("Cập nhật thất bại");
        }
    };

    // Xóa sản phẩm
    const removeItem = async (cartItemId) => {
        try {
            await api.delete(`/CartItems/${cartItemId}`);

            setCartItems((items) =>
                items.filter((item) => item.cartItemId !== cartItemId)
            );
            message.success("Đã xóa sản phẩm khỏi giỏ hàng");
        } catch {
            message.error("Xóa thất bại");
        }
    };

    // Áp dụng mã giảm giá
    const applyPromo = async () => {
        if (!promoCode) return;
        try {
            const res = await api.post(`/Cart/ApplyPromo`, { promoCode });
            setDiscount(res.data.discountPercent || 0);
            message.success(`Áp dụng mã giảm giá ${res.data.discountPercent}%`);
        } catch {
            message.error("Mã giảm giá không hợp lệ");
        }
    };

    // Tính toán tiền
    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.giaBan * item.quantity,
        0
    );
    const discountAmount = (subtotal * discount) / 100;
    const shipping = subtotal > 500000 ? 0 : 30000;
    const total = subtotal - discountAmount + shipping;

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);

    if (loading) return <Spin style={{ marginTop: 100 }} size="large" />;
    return (
        <div style={{ padding: "20px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {/* Header */}
                <Card
                    style={{
                        marginBottom: 24,
                        borderRadius: 8,
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
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
                                    color: "#1a1a1a",
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

                {cartItems.length === 0 ? (
                    <Card
                        style={{
                            borderRadius: 8,
                            background: "rgba(255, 255, 255, 0.95)",
                        }}
                        bordered={false}
                    >
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div>
                                    <h2
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 600,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Giỏ hàng trống
                                    </h2>
                                    <p style={{ color: "#666" }}>
                                        Hãy thêm sản phẩm vào giỏ hàng của bạn!
                                    </p>
                                </div>
                            }
                        >
                            <Button
                                type="primary"
                                size="large"
                                style={{ borderRadius: 8 }}
                            >
                                Tiếp Tục Mua Sắm
                            </Button>
                        </Empty>
                    </Card>
                ) : (
                    <Row gutter={24}>
                        {/* List sản phẩm */}
                        <Col xs={24} lg={16}>
                            <Space
                                direction="vertical"
                                size="middle"
                                style={{ width: "100%" }}
                            >
                                {cartItems.map((item) => (
                                    <Card
                                        key={item.variantId}
                                        hoverable
                                        style={{
                                            borderRadius: 8,
                                            background:
                                                "rgba(255, 255, 255, 0.95)",
                                            border: "1px solid #ccc",
                                        }}
                                        bordered={false}
                                    >
                                        <Row gutter={16} align="middle">
                                            <Col xs={8} sm={6}>
                                                <img
                                                    src={
                                                        item.image
                                                            ? item.image
                                                            : "https://via.placeholder.com/150"
                                                    }
                                                    alt={item.name}
                                                    style={{
                                                        width: "100%",
                                                        height: 120,
                                                        objectFit: "cover",
                                                        borderRadius: 8,
                                                    }}
                                                />
                                            </Col>
                                            <Col xs={16} sm={18}>
                                                <Row
                                                    justify="space-between"
                                                    align="top"
                                                >
                                                    <Col span={18}>
                                                        <h3
                                                            style={{
                                                                fontSize: 18,
                                                                fontWeight: 600,
                                                                marginBottom: 8,
                                                            }}
                                                        >
                                                            {item.name}
                                                        </h3>
                                                        <div
                                                            style={{
                                                                marginTop: 12,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontSize: 20,
                                                                    fontWeight:
                                                                        "bold",
                                                                    color: "#667eea",
                                                                }}
                                                            >
                                                                {formatPrice(
                                                                    item
                                                                        .productVariant
                                                                        .salePrice
                                                                )}
                                                            </span>
                                                            <div
                                                                style={{
                                                                    fontSize: 12,
                                                                    color: "#888",
                                                                    marginTop: 4,
                                                                }}
                                                            >
                                                                {item.color &&
                                                                    `Màu: ${item.color}`}{" "}
                                                                {item.size &&
                                                                    `| Size: ${item.size}`}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col
                                                        span={6}
                                                        style={{
                                                            textAlign: "right",
                                                        }}
                                                    >
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={
                                                                <DeleteOutlined />
                                                            }
                                                            onClick={() =>
                                                                removeItem(
                                                                    item.cartItemId
                                                                )
                                                            }
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row
                                                    justify="space-between"
                                                    align="middle"
                                                    style={{ marginTop: 16 }}
                                                >
                                                    <Col>
                                                        <Space>
                                                            <span
                                                                style={{
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                Số lượng:
                                                            </span>
                                                            <InputNumber
                                                                min={1}
                                                                value={
                                                                    item.quantity
                                                                }
                                                                onChange={(
                                                                    value
                                                                ) =>
                                                                    updateQuantity(
                                                                        item,
                                                                        value
                                                                    )
                                                                }
                                                                style={{
                                                                    borderRadius: 8,
                                                                }}
                                                            />
                                                        </Space>
                                                    </Col>
                                                    <Col>
                                                        <span
                                                            style={{
                                                                fontSize: 16,
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {formatPrice(
                                                                item.quantity *
                                                                    item
                                                                        .productVariant
                                                                        .salePrice
                                                            )}
                                                        </span>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </Space>
                        </Col>

                        {/* Order Summary */}
                        <Col xs={24} lg={8}>
                            <Card
                                title={
                                    <Space>
                                        <GiftOutlined
                                            style={{
                                                fontSize: 20,
                                                color: "#667eea",
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontSize: 18,
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Tổng Đơn Hàng
                                        </span>
                                    </Space>
                                }
                                style={{
                                    borderRadius: 8,
                                    background: "rgba(255, 255, 255, 0.95)",
                                    position: "sticky",
                                    top: 24,
                                    border: "1px solid #ccc",
                                }}
                                bordered={false}
                            >
                                {/* Promo Code */}
                                <div style={{ marginBottom: 24 }}>
                                    <Space
                                        direction="vertical"
                                        style={{ width: "100%" }}
                                    >
                                        <Space>
                                            <TagOutlined
                                                style={{ color: "#667eea" }}
                                            />
                                            <span style={{ fontWeight: 500 }}>
                                                Mã giảm giá
                                            </span>
                                        </Space>
                                        <Input.Search
                                            placeholder="Nhập mã giảm giá..."
                                            value={promoCode}
                                            onChange={(e) =>
                                                setPromoCode(e.target.value)
                                            }
                                            onSearch={applyPromo}
                                            enterButton="Áp dụng"
                                            size="large"
                                            style={{ borderRadius: 8 }}
                                        />
                                        {discount > 0 && (
                                            <Tag
                                                color="success"
                                                style={{ fontSize: 13 }}
                                            >
                                                ✓ Giảm {discount}% đã được áp
                                                dụng!
                                            </Tag>
                                        )}
                                    </Space>
                                </div>

                                <Divider />

                                {/* Price Breakdown */}
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                    size="middle"
                                >
                                    <Row justify="space-between">
                                        <Col>Tạm tính</Col>
                                        <Col style={{ fontWeight: 500 }}>
                                            {formatPrice(
                                                cartItems.reduce((i) => {
                                                    return (
                                                        i.productVariant
                                                            .salePrice *
                                                        i.quantity
                                                    );
                                                })
                                            )}
                                        </Col>
                                    </Row>
                                    {discount > 0 && (
                                        <Row
                                            justify="space-between"
                                            style={{ color: "#52c41a" }}
                                        >
                                            <Col>Giảm giá ({discount}%)</Col>
                                            <Col style={{ fontWeight: 600 }}>
                                                -{formatPrice(discountAmount)}
                                            </Col>
                                        </Row>
                                    )}
                                    <Row justify="space-between">
                                        <Col>Phí vận chuyển</Col>
                                        <Col style={{ fontWeight: 500 }}>
                                            {shipping === 0 ? (
                                                <Tag color="success">
                                                    Miễn phí
                                                </Tag>
                                            ) : (
                                                formatPrice(shipping)
                                            )}
                                        </Col>
                                    </Row>
                                    {subtotal < 500000 && (
                                        <div
                                            style={{
                                                padding: 12,
                                                background: "#f0f5ff",
                                                borderRadius: 8,
                                                fontSize: 12,
                                                color: "#1890ff",
                                            }}
                                        >
                                            Mua thêm{" "}
                                            {formatPrice(500000 - subtotal)} để
                                            được miễn phí vận chuyển!
                                        </div>
                                    )}
                                </Space>

                                <Divider />

                                {/* Total */}
                                <Row
                                    justify="space-between"
                                    align="middle"
                                    style={{ marginBottom: 24 }}
                                >
                                    <Col>
                                        <span
                                            style={{
                                                fontSize: 18,
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Tổng cộng
                                        </span>
                                    </Col>
                                    <Col>
                                        <span
                                            style={{
                                                fontSize: 24,
                                                fontWeight: "bold",
                                                color: "#667eea",
                                            }}
                                        >
                                            {formatPrice(
                                                cartItems.reduce((i) => {
                                                    return (
                                                        i.productVariant
                                                            .salePrice *
                                                        i.quantity
                                                    );
                                                }) - 30000
                                            )}
                                        </span>
                                    </Col>
                                </Row>

                                {/* Checkout Button */}
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    style={{
                                        height: 50,
                                        fontSize: 16,
                                        fontWeight: 600,
                                        borderRadius: 8,
                                        background:
                                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        border: "none",
                                    }}
                                    onClick={() => {
                                        sessionStorage.setItem(
                                            "checkoutCart",
                                            JSON.stringify(cartItems)
                                        );
                                        navigate("/checkout");
                                    }}
                                >
                                    Tiến Hành Thanh Toán
                                </Button>

                                <p
                                    style={{
                                        textAlign: "center",
                                        fontSize: 12,
                                        color: "#999",
                                        marginTop: 16,
                                        marginBottom: 0,
                                    }}
                                >
                                    🛡️ Miễn phí đổi trả trong 30 ngày
                                </p>
                            </Card>
                        </Col>
                    </Row>
                )}
            </div>
        </div>
    );
};

export default Cart;
