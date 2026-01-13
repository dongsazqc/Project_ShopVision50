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
    Typography,
    Image,
    Tag,
    InputNumber,
    Tooltip,
    Grid,
    FloatButton
} from "antd";
import {
    ShoppingCartOutlined,
    GiftOutlined,
    DeleteOutlined,
    PlusOutlined,
    MinusOutlined,
    ArrowLeftOutlined,
    ShoppingOutlined,
    ThunderboltOutlined,
    RocketOutlined,
    SafetyOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import "./Cart.css"; // Tạo file CSS riêng cho custom styles

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;


const baseURL = "http://160.250.5.26:5000";

const getProductImageUrl = async (productId) => {
  try {
    const res = await api.get(`/products/${productId}/images/checkimages`);
    const images = res.data || [];

    if (!images.length) return "https://via.placeholder.com/150";

    // Lấy ảnh chính (isPrimary = true), nếu không có thì lấy ảnh đầu tiên
    const primaryImage = images.find(img => img.isPrimary) || images[0];

    // Kiểm tra và xử lý URL
    let imageUrl = primaryImage.url;
    
    // Nếu URL bắt đầu bằng /images/ thì thêm baseURL
    if (imageUrl.startsWith("/images/")) {
      imageUrl = `${baseURL}${imageUrl}`;
    } 
    // Nếu URL là đường dẫn tương đối mà không có /images/
    else if (!imageUrl.startsWith("http")) {
      imageUrl = `${baseURL}/images/products/${imageUrl}`;
    }

    console.log("Generated image URL:", imageUrl);
    return imageUrl;
  } catch (err) {
    console.error("Lỗi load ảnh sản phẩm:", err);
    return "https://via.placeholder.com/150";
  }
};

const Cart = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const { handleUpdateCartCount } = useAppContext();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [promotions, setPromotions] = useState([]);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const screens = useBreakpoint();

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
    console.log("Loading cart for userId:", userId);

    // 1. Lấy giỏ hàng cơ bản
    const res = await api.get(`/Cart/GetCartByUser/${userId}`);
    const rawItems = res.data?.cartItems || [];
    console.log("Cart items raw:", rawItems);

    // 2. Dùng Promise.all để fetch ảnh từng sản phẩm
    const mappedItems = await Promise.all(
      rawItems.map(async (item) => {
        // lấy productId từ item (đảm bảo lấy đúng)
        const productId = item.productVariant?.product?.id || item.productVariant?.productId || null;
        console.log("Fetching images for productId:", productId);

        let imageUrl = "https://via.placeholder.com/150"; // default ảnh thay thế

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
          category: item.productVariant?.product?.category?.name || "",
          weight: item.productVariant?.weight || 0
        };
      })
    );

    console.log("Mapped cart items with images:", mappedItems);

    setCartItems(mappedItems);
    setSelectedItems(mappedItems.map(i => i.variantId));
  } catch (err) {
    console.error("Lỗi tải giỏ hàng:", err);
    messageApi.error("Không thể tải giỏ hàng");
  } finally {
    setLoading(false);
  }
};



 useEffect(() => {
  handleGetCartItems();
}, [userId]);




handleGetCartItems
    // ================= LOAD PROMOTIONS =================
