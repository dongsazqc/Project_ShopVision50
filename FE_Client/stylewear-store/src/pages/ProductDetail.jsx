import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Button,
    Row,
    Col,
    Image,
    InputNumber,
    message,
    Spin,
    Tag,
    Empty,
    Divider,
    Modal,
    Input,
    Rate,
    List,
    Avatar,
    Tooltip,
    Badge,
    Progress,
    Tabs,
    Collapse,
    Space,
    Statistic,
    Alert,
    Skeleton,
    Carousel
} from "antd";
import {
    ShoppingCartOutlined,
    ThunderboltOutlined,
    HeartOutlined,
    HeartFilled,
    ShareAltOutlined,
    StarFilled,
    CheckCircleFilled,
    SafetyCertificateFilled,
    RocketOutlined,
    CrownFilled,
    FireFilled,
    GiftOutlined,
    SyncOutlined,
    ArrowRightOutlined,
    PlusOutlined,
    MinusOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    ShopOutlined,
    TrophyOutlined,
    MessageOutlined,
    UserOutlined,
    CalendarOutlined,
    EyeOutlined,
    ShoppingOutlined,
    CreditCardOutlined,
    TruckOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import api from "../utils/axios";
import { useAppContext } from "../context/AppContext";
import "./ProductDetail.css";

const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { handleUpdateCartCount } = useAppContext();
    const baseURL = "http://160.250.5.26:5000";

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [activeVariant, setActiveVariant] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [addedModalVisible, setAddedModalVisible] = useState(false);
    
    // UI States
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageZoom, setImageZoom] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState("description");
    const [isHoveringBuy, setIsHoveringBuy] = useState(false);
    const [isHoveringCart, setIsHoveringCart] = useState(false);
    const [showShippingInfo, setShowShippingInfo] = useState(false);
    const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 500) + 100);
    const [soldCount, setSoldCount] = useState(Math.floor(Math.random() * 200) + 50);

    // Comment states
    const [comments, setComments] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [commentRating, setCommentRating] = useState(0);
    const [submittingComment, setSubmittingComment] = useState(false);

    // Mock data for related products
    const relatedProducts = Array(4).fill().map((_, i) => ({
        id: i + 1,
        name: `Sản phẩm tương tự ${i + 1}`,
        price: Math.floor(Math.random() * 500000) + 100000,
        discount: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 10 : 0,
        image: `https://picsum.photos/200/200?random=${i}`,
        rating: Math.random() * 2 + 3
    }));

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const resProduct = await api.get(`/ProductVariant/${id}/variants`);
                const data = resProduct.data;
                const rawVariants = data.variants?.$values || data.variants || [];

                const resImages = await api.get(`/products/${id}/images/checkimages`);
                const images = resImages.data
                    ?.map(img => img.url)
                    .filter(Boolean)
                    .map(url => baseURL + url) || [];

                // Auto-select first color and size if available
                const firstColor = [...new Set(rawVariants.map(v => v.tenMau).filter(Boolean))][0];
                const firstSize = [...new Set(rawVariants.map(v => v.tenKichCo).filter(Boolean))][0];

                setProduct({
                    productId: data.productId,
                    name: data.tenSanPham || data.name,
                    description: data.description || "Sản phẩm chất lượng cao với thiết kế hiện đại và tiện ích vượt trội. Được làm từ chất liệu cao cấp, bền bỉ theo thời gian.",
                    images,
                    category: "Thời trang",
                    brand: "Premium Brand",
                    rating: 4.7,
                    reviewCount: 128,
                    tags: ["HOT", "Freeship", "Mới", "Ưu đãi", "Bán chạy"]
                });
                setVariants(rawVariants);
                setActiveImage(images[0] || null);
                setSelectedColor(firstColor);
                setSelectedSize(firstSize);
            } catch (err) {
                console.error(err);
                message.error("Không thể tải thông tin sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                setCommentLoading(true);
                const res = await api.get(`/comments/product/${id}`);
                // Mock additional data for demo
                const mockComments = res.data || Array(5).fill().map((_, i) => ({
                    commentId: i + 1,
                    content: `Sản phẩm rất tốt, chất lượng vượt mong đợi! Tôi sẽ mua tiếp vào lần sau.`,
                    rating: Math.floor(Math.random() * 3) + 3,
                    user: {
                        fullName: `Khách hàng ${i + 1}`,
                        avatar: `https://i.pravatar.cc/150?img=${i + 10}`
                    },
                    createdDate: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
                    likes: Math.floor(Math.random() * 50),
                    isVerified: Math.random() > 0.5
                }));
                setComments(mockComments);
            } catch (error) {
                console.error(error);
                message.error("Không tải được bình luận");
            } finally {
                setCommentLoading(false);
            }
        };

        fetchProduct();
        fetchComments();
        
        // Increment view count on load
        setViewCount(prev => prev + 1);
    }, [id]);

    useEffect(() => {
        if (selectedColor && selectedSize) {
            const variant = variants.find(
                v => v.tenMau === selectedColor && v.tenKichCo === selectedSize
            ) || null;
            setActiveVariant(variant);
            setQuantity(1);
        } else {
            setActiveVariant(null);
        }
    }, [selectedColor, selectedSize, variants]);

    const colors = [...new Set(variants.map(v => v.tenMau).filter(Boolean))];
    const sizes = [...new Set(variants.map(v => v.tenKichCo).filter(Boolean))];
    const minPrice = variants.length
        ? Math.min(...variants.map(v => Number(v.giaBan)))
        : 0;
    const maxPrice = variants.length
        ? Math.max(...variants.map(v => Number(v.giaBan)))
        : 0;
    const isVariantSelected = !!activeVariant;

    const handleAddToCart = () => {
        if (!activeVariant) return;
        const token = localStorage.getItem("token");

        // Animation effect
        const cartBtn = document.querySelector('.cart-btn');
        if (cartBtn) {
            cartBtn.classList.add('adding');
            setTimeout(() => cartBtn.classList.remove('adding'), 600);
        }

        if (!token) {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            const existing = cart.find(item => item.variantId === activeVariant.productVariantId);
            if (existing) existing.quantity += quantity;
            else
                cart.push({
                    variantId: activeVariant.productVariantId,
                    productId: product.productId,
                    name: product.name,
                    giaBan: activeVariant.giaBan,
                    quantity,
                    color: selectedColor,
                    size: selectedSize,
                    image: activeImage,
                });
            localStorage.setItem("cart", JSON.stringify(cart));
            setAddedModalVisible(true);
            return;
        }

        try {
            api.post("/Cart/AddToCart", {
                productVariantId: activeVariant.productVariantId,
                quantity,
            });
            setAddedModalVisible(true);
        } catch (error) {
            console.error(error);
            message.error("Không thể thêm vào giỏ hàng");
        }

        setTimeout(() => {
            handleUpdateCartCount();
        }, 500);
    };

    const handleBuyNow = () => {
        if (!activeVariant) return;
        const buyNowData = {
            variantId: activeVariant.productVariantId,
            productId: product.productId,
            name: product.name,
            giaBan: activeVariant.giaBan,
            quantity,
            color: selectedColor,
            size: selectedSize,
            image: activeImage,
        };
        sessionStorage.setItem("buyNow", JSON.stringify(buyNowData));
        navigate("/checkout");
    };

    const handleSubmitComment = async () => {
        if (!commentContent.trim()) {
            message.warning("Nội dung bình luận không được để trống");
            return;
        }
        if (commentRating < 1) {
            message.warning("Vui lòng chọn đánh giá sao");
            return;
        }

        const userId = localStorage.getItem("userId");

        if (!userId) {
            message.error("Bạn chưa đăng nhập");
            return;
        }

        setSubmittingComment(true);
        try {
            await api.post("/comments", {
                userId: Number(userId),
                productId: product.productId,
                content: commentContent,
                rating: commentRating,
            });

            message.success("Cảm ơn bạn đã bình luận!");
            setCommentContent("");
            setCommentRating(0);

            // Tải lại comment mới
            const res = await api.get(`/comments/product/${product.productId}`);
            setComments(res.data || []);
        } catch (error) {
            console.error(error);
            message.error("Gửi bình luận thất bại");
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleImageMouseMove = (e) => {
        if (!imageZoom) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ x, y });
    };

    const getDiscountPercentage = () => {
        if (!activeVariant || maxPrice === minPrice) return 0;
        return Math.round(((maxPrice - activeVariant.giaBan) / maxPrice) * 100);
    };

    if (loading) return (
        <div style={{ padding: "40px 24px", maxWidth: 1200, margin: "0 auto" }}>
            <Row gutter={[32, 32]}>
                <Col xs={24} lg={12}>
                    <Skeleton.Image active style={{ width: "100%", height: 400 }} />
                    <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
                        {[1,2,3,4,5].map(i => (
                            <Col span={4} key={i}>
                                <Skeleton.Image active style={{ width: "100%", height: 60 }} />
                            </Col>
                        ))}
                    </Row>
                </Col>
                <Col xs={24} lg={12}>
                    <Skeleton active paragraph={{ rows: 6 }} />
                </Col>
            </Row>
        </div>
    );

    if (!product) return (
        <div style={{ padding: "100px 24px", textAlign: "center" }}>
            <Empty 
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                imageStyle={{ height: 120 }}
                description={
                    <span style={{ fontSize: 16, color: "#666" }}>
                        Sản phẩm không tồn tại hoặc đã bị xóa
                    </span>
                }
            >
                <Button 
                    type="primary" 
                    size="large"
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate("/")}
                    style={{ marginTop: 24 }}
                >
                    Quay lại trang chủ
                </Button>
            </Empty>
        </div>
    );

    return (
        <div className="product-detail-container">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Space>
                    <a onClick={() => navigate("/")}>Trang chủ</a>
                    <ArrowRightOutlined style={{ fontSize: 12, color: "#999" }} />
                    <a onClick={() => navigate("/products")}>Sản phẩm</a>
                    <ArrowRightOutlined style={{ fontSize: 12, color: "#999" }} />
                    <span style={{ color: "#ee4d2d" }}>{product.name}</span>
                </Space>
            </div>

            {/* Main Product Section */}
            <Row gutter={[32, 32]} className="main-product-section">
                <Col xs={24} lg={10}>
                    <Card 
                        className="product-image-card"
                        bodyStyle={{ padding: 0, borderRadius: 16 }}
                        hoverable
                    >
                        <div 
                            className={`image-container ${imageZoom ? 'zoomed' : ''}`}
                            onMouseEnter={() => setImageZoom(true)}
                            onMouseLeave={() => setImageZoom(false)}
                            onMouseMove={handleImageMouseMove}
                        >
                            <Badge.Ribbon 
                                text="HOT" 
                                color="#ee4d2d"
                                style={{ top: 10 }}
                            >
                                <Image
                                    src={activeImage || "https://via.placeholder.com/600"}
                                    preview={false}
                                    className="main-image"
                                    alt={product.name}
                                />
                            </Badge.Ribbon>
                            {imageZoom && (
                                <div 
                                    className="zoom-preview"
                                    style={{
                                        backgroundImage: `url(${activeImage})`,
                                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
                                    }}
                                />
                            )}
                            <Button
                                className="wishlist-btn"
                                type="text"
                                icon={isWishlisted ? <HeartFilled /> : <HeartOutlined />}
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                style={{ color: isWishlisted ? '#ff4d4f' : '#666' }}
                            />
                        </div>
                        
                        {product.images.length > 1 && (
                            <div className="thumbnail-carousel">
                                <Carousel 
                                    dots={false}
                                    arrows
                                    slidesToShow={5}
                                    responsive={[
                                        { breakpoint: 768, settings: { slidesToShow: 4 } },
                                        { breakpoint: 576, settings: { slidesToShow: 3 } }
                                    ]}
                                >
                                    {product.images.map((img, idx) => (
                                        <div key={idx} className="thumbnail-container">
                                            <Image
                                                src={img}
                                                preview={false}
                                                className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                                                onClick={() => setActiveImage(img)}
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                            </div>
                        )}
                        
                        {/* Product Stats */}
                        <div className="product-stats">
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Statistic
                                        title="Đã bán"
                                        value={soldCount}
                                        prefix={<ShoppingOutlined />}
                                        valueStyle={{ fontSize: 16 }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Lượt xem"
                                        value={viewCount}
                                        prefix={<EyeOutlined />}
                                        valueStyle={{ fontSize: 16 }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Đánh giá"
                                        value={product.rating || 4.5}
                                        prefix={<StarFilled />}
                                        valueStyle={{ fontSize: 16, color: '#faad14' }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={14}>
                    <Card className="product-info-card" bodyStyle={{ padding: 32 }}>
                        <div className="product-header">
                            <h1 className="product-title">{product.name}</h1>
                            <Space>
                                <Button 
                                    type="text" 
                                    icon={<ShareAltOutlined />}
                                    className="share-btn"
                                >
                                    Chia sẻ
                                </Button>
                                <Button 
                                    type="text" 
                                    icon={isWishlisted ? <HeartFilled /> : <HeartOutlined />}
                                    className="wishlist-btn-large"
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                >
                                    {isWishlisted ? 'Đã thích' : 'Yêu thích'}
                                </Button>
                            </Space>
                        </div>

                        <div className="product-meta">
                            <Space size={[8, 8]} wrap>
                                <Tag icon={<CrownFilled />} color="gold">Premium</Tag>
                                <Tag icon={<FireFilled />} color="red">Bán chạy</Tag>
                                <Tag icon={<GiftOutlined />} color="green">Quà tặng</Tag>
                                <Tag icon={<SyncOutlined />} color="blue">Đổi trả 7 ngày</Tag>
                            </Space>
                        </div>

                        <div className="price-section">
                            {activeVariant && getDiscountPercentage() > 0 && (
                                <div className="discount-badge">
                                    <span className="discount-percent">-{getDiscountPercentage()}%</span>
                                    <span className="original-price">
                                        {maxPrice.toLocaleString("vi-VN")} ₫
                                    </span>
                                </div>
                            )}
                            <div className="current-price">
                                <span className="price-amount">
                                    {(activeVariant?.giaBan || minPrice).toLocaleString("vi-VN")} ₫
                                </span>
                                {!activeVariant && (
                                    <span className="price-range">
                                        - {maxPrice.toLocaleString("vi-VN")} ₫
                                    </span>
                                )}
                            </div>
                            <div className="price-save">
                                <SafetyCertificateFilled style={{ color: '#52c41a' }} />
                                <span>Tiết kiệm {(maxPrice - minPrice).toLocaleString("vi-VN")} ₫</span>
                            </div>
                        </div>

                        {/* Color Selection */}
                        {colors.length > 0 && (
                            <div className="variant-section">
                                <h3 className="variant-title">
                                    <span>Màu sắc</span>
                                    <span className="selected-value">{selectedColor}</span>
                                </h3>
                                <div className="color-options">
                                    {colors.map((color) => (
                                        <Tooltip key={color} title={color}>
                                            <div
                                                className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                                                onClick={() => setSelectedColor(color)}
                                                style={{
                                                    background: color.toLowerCase(),
                                                    border: color.toLowerCase() === 'white' ? '1px solid #ddd' : 'none'
                                                }}
                                            >
                                                {selectedColor === color && (
                                                    <CheckCircleFilled className="color-check" />
                                                )}
                                            </div>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        {sizes.length > 0 && (
                            <div className="variant-section">
                                <h3 className="variant-title">
                                    <span>Kích thước</span>
                                    <span className="selected-value">{selectedSize}</span>
                                </h3>
                                <div className="size-options">
                                    {sizes.map((size) => (
                                        <Button
                                            key={size}
                                            className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                            {selectedSize === size && (
                                                <CheckCircleFilled className="size-check" />
                                            )}
                                        </Button>
                                    ))}
                                </div>
                                <a className="size-guide-link">
                                    <EnvironmentOutlined /> Hướng dẫn chọn size
                                </a>
                            </div>
                        )}

                        {/* Quantity Selection */}
                        <div className="quantity-section">
                            <h3 className="quantity-title">Số lượng</h3>
                            <div className="quantity-controls">
                                <Button
                                    icon={<MinusOutlined />}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                    className="quantity-btn"
                                />
                                <InputNumber
                                    value={quantity}
                                    min={1}
                                    max={activeVariant?.soLuongTon || 99}
                                    onChange={(v) => setQuantity(Math.min(v, activeVariant?.soLuongTon || 99))}
                                    className="quantity-input"
                                />
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => setQuantity(Math.min(activeVariant?.soLuongTon || 99, quantity + 1))}
                                    disabled={quantity >= (activeVariant?.soLuongTon || 99)}
                                    className="quantity-btn"
                                />
                                <span className="stock-info">
                                    {activeVariant ? `Còn ${activeVariant.soLuongTon} sản phẩm` : 'Chọn màu/size để xem số lượng'}
                                </span>
                            </div>
                            <Progress
                                percent={activeVariant ? Math.min(100, (activeVariant.soLuongTon / 100) * 100) : 0}
                                size="small"
                                showInfo={false}
                                strokeColor="#52c41a"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <Button
                                className={`cart-btn ${isHoveringCart ? 'hover' : ''}`}
                                icon={<ShoppingCartOutlined />}
                                size="large"
                                onClick={handleAddToCart}
                                disabled={!isVariantSelected}
                                onMouseEnter={() => setIsHoveringCart(true)}
                                onMouseLeave={() => setIsHoveringCart(false)}
                            >
                                Thêm vào giỏ hàng
                            </Button>
                            <Button
                                className={`buy-now-btn ${isHoveringBuy ? 'hover' : ''}`}
                                type="primary"
                                icon={<ThunderboltOutlined />}
                                size="large"
                                onClick={handleBuyNow}
                                disabled={!isVariantSelected}
                                onMouseEnter={() => setIsHoveringBuy(true)}
                                onMouseLeave={() => setIsHoveringBuy(false)}
                            >
                                Mua ngay
                            </Button>
                        </div>

                        {/* Shipping Info */}
                        <div className="shipping-info">
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Space>
                                        <TruckOutlined style={{ color: '#1890ff' }} />
                                        <div>
                                            <div className="shipping-title">Giao hàng siêu tốc</div>
                                            <div className="shipping-desc">Nhận hàng trong 2 giờ</div>
                                        </div>
                                    </Space>
                                </Col>
                                <Col span={12}>
                                    <Space>
                                        <UndoOutlined style={{ color: '#52c41a' }} />
                                        <div>
                                            <div className="shipping-title">Đổi trả dễ dàng</div>
                                            <div className="shipping-desc">7 ngày miễn phí</div>
                                        </div>
                                    </Space>
                                </Col>
                                <Col span={12}>
                                    <Space>
                                        <div>
                                            <div className="shipping-title">Bảo hành chính hãng</div>
                                            <div className="shipping-desc">12 tháng</div>
                                        </div>
                                    </Space>
                                </Col>
                                <Col span={12}>
                                    <Space>
                                        <CreditCardOutlined style={{ color: '#fa8c16' }} />
                                        <div>
                                            <div className="shipping-title">Thanh toán linh hoạt</div>
                                            <div className="shipping-desc">COD, Visa, Momo</div>
                                        </div>
                                    </Space>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Product Details Tabs */}
            <Card className="details-tabs-card">
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    className="detail-tabs"
                >
                    <TabPane 
                        tab={
                            <span>
                                <MessageOutlined /> Mô tả sản phẩm
                            </span>
                        } 
                        key="description"
                    >
                        <div className="product-description">
                            <div className="description-content">
                                {product.description.split('\n').map((paragraph, idx) => (
                                    <p key={idx}>{paragraph}</p>
                                ))}
                            </div>
                            <div className="description-features">
                                <h3>Đặc điểm nổi bật</h3>
                                <ul>
                                    <li>Chất liệu cao cấp, bền đẹp theo thời gian</li>
                                    <li>Thiết kế hiện đại, phong cách trẻ trung</li>
                                    <li>Phù hợp nhiều hoàn cảnh sử dụng</li>
                                    <li>Dễ dàng vệ sinh và bảo quản</li>
                                    <li>Cam kết chính hãng 100%</li>
                                </ul>
                            </div>
                        </div>
                    </TabPane>
                    
                    <TabPane 
                        tab={
                            <span>
                                <StarFilled /> Đánh giá ({comments.length})
                            </span>
                        } 
                        key="reviews"
                    >
                        <div className="reviews-section">
                            {/* Rating Summary */}
                            <div className="rating-summary">
                                <div className="overall-rating">
                                    <div className="rating-number">{product.rating || 4.7}</div>
                                    <Rate disabled defaultValue={product.rating || 4.7} />
                                    <div className="rating-count">{comments.length} đánh giá</div>
                                </div>
                                <div className="rating-bars">
                                    {[5,4,3,2,1].map(star => {
                                        const count = comments.filter(c => Math.round(c.rating) === star).length;
                                        const percent = comments.length ? (count / comments.length) * 100 : 0;
                                        return (
                                            <div key={star} className="rating-bar-item">
                                                <span>{star} sao</span>
                                                <Progress percent={percent} size="small" />
                                                <span>{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Comment Form */}
                            <Card className="comment-form-card">
                                <h3>Viết đánh giá của bạn</h3>
                                <div style={{ marginBottom: 16 }}>
                                    <Rate 
                                        value={commentRating} 
                                        onChange={setCommentRating}
                                        className="rating-input"
                                    />
                                </div>
                                <TextArea
                                    rows={4}
                                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    className="comment-textarea"
                                />
                                <Button
                                    type="primary"
                                    loading={submittingComment}
                                    onClick={handleSubmitComment}
                                    className="submit-comment-btn"
                                    size="large"
                                >
                                    <MessageOutlined /> Gửi đánh giá
                                </Button>
                            </Card>

                            {/* Comments List */}
                            <div className="comments-list">
                                <h3>Đánh giá từ khách hàng</h3>
                                {commentLoading ? (
                                    <div style={{ textAlign: 'center', padding: 40 }}>
                                        <Spin size="large" />
                                    </div>
                                ) : comments.length === 0 ? (
                                    <Empty 
                                        description="Chưa có đánh giá nào"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                ) : (
                                    <List
                                        itemLayout="vertical"
                                        dataSource={comments}
                                        renderItem={(item) => (
                                            <List.Item key={item.commentId} className="comment-item">
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar 
                                                            src={item.user?.avatar} 
                                                            icon={<UserOutlined />}
                                                            size={48}
                                                        />
                                                    }
                                                    title={
                                                        <div className="comment-header">
                                                            <div className="comment-user">
                                                                <strong>{item.user?.fullName || "Khách hàng"}</strong>
                                                                {item.isVerified && (
                                                                    <Tag color="green" icon={<CheckCircleFilled />}>
                                                                        Đã mua hàng
                                                                    </Tag>
                                                                )}
                                                            </div>
                                                            <div className="comment-rating">
                                                                <Rate 
                                                                    disabled 
                                                                    defaultValue={item.rating} 
                                                                    style={{ fontSize: 14 }}
                                                                />
                                                                <span className="comment-date">
                                                                    <CalendarOutlined /> 
                                                                    {new Date(item.createdDate).toLocaleDateString('vi-VN')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    }
                                                    description={
                                                        <div className="comment-content">
                                                            {item.content}
                                                            {item.likes > 0 && (
                                                                <div className="comment-actions">
                                                                    <Button 
                                                                        type="text" 
                                                                        icon={<HeartOutlined />}
                                                                        size="small"
                                                                    >
                                                                        Hữu ích ({item.likes})
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                    </TabPane>
                    
                    <TabPane 
                        tab={
                            <span>
                                <ShopOutlined /> Chính sách mua hàng
                            </span>
                        } 
                        key="policies"
                    >
                        <Collapse ghost className="policy-collapse">
                            <Panel header="Chính sách giao hàng" key="1">
                                <ul>
                                    <li>Giao hàng toàn quốc</li>
                                    <li>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</li>
                                    <li>Giao hàng nhanh trong 2-4 giờ tại nội thành</li>
                                    <li>Giao hàng tiêu chuẩn 2-5 ngày với các tỉnh thành khác</li>
                                </ul>
                            </Panel>
                            <Panel header="Chính sách đổi trả" key="2">
                                <ul>
                                    <li>Đổi trả trong vòng 7 ngày kể từ khi nhận hàng</li>
                                    <li>Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng</li>
                                    <li>Miễn phí đổi trả với lỗi từ nhà sản xuất</li>
                                    <li>Hoàn tiền trong vòng 3-5 ngày làm việc</li>
                                </ul>
                            </Panel>
                            <Panel header="Chính sách bảo hành" key="3">
                                <ul>
                                    <li>Bảo hành 12 tháng chính hãng</li>
                                    <li>Hỗ trợ sửa chữa tại các trung tâm bảo hành toàn quốc</li>
                                    <li>Bảo hành 1 đổi 1 trong 30 ngày đầu với lỗi kỹ thuật</li>
                                </ul>
                            </Panel>
                        </Collapse>
                    </TabPane>
                </Tabs>
            </Card>

            {/* Related Products */}
            <div className="related-products-section">
                <div className="section-header">
                    <h2>
                        <TrophyOutlined /> Sản phẩm tương tự
                    </h2>
                    <Button type="link" onClick={() => navigate('/products')}>
                        Xem tất cả <ArrowRightOutlined />
                    </Button>
                </div>
                <Row gutter={[16, 16]}>
                    {relatedProducts.map((item) => (
                        <Col xs={12} sm={8} md={6} key={item.id}>
                            <Card
                                hoverable
                                className="related-product-card"
                                cover={
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        preview={false}
                                        height={200}
                                        style={{ objectFit: 'cover' }}
                                    />
                                }
                                onClick={() => navigate(`/product/${item.id}`)}
                            >
                                <div className="related-product-info">
                                    <div className="related-product-name">{item.name}</div>
                                    <div className="related-product-price">
                                        <span className="current-price">
                                            {item.price.toLocaleString('vi-VN')} ₫
                                        </span>
                                        {item.discount > 0 && (
                                            <span className="original-price">
                                                {Math.round(item.price * (100 + item.discount) / 100).toLocaleString('vi-VN')} ₫
                                            </span>
                                        )}
                                    </div>
                                    {item.discount > 0 && (
                                        <Tag color="red" className="discount-tag">
                                            -{item.discount}%
                                        </Tag>
                                    )}
                                    <div className="related-product-rating">
                                        <Rate disabled defaultValue={item.rating} style={{ fontSize: 12 }} />
                                        <span>({Math.floor(Math.random() * 100)})</span>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Success Modal */}
            <Modal
                title={
                    <Space>
                        <CheckCircleFilled style={{ color: '#52c41a' }} />
                        Thêm vào giỏ hàng thành công
                    </Space>
                }
                open={addedModalVisible}
                footer={[
                    <Button
                        key="continue"
                        onClick={() => setAddedModalVisible(false)}
                        className="modal-btn"
                    >
                        Tiếp tục mua sắm
                    </Button>,
                    <Button
                        key="view"
                        type="primary"
                        onClick={() => {
                            setAddedModalVisible(false);
                            navigate("/cart");
                        }}
                        className="modal-btn"
                        icon={<ShoppingCartOutlined />}
                    >
                        Xem giỏ hàng
                    </Button>,
                    <Button
                        key="checkout"
                        type="primary"
                        danger
                        onClick={() => {
                            setAddedModalVisible(false);
                            handleBuyNow();
                        }}
                        className="modal-btn"
                        icon={<ThunderboltOutlined />}
                    >
                        Thanh toán ngay
                    </Button>
                ]}
                onCancel={() => setAddedModalVisible(false)}
                className="success-modal"
            >
                <div className="modal-content">
                    <Image
                        src={activeImage}
                        width={80}
                        height={80}
                        style={{ borderRadius: 8, marginRight: 16 }}
                    />
                    <div>
                        <h4>{product.name}</h4>
                        <p>{selectedColor} - {selectedSize}</p>
                        <p>Số lượng: {quantity}</p>
                        <p className="modal-price">
                            Thành tiền: <strong>{((activeVariant?.giaBan || minPrice) * quantity).toLocaleString('vi-VN')} ₫</strong>
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProductDetail;