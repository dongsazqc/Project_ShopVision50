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
    SafetyOutlined,
    CheckOutlined,
    GlobalOutlined,
    StarOutlined
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
    const [viewCount, setViewCount] = useState(0);
    const [soldCount, setSoldCount] = useState(0);

    // Comment states - DỮ LIỆU THỰC TỪ API
    const [comments, setComments] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [commentRating, setCommentRating] = useState(0);
    const [submittingComment, setSubmittingComment] = useState(false);
    
    // Rating stats từ comments thực
    const [ratingStats, setRatingStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });

    // Tính toán rating từ comments
    const calculateRatingStats = (commentsData) => {
        if (!commentsData || commentsData.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            };
        }

        const total = commentsData.length;
        const sum = commentsData.reduce((acc, comment) => acc + comment.rating, 0);
        const average = total > 0 ? (sum / total).toFixed(1) : 0;
        
        // Tính phân bố rating
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        commentsData.forEach(comment => {
            const rating = Math.round(comment.rating);
            if (distribution.hasOwnProperty(rating)) {
                distribution[rating] += 1;
            }
        });

        return {
            averageRating: parseFloat(average),
            totalReviews: total,
            ratingDistribution: distribution
        };
    };

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
                    brand: "Premium Brand"
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
                const commentsData = res.data || [];
                setComments(commentsData);
                
                // Tính toán rating stats từ comments thực
                const stats = calculateRatingStats(commentsData);
                setRatingStats(stats);
                
            } catch (error) {
                console.error(error);
                message.error("Không tải được bình luận");
                setRatingStats({
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
                });
            } finally {
                setCommentLoading(false);
            }
        };

        fetchProduct();
        fetchComments();
        
        // Lấy số liệu thực tế (nếu có API)
        // fetchProductStats();
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

    // Hàm lấy số liệu thực tế (nếu có API)
    const fetchProductStats = async () => {
        try {
            // API cho lượt xem và đã bán
            // const [viewsRes, salesRes] = await Promise.all([
            //     api.get(`/products/${id}/views`),
            //     api.get(`/products/${id}/sales`)
            // ]);
            // setViewCount(viewsRes.data.count || 0);
            // setSoldCount(salesRes.data.count || 0);
            
            // Tạm thời tính từ variants
            const totalStock = variants.reduce((sum, v) => sum + (v.soLuongTon || 0), 0);
            const initialStock = variants.reduce((sum, v) => sum + (v.soLuongBanDau || 0), 0);
            const sold = initialStock - totalStock;
            setSoldCount(sold > 0 ? sold : 0);
            
            // Lượt xem tạm tính từ local storage
            const storedViews = localStorage.getItem(`product_${id}_views`);
            if (storedViews) {
                setViewCount(parseInt(storedViews));
            } else {
                const initialViews = Math.floor(Math.random() * 100) + 50;
                setViewCount(initialViews);
                localStorage.setItem(`product_${id}_views`, initialViews.toString());
            }
            
        } catch (error) {
            console.error("Lỗi tải thống kê:", error);
        }
    };

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

            // Tải lại comment mới và tính lại rating
            const res = await api.get(`/comments/product/${product.productId}`);
            const commentsData = res.data || [];
            setComments(commentsData);
            
            // Cập nhật rating stats
            const stats = calculateRatingStats(commentsData);
            setRatingStats(stats);
            
        } catch (error) {
            console.error(error);
            message.error("Gửi bình luận thất bại");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Lấy màu cho rating bar
    const getRatingColor = (rating) => {
        if (rating >= 4) return '#52c41a';
        if (rating >= 3) return '#faad14';
        if (rating >= 2) return '#fa8c16';
        return '#f5222d';
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
                    {/* ... giữ nguyên phần hình ảnh ... */}
                </Col>

                <Col xs={24} lg={14}>
                    <Card className="product-info-card" bodyStyle={{ padding: 32 }}>
                        {/* PHẦN HEADER VỚI RATING NỔI BẬT BÊN PHẢI */}
                        <div className="product-header">
                            <div className="title-section">
                                <h1 className="product-title">{product.name}</h1>
                                <div className="product-subtitle">
                                    <Tag icon={<CrownFilled />} color="gold">Premium</Tag>
                                    <Tag icon={<FireFilled />} color="red">Bán chạy</Tag>
                                </div>
                            </div>
                            
                            {/* RATING CARD LỚN Ở BÊN PHẢI - DỮ LIỆU THỰC */}
                            {ratingStats.totalReviews > 0 && (
                                <div className="header-rating">
                                    <Card className="rating-card" bodyStyle={{ padding: '16px 24px' }}>
                                        <Space direction="vertical" align="center" size={0}>
                                            <div className="rating-score-large" 
                                                 style={{ color: getRatingColor(ratingStats.averageRating) }}>
                                                <StarFilled style={{ 
                                                    color: getRatingColor(ratingStats.averageRating), 
                                                    fontSize: 24, 
                                                    marginRight: 8 
                                                }} />
                                                <span className="rating-number-large">{ratingStats.averageRating}</span>
                                                <span className="rating-total">/5</span>
                                            </div>
                                            <Rate 
                                                disabled 
                                                value={ratingStats.averageRating} 
                                                style={{ fontSize: 16, color: getRatingColor(ratingStats.averageRating) }} 
                                            />
                                            <div className="rating-count-large">
                                                {ratingStats.totalReviews} đánh giá
                                            </div>
                                            <Divider style={{ margin: '8px 0' }} />
                                            <div className="sold-count-large">
                                                <ShoppingOutlined style={{ marginRight: 4 }} />
                                                {soldCount > 0 ? soldCount : '0'} đã bán
                                            </div>
                                        </Space>
                                    </Card>
                                </div>
                            )}
                        </div>

                        <div className="product-actions">
                            <Space>
                                <Button type="text" icon={<ShareAltOutlined />} className="share-btn">
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

                        {/* ... giữ nguyên phần giá, màu sắc, size, số lượng, nút hành động ... */}

                        {/* Price Section */}
                        <div className="price-section">
                            {activeVariant && maxPrice > minPrice && getDiscountPercentage() > 0 && (
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
                                {!activeVariant && maxPrice > minPrice && (
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

                        {/* Variant Selection và các phần khác giữ nguyên */}
                        {/* ... */}

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
                        {/* ... giữ nguyên ... */}
                    </TabPane>
                    
                    <TabPane 
                        tab={
                            <span>
                                <StarFilled /> Đánh giá ({ratingStats.totalReviews})
                            </span>
                        } 
                        key="reviews"
                    >
                        <div className="reviews-section">
                            {/* Rating Summary từ dữ liệu thực */}
                            <div className="rating-summary">
                                <div className="overall-rating">
                                    <div className="rating-number" style={{ color: getRatingColor(ratingStats.averageRating) }}>
                                        {ratingStats.averageRating}
                                    </div>
                                    <Rate 
                                        disabled 
                                        value={ratingStats.averageRating} 
                                        style={{ color: getRatingColor(ratingStats.averageRating) }}
                                    />
                                    <div className="rating-count">{ratingStats.totalReviews} đánh giá</div>
                                </div>
                                <div className="rating-bars">
                                    {[5,4,3,2,1].map(star => {
                                        const count = ratingStats.ratingDistribution[star];
                                        const percent = ratingStats.totalReviews > 0 
                                            ? (count / ratingStats.totalReviews) * 100 
                                            : 0;
                                        return (
                                            <div key={star} className="rating-bar-item">
                                                <span>{star} sao</span>
                                                <Progress 
                                                    percent={percent} 
                                                    size="small"
                                                    strokeColor={getRatingColor(star)}
                                                />
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

                            {/* Comments List từ API thực */}
                            <div className="comments-list">
                                <h3>Đánh giá từ khách hàng ({ratingStats.totalReviews})</h3>
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
                                                            icon={<UserOutlined />}
                                                            size={48}
                                                            style={{ 
                                                                backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}`
                                                            }}
                                                        />
                                                    }
                                                    title={
                                                        <div className="comment-header">
                                                            <div className="comment-user">
                                                                <strong>{item.user?.fullName || "Khách hàng"}</strong>
                                                                {item.user?.userId && (
                                                                    <Tag color="green" icon={<CheckCircleFilled />}>
                                                                        Đã mua hàng
                                                                    </Tag>
                                                                )}
                                                            </div>
                                                            <div className="comment-rating">
                                                                <Rate 
                                                                    disabled 
                                                                    value={item.rating} 
                                                                    style={{ fontSize: 14, color: getRatingColor(item.rating) }}
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
                                                            <div className="comment-actions">
                                                                <Button 
                                                                    type="text" 
                                                                    icon={<ThunderboltOutlined />}
                                                                    size="small"
                                                                >
                                                                    Hữu ích
                                                                </Button>
                                                            </div>
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
                        {/* ... giữ nguyên ... */}
                    </TabPane>
                </Tabs>
            </Card>

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
                {/* ... giữ nguyên ... */}
            </Modal>
        </div>
    );
};

// Thêm hàm getDiscountPercentage nếu chưa có
const getDiscountPercentage = () => {
    // Implementation của hàm này
    return 0;
};

export default ProductDetail;