useEffect(() => {
    const fetchPromotions = async () => {
        try {
            const res = await api.get(`khuyenmai/users/${userId}/promotions`);
            const raw = res.data?.data || []; // Lấy từ data trong response
            
            // Hiển thị TẤT CẢ promotions, không lọc
            console.log("Tất cả promotions:", raw);
            setPromotions(raw); // Set tất cả, không filter
            
        } catch (err) {
            console.error("Lỗi tải khuyến mãi:", err);
            // Tạm thời dùng dữ liệu mẫu để test
            const samplePromotions = [
                {
                    promotionId: 0,
                    code: "JUMPGAME_536749",
                    discountType: "PERCENT",
                    discountValue: 10.0,
                    discountDisplay: "10%",
                    condition: "500000",
                    scope: null,
                    startDate: "2026-01-13T12:14:11.523",
                    endDate: "2026-02-12T12:14:11.523",
                    status: true
                },
                {
                    promotionId: 0,
                    code: "JUMPGAME_947603",
                    discountType: "PERCENT",
                    discountValue: 50.0,
                    discountDisplay: "50%",
                    condition: "500000",
                    scope: null,
                    startDate: "2026-01-13T12:14:19.856",
                    endDate: "2026-02-12T12:14:19.856",
                    status: true
                }
            ];
            setPromotions(samplePromotions);
        }
    };
    
    fetchPromotions();
}, [userId]);

    // ================= UPDATE QUANTITY =================
    const updateQuantity = async (item, newQuantity) => {
        if (newQuantity < 1 || newQuantity > item.stock) {
            messageApi.warning(`Số lượng tối đa: ${item.stock}`);
            return;
        }

        try {
            const diff = newQuantity - item.quantity;

            if (diff > 0) {
                await api.put(
                    `/Cart/increase-quantity/${item.cartItemId}?quantity=${diff}`
                );
                messageApi.success(`Đã tăng số lượng "${item.name}"`);
            } else if (diff < 0) {
                await api.put(
                    `/Cart/decrease-quantity/${
                        item.cartItemId
                    }?quantity=${-diff}`
                );
                messageApi.info(`Đã giảm số lượng "${item.name}"`);
            }

            setCartItems((prev) =>
                prev.map((i) =>
                    i.variantId === item.variantId
                        ? { ...i, quantity: newQuantity }
                        : i
                )
            );
        } catch (err) {
            console.error("Lỗi cập nhật số lượng:", err);
            messageApi.error("Cập nhật số lượng thất bại");
        }
    };

    // ================= REMOVE ITEM =================
    const removeItemFE = async (cartItemId, itemName) => {
        try {
            setIsRemoving(true);
            await api.delete(`/CartItems/${cartItemId}`);
            messageApi.success(`Đã xoá "${itemName}" khỏi giỏ hàng`);
            setCartItems((prev) =>
                prev.filter((item) => item.cartItemId !== cartItemId)
            );
            handleUpdateCartCount();
        } catch (error) {
            console.error("Lỗi xoá sản phẩm:", error);
            messageApi.error("Xoá sản phẩm thất bại");
        } finally {
            setIsRemoving(false);
        }
    };

    // ================= REMOVE SELECTED ITEMS =================
    const removeSelectedItems = async () => {
        if (selectedItems.length === 0) {
            messageApi.warning("Vui lòng chọn sản phẩm để xoá");
            return;
        }

        try {
            setIsRemoving(true);
            const itemsToRemove = cartItems.filter(item => 
                selectedItems.includes(item.variantId)
            );
            
            const deletePromises = itemsToRemove.map(item =>
                api.delete(`/CartItems/${item.cartItemId}`)
            );
            
            await Promise.all(deletePromises);
            
            messageApi.success(`Đã xoá ${itemsToRemove.length} sản phẩm`);
            setCartItems(prev => prev.filter(item => 
                !selectedItems.includes(item.variantId)
            ));
            setSelectedItems([]);
            // setCartCount(prev => prev - itemsToRemove.length);
            handleUpdateCartCount();
        } catch (error) {
            console.error("Lỗi xoá nhiều sản phẩm:", error);
            messageApi.error("Xoá sản phẩm thất bại");
        } finally {
            setIsRemoving(false);
        }
    };

    // ================= SELECT/DESELECT ALL =================
    const toggleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => item.variantId));
        }
    };

    // ================= CALCULATIONS =================
const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.variantId)
);

const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + item.giaBan * item.quantity,
    0
);


    let discountAmount = 0;
let shipping = subtotal >= 500000 ? 0 : 30000;
let freeShippingThreshold = 500000;
let shippingRemaining = freeShippingThreshold - subtotal;

if (selectedPromo) {
    const discountValue = parseFloat(selectedPromo.discountValue) || 0;
    const scope = selectedPromo.scope?.toLowerCase();
    
    // Debug: In ra thông tin promotion để kiểm tra
    console.log("Selected promo:", selectedPromo);
    console.log("Scope:", scope);
    console.log("Discount value:", discountValue);
    console.log("Discount type:", selectedPromo.discountType);

    // Xử lý discount dựa trên discountType thay vì scope
    if (selectedPromo.discountType === "PERCENT") {
        // Áp dụng giảm giá phần trăm cho toàn bộ đơn hàng
        discountAmount = (subtotal * discountValue) / 100;
        console.log("Discount amount (PERCENT):", discountAmount);
    } else if (selectedPromo.discountType === "FIXED") {
        // Áp dụng giảm giá cố định
        discountAmount = discountValue;
        console.log("Discount amount (FIXED):", discountAmount);
    }
    
    // Nếu bạn vẫn muốn xử lý theo scope, có thể thêm điều kiện dự phòng
    if (!scope || scope === "toàn sản phẩm" || scope === "") {
        // Nếu scope null, trống, hoặc "toàn sản phẩm", áp dụng cho toàn bộ đơn
        if (selectedPromo.discountType === "PERCENT") {
            discountAmount = (subtotal * discountValue) / 100;
        } else if (selectedPromo.discountType === "FIXED") {
            discountAmount = discountValue;
        }
    } else if (scope === "vận chuyển") {
        // Nếu scope là "vận chuyển", giảm phí ship
        shipping = Math.max(0, shipping * (1 - discountValue / 100));
    }
}

const total = subtotal - discountAmount + shipping;
const totalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0
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

    // ================= RENDER LOADING =================
    if (loading) {
        return (
            <div className="cart-loading-container">
                {contextHolder}
                <Spin 
                    size="large" 
                    tip="Đang tải giỏ hàng..." 
                    className="cart-loading-spin"
                />
            </div>
        );
    }

    // ================= RENDER EMPTY CART =================
    if (cartItems.length === 0) {
        return (
            <div className="cart-container">
                {contextHolder}
                <div className="cart-empty-container">
                    <Card 
                        bordered={false} 
                        className="cart-empty-card"
                    >
                        <Empty
                            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                            imageStyle={{ height: 200 }}
                            description={
                                <div>
                                    <Title level={3} style={{ marginBottom: 16 }}>
                                        Giỏ hàng của bạn đang trống
                                    </Title>
                                    <Text type="secondary">
                                        Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
                                    </Text>
                                </div>
                            }
                        >
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ShoppingOutlined />}
                                    onClick={() => navigate("/")}
                                    className="cart-empty-button"
                                >
                                    Khám phá sản phẩm
                                </Button>
                                <Button
                                    type="default"
                                    size="large"
                                    icon={<ArrowLeftOutlined />}
                                        onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigate("/products");
                                        }}                                >
                                    Quay lại trang trước
                                </Button>
                            </Space>
                        </Empty>
                    </Card>

                </div>
            </div>
        );
    }

    // ================= RENDER CART WITH ITEMS =================
    return (
        <div className="cart-container">
            {contextHolder}
            
            {/* Floating Action Buttons */}
            <FloatButton.Group shape="circle" style={{ right: 24 }}>
                <FloatButton
                    icon={<ShoppingOutlined />}
                    tooltip="Tiếp tục mua sắm"
                    onClick={() => navigate("/")}
                />
                <FloatButton
                    icon={<CheckCircleOutlined />}
                    type="primary"
                    tooltip={`Thanh toán (${selectedItems.length})`}
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
                />
            </FloatButton.Group>

            <div className="cart-content-wrapper">
                {/* HEADER SECTION */}
                <div className="cart-header-section">
                    <Card className="cart-header-card" bordered={false}>
                        <Row align="middle" gutter={[24, 16]}>
                            <Col>
                                <Badge 
                                    count={cartItems.length} 
                                    showZero 
                                    className="cart-badge"
                                    overflowCount={99}
                                >
                                    <div className="cart-icon-wrapper">
                                        <ShoppingCartOutlined className="cart-main-icon" />
                                    </div>
                                </Badge>
                            </Col>
                            <Col flex="auto">
                                <div>
                                    <Title level={2} className="cart-title">
                                        Giỏ Hàng Của Bạn
                                    </Title>
                                    <Text type="secondary" className="cart-subtitle">
                                        {cartItems.length} sản phẩm • {totalItems} món
                                    </Text>
                                </div>
                            </Col>
                            <Col>
                                <Button 
                                    type="default" 
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate("/")}
                                    className="continue-shopping-btn"
                                >
                                    Tiếp tục mua sắm
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </div>

                {/* MAIN CONTENT */}
                <Row gutter={[24, 24]} className="cart-main-row">
                    {/* LEFT PANEL - CART ITEMS */}
                    <Col xs={24} lg={16}>
                        <Card 
                            className="cart-items-card"
                            title={
                                <div className="cart-items-header">
                                    <Space align="center" size="middle">
                                        <Checkbox 
                                            checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                            indeterminate={selectedItems.length > 0 && selectedItems.length < cartItems.length}
                                            onChange={toggleSelectAll}
                                            className="select-all-checkbox"
                                        >
                                            <Text strong>Chọn tất cả ({cartItems.length})</Text>
                                        </Checkbox>
                                        <Button
                                            danger
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            loading={isRemoving}
                                            onClick={removeSelectedItems}
                                            disabled={selectedItems.length === 0}
                                            className="remove-selected-btn"
                                        >
                                            Xoá đã chọn
                                        </Button>
                                    </Space>
                                </div>
                            }
                            extra={
                                <Text type="secondary" className="selected-count">
                                    Đã chọn: {selectedItems.length}/{cartItems.length}
                                </Text>
                            }
                        >
                            <Space 
                                direction="vertical" 
                                size={16} 
                                className="cart-items-list"
                            >
                              {cartItems.map((item) => (
    <Card
        key={item.variantId}
        hoverable
        className={`cart-item-card ${hoveredItem === item.variantId ? 'hovered' : ''}`}
        onMouseEnter={() => setHoveredItem(item.variantId)}
        onMouseLeave={() => setHoveredItem(null)}
    >
        <Row 
            gutter={[16, 16]} 
            align="middle"
            className="cart-item-row"
        >
            {/* Checkbox */}
            <Col xs={2} md={1}>
                <Checkbox
                    checked={selectedItems.includes(item.variantId)}
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
                                        id !== item.variantId
                                )
                            );
                        }
                    }}
                    className="item-checkbox"
                />
            </Col>

{/* Product Image */}
<Col xs={6} md={4}>
    <div className="product-image-container">
        <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            style={{
                objectFit: 'cover',
                borderRadius: '8px'
            }}
            preview={false}
            fallback="https://via.placeholder.com/80"
            onError={(e) => {
                console.error("Failed to load image:", item.image);
                e.target.src = "https://via.placeholder.com/80";
            }}
        />
        {item.quantity > 1 && (
            <Badge 
                count={`x${item.quantity}`} 
                className="quantity-badge"
                style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px'
                }}
            />
        )}
    </div>
</Col>

            {/* Product Details */}
            <Col xs={16} md={19}>
                <Row justify="space-between" align="top" gutter={[8, 8]}>
                    <Col flex="auto">
                        <div className="product-info">
                            <Title level={5} className="product-name">
                                {item.name}
                            </Title>
                            <Space size={[8, 8]} wrap className="product-tags">
                                {item.color && (
                                    <Tag 
                                        color="blue" 
                                        className="product-tag"
                                    >
                                        {item.color}
                                    </Tag>
                                )}
                                {item.size && (
                                    <Tag 
                                        color="geekblue" 
                                        className="product-tag"
                                    >
                                        Size: {item.size}
                                    </Tag>
                                )}
                                {item.category && (
                                    <Tag 
                                        color="purple" 
                                        className="product-tag"
                                    >
                                        {item.category}
                                    </Tag>
                                )}
                            </Space>
                            <div className="product-price">
                                <Text strong className="current-price">
                                    {formatPrice(item.giaBan)}
                                </Text>
                                {item.sku && (
                                    <Text type="secondary" className="product-sku">
                                        SKU: {item.sku}
                                    </Text>
                                )}
                            </div>
                        </div>
                    </Col>

                    {/* Actions */}
                    <Col>
                        <Tooltip title="Xoá sản phẩm">
                            <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                loading={isRemoving}
                                onClick={() => removeItemFE(item.cartItemId, item.name)}
                                className="delete-item-btn"
                            />
                        </Tooltip>
                    </Col>
                </Row>

                {/* Quantity Controls & Total */}
                <Row 
                    justify="space-between" 
                    align="middle"
                    className="item-controls-row"
                >
                    <Col>
                        <div className="quantity-controls">
                            <Text className="quantity-label">Số lượng:</Text>
                            <Space.Compact className="quantity-buttons">
                                <Button
                                    icon={<MinusOutlined />}
                                    onClick={() => updateQuantity(item, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="quantity-btn"
                                />
                                <InputNumber
                                    min={1}
                                    max={item.stock}
                                    value={item.quantity}
                                    onChange={(value) => updateQuantity(item, value)}
                                    controls={false}
                                    className="quantity-input"
                                    size="small"
                                />
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => updateQuantity(item, item.quantity + 1)}
                                    disabled={item.quantity >= item.stock}
                                    className="quantity-btn"
                                />
                            </Space.Compact>
                            {item.stock < 10 && (
                                <Text type="danger" className="low-stock">
                                    Chỉ còn {item.stock} sản phẩm
                                </Text>
                            )}
                        </div>
                    </Col>

                    <Col>
                        <div className="item-total">
                            <Text strong className="total-price">
                                {formatPrice(item.giaBan * item.quantity)}
                            </Text>
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
    </Card>
))}
                            </Space>
                        </Card>

                        {/* Shipping Progress */}
                        {shipping > 0 && subtotal < freeShippingThreshold && (
                            <Card className="shipping-progress-card">
                                <div className="shipping-progress">
                                    <RocketOutlined className="shipping-icon" />
                                    <div className="progress-content">
                                        <Text strong>
                                            Mua thêm {formatPrice(shippingRemaining)} để được MIỄN PHÍ VẬN CHUYỂN
                                        </Text>
                                        <div className="progress-bar-container">
                                            <div 
                                                className="progress-bar"
                                                style={{
                                                    width: `${(subtotal / freeShippingThreshold) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <Text type="secondary">
                                            Đơn tối thiểu {formatPrice(freeShippingThreshold)} để được miễn phí vận chuyển
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </Col>

                    {/* RIGHT PANEL - ORDER SUMMARY */}
                    <Col xs={24} lg={8}>
                        <Card 
                            className="order-summary-card"
                            title={
                                <Space align="center">
                                    <GiftOutlined className="summary-icon" />
                                    <Text strong>Tổng đơn hàng</Text>
                                </Space>
                            }
                            extra={
                                <Tag color="green" icon={<ThunderboltOutlined />}>
                                    {selectedItems.length} sản phẩm
                                </Tag>
                            }
                        >
                           {/* Promotions Section */}
{promotions.length > 0 && (
    <div className="promotions-section">
        <Select
            className="promo-select"
            placeholder={
                <Space>
                    <GiftOutlined />
                    <span>Chọn mã khuyến mãi ({promotions.length} mã)</span>
                </Space>
            }
            value={selectedPromo?.code || undefined}
            onChange={(val) => {
                const promo = promotions.find(p => p.code === val);
                setSelectedPromo(promo || null);
            }}
            optionLabelProp="label"
            dropdownRender={menu => (
                <div>
                    <div className="promo-dropdown-header">
                        <Text strong>Tất cả mã khuyến mãi</Text>
                        <Tag color="blue">{promotions.length} mã</Tag>
                    </div>
                    {menu}
                </div>
            )}
            allowClear
            onClear={() => setSelectedPromo(null)}
            style={{ width: '100%', marginBottom: 16 }}
        >
            {promotions.map((promo, index) => (
                <Option 
                    key={`${promo.code}_${index}`} // Dùng index để tránh trùng key
                    value={promo.code}
                    label={promo.code}
                >
                    <div className="promo-option">
                        <div className="promo-option-header">
                            <Text strong>{promo.code}</Text>
                            <Tag color="red">{promo.discountDisplay}</Tag>
                        </div>
                        <Text type="secondary" className="promo-condition">
                            Giảm {promo.discountDisplay}
                            {promo.condition && ` • Đơn tối thiểu: ${formatPrice(parseInt(promo.condition))}`}
                        </Text>
                        <Text type="secondary" className="promo-dates">
                            HSĐ: {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                        </Text>
                        <Tag 
                            color={promo.status ? "green" : "red"} 
                            style={{ marginTop: 4 }}
                        >
                            {promo.status ? "Đang hoạt động" : "Đã hết hạn"}
                        </Tag>
                    </div>
                </Option>
            ))}
        </Select>
        
        {selectedPromo && (
            <div className="selected-promo">
                <Space align="center">
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text strong>Đã chọn: {selectedPromo.code}</Text>
                    <Tag color="red">{selectedPromo.discountDisplay}</Tag>
                    <Button 
                        type="text" 
                        size="small" 
                        danger
                        onClick={() => setSelectedPromo(null)}
                    >
                        Hủy
                    </Button>
                </Space>
            </div>
        )}
    </div>
)}

                            <Divider className="summary-divider" />

                            {/* Price Breakdown */}
                            <div className="price-breakdown">
                                <div className="price-row">
                                    <Text>Tạm tính ({selectedItems.length} sản phẩm)</Text>
                                    <Text strong>{formatPrice(subtotal)}</Text>
                                </div>
                                
                                {selectedPromo && selectedPromo.scope?.toLowerCase() === "toàn sản phẩm" && (
                                    <div className="price-row discount">
                                        <Text>
                                            <GiftOutlined /> Giảm giá ({selectedPromo.code})
                                        </Text>
                                        <Text type="success" strong>
                                            -{formatPrice(discountAmount)}
                                        </Text>
                                    </div>
                                )}

                                <div className="price-row shipping">
                                    <Text>Phí vận chuyển</Text>
                                    <Text strong={shipping === 0}>
                                        {shipping === 0 ? (
                                            <span className="free-shipping">MIỄN PHÍ</span>
                                        ) : (
                                            formatPrice(shipping)
                                        )}
                                    </Text>
                                </div>

                                {selectedPromo && selectedPromo.scope?.toLowerCase() === "vận chuyển" && (
                                    <div className="price-row shipping-discount">
                                        <Text type="secondary">
                                            ↪ Đã giảm {selectedPromo.discountDisplay} phí vận chuyển
                                        </Text>
                                    </div>
                                )}

                                <Divider className="total-divider" />

                                <div className="total-row">
                                    <Text strong className="total-label">
                                        Tổng cộng
                                    </Text>
                                    <div className="total-amount">
                                        <Title level={3} className="total-price">
                                            {formatPrice(total)}
                                        </Title>
                                        <Text type="secondary">
                                            (Đã bao gồm VAT nếu có)
                                        </Text>
                                    </div>
                                </div>
                            </div>

    <Button
    type="primary"
    size="large"
    block
    icon={<SafetyOutlined />}
    onClick={() => {
        if (selectedItems.length === 0) {
            messageApi.warning("Vui lòng chọn sản phẩm để thanh toán");
            return;
        }
        const checkoutItems = cartItems.filter((item) =>
            selectedItems.includes(item.variantId)
        );
        
        // Lưu đầy đủ thông tin checkout
        const checkoutData = {
            items: checkoutItems,
            subtotal: subtotal,
            discountAmount: discountAmount,
            shipping: shipping,
            total: total,
            promotion: selectedPromo ? {
                code: selectedPromo.code,
                discountType: selectedPromo.discountType,
                discountValue: selectedPromo.discountValue,
                discountDisplay: selectedPromo.discountDisplay,
                condition: selectedPromo.condition,
                scope: selectedPromo.scope
            } : null
        };
        
        console.log("Saving checkout data:", checkoutData);
        sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));
        navigate("/checkout");
    }}
    className="checkout-button"
    disabled={selectedItems.length === 0}
>
    Tiến hành thanh toán
</Button>                            {/* Security & Benefits */}
                            <div className="security-info">
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <div className="security-item">
                                        <SafetyOutlined className="security-icon" />
                                        <Text type="secondary">Thanh toán an toàn & bảo mật</Text>
                                    </div>
                                    <div className="security-item">
                                        <CheckCircleOutlined className="security-icon" />
                                        <Text type="secondary">Đảm bảo chất lượng sản phẩm</Text>
                                    </div>
                                    <div className="security-item">
                                        <RocketOutlined className="security-icon" />
                                        <Text type="secondary">Giao hàng nhanh trong 2h</Text>
                                    </div>
                                </Space>
                            </div>
                        </Card>

                        {/* Additional Info */}
                        <Card className="additional-info-card">
                            <Title level={5}>Chính sách đổi trả</Title>
                            <Paragraph type="secondary" className="policy-text">
                                • Đổi trả trong 30 ngày nếu sản phẩm lỗi
                                <br />
                                • Miễn phí vận chuyển cho đơn từ 500K
                                <br />
                                • Hỗ trợ 24/7 qua hotline: 1800 1234
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>

                {/* RECOMMENDATIONS */}
                {cartItems.length > 0 && (
                    <Card 
                        title={
                            <Space>
                                <ShoppingOutlined />
                                <Text strong>Sản phẩm thường được mua kèm</Text>
                            </Space>
                        }
                        className="recommendations-card"
                    >
                        <Row gutter={[16, 16]}>
                            {[1, 2, 3, 4].map(item => (
                                <Col xs={12} sm={6} key={item}>
                                    <Card 
                                        hoverable 
                                        className="recommendation-item"
                                        onClick={() => navigate(`/product/${item}`)}
                                    >
                                        <div className="recommendation-placeholder">
                                            <ShoppingOutlined style={{ fontSize: 24, color: '#667eea' }} />
                                            <Text className="recommendation-text">
                                                Sản phẩm {item}
                                            </Text>
                                            <Text type="secondary" className="recommendation-price">
                                                {formatPrice(199000 + item * 50000)}
                                            </Text>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Cart;