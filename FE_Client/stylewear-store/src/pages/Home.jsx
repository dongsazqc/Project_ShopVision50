import React, { useEffect, useState } from "react";
import {
    Layout,
    Row,
    Col,
    Button,
    Card,
    Carousel,
    Spin,
    Badge,
    Tooltip,
} from "antd";
import {
    ShoppingCartOutlined,
    FireOutlined,
    StarOutlined,
    RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

const { Content } = Layout;

const Home = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    // const [topProducts, setTopProducts] = useState([]);
    // const [loadingTopProducts, setLoadingTopProducts] = useState(false);
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(false);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        fetchVariants();
    }, []);

    // Get top products
    // useEffect(() => {
    //     const fetch = async () => {
    //         try {
    //             setLoadingTopProducts(true);
    //             const res = await api.get("/TopSanPham");
    //             if (res?.data?.length > 0) {
    //                 // Fetch ảnh cho từng sản phẩm và lưu vào state images
    //                 const productsWithImages = await Promise.all(
    //                     res.data.map(async (item) => {
    //                         try {
    //                             const imageRes = await api.get(
    //                                 `/products/${item.productId}/images/checkimages`
    //                             );
    //                             const img = imageRes.data[0]?.url || "";
    //                             const price =
    //                                 imageRes.data[0]?.product?.price || 0;
    //                             // console.log("check", item, imgs);
    //                             return {
    //                                 ...item,
    //                                 price: price,
    //                                 image: `http://160.250.5.26:5000${img}`,
    //                             };
    //                         } catch (err) {
    //                             console.error(
    //                                 `Lỗi fetch ảnh cho product ${item.productId}:`,
    //                                 err
    //                             );
    //                             return item;
    //                         }
    //                     })
    //                 );
    //                 setTopProducts(productsWithImages);
    //             } else {
    //                 setTopProducts([]);
    //             }
    //         } catch (error) {
    //             console.log(error);
    //             setTopProducts([]);
    //         } finally {
    //             setLoadingTopProducts(false);
    //         }
    //     };
    //     fetch();
    // }, []);

    // ================= FETCH PRODUCTS =================
    const fetchVariants = async () => {
        try {
            setLoading(true);
            const res = await api.get("/ProductVariant");
            const variants = res.data || [];
            const list = groupVariantsToProducts(variants);
            setProducts(list);
            list.forEach((p) => fetchImages(p.productId));
        } catch (err) {
            console.error("Lỗi load:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchImages = async (productId) => {
        try {
            const res = await api.get(
                `/products/${productId}/images/checkimages`
            );
            const imgs = res.data || [];
            setImages((prev) => ({ ...prev, [productId]: imgs }));
        } catch (err) {
            console.error("Lỗi ảnh:", err);
        }
    };

    // ===================== UTIL =======================
    const groupVariantsToProducts = (variants) => {
        const map = {};
        variants.forEach((v) => {
            if (!map[v.productId]) {
                map[v.productId] = {
                    productId: v.productId,
                    tenSanPham: v.tenSanPham,
                    variants: [],
                    daBan: Math.floor(Math.random() * 500) + 100,
                    isNew: Math.random() > 0.5,
                };
            }
            map[v.productId].variants.push(v);
        });
        return Object.values(map);
    };

    const getMinPrice = (variants) =>
        variants && variants.length > 0
            ? Math.min(...variants.map((v) => Number(v.giaBan)))
            : 0;

    const getImage = (productId) => {
        const imgs = images[productId];
        if (!imgs || imgs.length === 0)
            return "https://via.placeholder.com/300x300?text=No+Image";
        const main = imgs.find((i) => i.isMain) || imgs[0];
        return `http://160.250.5.26:5000${main.url}`;
    };

    // ============= TOP PRODUCTS ==================
    const topNew = products.filter((p) => p.isNew).slice(0, 4);
    const topBest = [...products].sort((a, b) => b.daBan - a.daBan).slice(0, 4);

    return (
        <Layout style={styles.layout}>
            {/* ================= HERO BANNER ================= */}
            <div style={styles.heroSection}>
                <div style={styles.heroContent}>
                    <div style={styles.heroTextBox}>
                        <div style={styles.heroBadge}>🎉 SALE UP TO 50%</div>
                        <h1 style={styles.heroTitle}>
                            Phong Cách Hiện Đại
                            <br />
                            <span style={styles.heroTitleAccent}>
                                Giá Cả Hợp Lý
                            </span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Khám phá bộ sưu tập áo phông cao cấp - Chất liệu
                            premium, thiết kế độc đáo
                        </p>
                        <div style={styles.heroButtons}>
                            <Button
                                type="primary"
                                size="large"
                                style={styles.heroPrimaryButton}
                                onClick={() => navigate("/products")}
                                icon={<ShoppingCartOutlined />}
                            >
                                Mua Ngay
                            </Button>
                            <Button
                                size="large"
                                style={styles.heroSecondaryButton}
                                onClick={() => navigate("/products")}
                            >
                                Xem Bộ Sưu Tập
                            </Button>
                        </div>
                    </div>
                </div>
                <div style={styles.heroOverlay}></div>
            </div>

            {/* ================= FEATURES BANNER ================= */}
            <div style={styles.featuresBanner}>
                <Row gutter={[24, 24]} justify="center">
                    {features.map((feature, idx) => (
                        <Col xs={24} sm={12} md={6} key={idx}>
                            <div style={styles.featureItem}>
                                <div style={styles.featureIcon}>
                                    {feature.icon}
                                </div>
                                <h4 style={styles.featureTitle}>
                                    {feature.title}
                                </h4>
                                <p style={styles.featureDesc}>{feature.desc}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* ================= CONTENT ================= */}
            <Content style={styles.content}>
                {/* FEATURED COLLECTION - CAROUSEL */}
                <Row justify="center" style={{ marginBottom: 80 }}>
                    <Col xs={24} md={22} lg={20}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>
                                ✨ Bộ Sưu Tập Nổi Bật
                            </h2>
                            <p style={styles.sectionSubtitle}>
                                Xu hướng thời trang mới nhất năm 2025
                            </p>
                        </div>
                        <Carousel
                            autoplay
                            speed={1000}
                            autoplaySpeed={4000}
                            dots={{ className: "custom-dots" }}
                            effect="fade"
                        >
                            {carouselImages.map((img, i) => (
                                <div key={i} style={styles.carouselWrapper}>
                                    <div style={styles.carouselImageContainer}>
                                        <img
                                            src={img}
                                            style={styles.carouselImage}
                                            alt={`Collection ${i + 1}`}
                                            loading="lazy"
                                        />
                                        <div style={styles.carouselOverlay}>
                                            <Button
                                                size="large"
                                                style={styles.carouselButton}
                                                onClick={() =>
                                                    navigate("/products")
                                                }
                                            >
                                                Khám Phá Ngay
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    </Col>
                </Row>

                {/* TOP NEW PRODUCTS */}
                <div style={styles.productSection}>
                    <div style={styles.sectionHeader}>
                        <div>
                            <h2 style={styles.sectionTitle}>
                                <StarOutlined
                                    style={{ color: "#FFD700", marginRight: 8 }}
                                />
                                Sản Phẩm Mới Nhất
                            </h2>
                            <p style={styles.sectionSubtitle}>
                                Những sản phẩm vừa ra mắt
                            </p>
                        </div>
                        <Button
                            type="link"
                            style={styles.viewAllButton}
                            onClick={() => navigate("/products")}
                        >
                            Xem Tất Cả <RightOutlined />
                        </Button>
                    </div>

                    <Row gutter={[24, 24]}>
                        {loading ? (
                            <Col
                                span={24}
                                style={{
                                    textAlign: "center",
                                    padding: "60px 0",
                                }}
                            >
                                <Spin size="large" />
                            </Col>
                        ) : (
                            topNew.map((p) => (
                                <Col xs={12} sm={12} md={6} key={p.productId}>
                                    <Badge.Ribbon text="NEW" color="red">
                                        <Card
                                            hoverable
                                            style={styles.productCard}
                                            bodyStyle={{ padding: "16px" }}
                                            cover={
                                                <div
                                                    style={
                                                        styles.productImageWrapper
                                                    }
                                                    onMouseEnter={() =>
                                                        setHovered(p.productId)
                                                    }
                                                    onMouseLeave={() =>
                                                        setHovered(null)
                                                    }
                                                >
                                                    <img
                                                        src={getImage(
                                                            p.productId
                                                        )}
                                                        style={{
                                                            ...styles.productImage,
                                                            transform:
                                                                hovered ===
                                                                p.productId
                                                                    ? "scale(1.06)"
                                                                    : "scale(1)",
                                                        }}
                                                        alt={p.tenSanPham}
                                                        loading="lazy"
                                                    />
                                                    <div
                                                        style={{
                                                            ...styles.productOverlay,
                                                            opacity:
                                                                hovered ===
                                                                p.productId
                                                                    ? 1
                                                                    : 0,
                                                        }}
                                                    >
                                                        <Tooltip title="Mua ngay">
                                                            <Button
                                                                type="primary"
                                                                size="middle"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    navigate(
                                                                        `/products/${p.productId}`
                                                                    );
                                                                }}
                                                            >
                                                                Mua ngay
                                                            </Button>
                                                        </Tooltip>
                                                        <div
                                                            style={{
                                                                width: 12,
                                                            }}
                                                        />
                                                        <Tooltip title="Quick view">
                                                            <Button
                                                                type="default"
                                                                ghost
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    navigate(
                                                                        `/products/${p.productId}`
                                                                    );
                                                                }}
                                                            >
                                                                Xem
                                                            </Button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/products/${p.productId}`
                                                )
                                            }
                                        >
                                            <h4 style={styles.productName}>
                                                {p.tenSanPham}
                                            </h4>
                                            <div style={styles.productPrice}>
                                                ₫
                                                {getMinPrice(
                                                    p.variants
                                                ).toLocaleString()}
                                            </div>
                                        </Card>
                                    </Badge.Ribbon>
                                </Col>
                            ))
                        )}
                    </Row>
                </div>

                {/* TOP BEST SELLERS */}
                <div style={styles.productSection}>
                    <div style={styles.sectionHeader}>
                        <div>
                            <h2 style={styles.sectionTitle}>
                                <FireOutlined
                                    style={{ color: "#FF4D4F", marginRight: 8 }}
                                />
                                Bán Chạy Nhất
                            </h2>
                            <p style={styles.sectionSubtitle}>
                                Top sản phẩm được yêu thích nhất
                            </p>
                        </div>
                        <Button
                            type="link"
                            style={styles.viewAllButton}
                            onClick={() => navigate("/products")}
                        >
                            Xem Tất Cả <RightOutlined />
                        </Button>
                    </div>

                    <Row gutter={[24, 24]}>
                        {loading ? (
                            <Col
                                span={24}
                                style={{
                                    textAlign: "center",
                                    padding: "60px 0",
                                }}
                            >
                                <Spin size="large" />
                            </Col>
                        ) : (
                            topBest.map((p, idx) => (
                                <Col xs={12} sm={12} md={6} key={p.productId}>
                                    <Badge.Ribbon
                                        text={`Top ${idx + 1}`}
                                        color={
                                            idx === 0
                                                ? "gold"
                                                : idx === 1
                                                ? "silver"
                                                : "#CD7F32"
                                        }
                                    >
                                        <Card
                                            hoverable
                                            style={styles.productCard}
                                            bodyStyle={{ padding: "16px" }}
                                            cover={
                                                <div
                                                    style={
                                                        styles.productImageWrapper
                                                    }
                                                    onMouseEnter={() =>
                                                        setHovered(p.productId)
                                                    }
                                                    onMouseLeave={() =>
                                                        setHovered(null)
                                                    }
                                                >
                                                    <img
                                                        src={getImage(
                                                            p.productId
                                                        )}
                                                        style={{
                                                            ...styles.productImage,
                                                            transform:
                                                                hovered ===
                                                                p.productId
                                                                    ? "scale(1.06)"
                                                                    : "scale(1)",
                                                        }}
                                                        alt={p.tenSanPham}
                                                        loading="lazy"
                                                    />
                                                    <div
                                                        style={{
                                                            ...styles.productOverlay,
                                                            opacity:
                                                                hovered ===
                                                                p.productId
                                                                    ? 1
                                                                    : 0,
                                                        }}
                                                    >
                                                        <Tooltip title="Mua ngay">
                                                            <Button
                                                                type="primary"
                                                                // shape="circle"
                                                                size="middle"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    navigate(
                                                                        `/products/${p.productId}`
                                                                    );
                                                                }}
                                                            >
                                                                Mua ngay
                                                            </Button>
                                                        </Tooltip>
                                                        <div
                                                            style={{
                                                                width: 12,
                                                            }}
                                                        />
                                                        <Tooltip title="Xem chi tiết">
                                                            <Button
                                                                type="default"
                                                                ghost
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    navigate(
                                                                        `/products/${p.productId}`
                                                                    );
                                                                }}
                                                            >
                                                                Xem
                                                            </Button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/products/${p.productId}`
                                                )
                                            }
                                        >
                                            <h4 style={styles.productName}>
                                                {p.tenSanPham}
                                            </h4>
                                            <div style={styles.productPrice}>
                                                ₫
                                                {getMinPrice(
                                                    p.variants
                                                ).toLocaleString()}
                                            </div>
                                            <div style={styles.soldText}>
                                                <FireOutlined
                                                    style={{
                                                        color: "#FF4D4F",
                                                        marginRight: 4,
                                                    }}
                                                />
                                                Đã bán {p.daBan}
                                            </div>
                                        </Card>
                                    </Badge.Ribbon>
                                </Col>
                            ))
                        )}
                    </Row>
                </div>

                {/* CATEGORIES */}
                <div style={styles.categorySection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Danh Mục Sản Phẩm</h2>
                        <p style={styles.sectionSubtitle}>
                            Khám phá các bộ sưu tập đa dạng
                        </p>
                    </div>

                    <Row gutter={[24, 24]}>
                        {categories.map((c) => (
                            <Col xs={12} sm={12} md={6} key={c.id}>
                                <Card
                                    hoverable
                                    style={styles.categoryCard}
                                    bodyStyle={{ padding: 0 }}
                                    onClick={() => navigate("/products")}
                                >
                                    <div style={styles.categoryImageWrapper}>
                                        <img
                                            src={c.image}
                                            style={styles.categoryImage}
                                            alt={c.name}
                                            loading="lazy"
                                        />
                                        <div style={styles.categoryOverlay}>
                                            <h3 style={styles.categoryName}>
                                                {c.name}
                                            </h3>
                                            <p style={styles.categoryDesc}>
                                                {c.description}
                                            </p>
                                            <Button
                                                type="primary"
                                                ghost
                                                icon={<RightOutlined />}
                                            >
                                                Xem Ngay
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* BRAND STORY */}
                <div style={styles.brandSection}>
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} md={12}>
                            <img
                                src={carouselImages[0]}
                                style={styles.brandImage}
                                alt="StyleWear Brand"
                                loading="lazy"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <h2 style={styles.brandTitle}>Về StyleWear</h2>
                            <p style={styles.brandText}>
                                Chúng tôi là thương hiệu thời trang hiện đại,
                                cam kết mang đến những sản phẩm chất lượng cao
                                với thiết kế độc đáo và giá cả hợp lý.
                            </p>
                            <p style={styles.brandText}>
                                Với hơn 5 năm kinh nghiệm trong ngành, StyleWear
                                đã trở thành điểm đến tin cậy cho những ai yêu
                                thích phong cách trẻ trung, năng động.
                            </p>
                            <Button
                                type="primary"
                                size="large"
                                style={styles.brandButton}
                                onClick={() => navigate("/products")}
                            >
                                Khám Phá Thêm
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Content>

            {/* ================= FOOTER ================= */}
        </Layout>
    );
};

/* ================== DATA ================== */
const carouselImages = [
    "https://content.pancake.vn/1/s2360x2950/ac/7e/2d/d2/11a51615a03a8918bda28100852b0ec9783634c7c43beaa4cf2103f7-w:3000-h:3750-l:908357-t:image/jpeg.jpeg",
    "https://content.pancake.vn/1/s2360x2950/50/5c/3b/c5/0987a112f0369bd2700c69b82a42c6f0c571fd06a0f45ddf787c1671-w:3000-h:3750-l:966537-t:image/jpeg.jpeg",
    "https://content.pancake.vn/1/s2360x2950/6e/b4/d2/90/bc083c630c414ca4d1b14c67af364e88f6906cd7e6fd709fc29133d2-w:3000-h:3750-l:696235-t:image/jpeg.jpeg",
];

const categories = [
    {
        id: 1,
        name: "Áo Phông Nam",
        description: "Trẻ trung – Năng động",
        image: carouselImages[0],
    },
    {
        id: 2,
        name: "Áo Phông Nữ",
        description: "Thời trang – Cá tính",
        image: carouselImages[1],
    },
    {
        id: 3,
        name: "Áo Phông Unisex",
        description: "Phong cách – Hiện đại",
        image: carouselImages[2],
    },
    {
        id: 4,
        name: "Áo Phông Oversize",
        description: "Thoải mái – Streetwear",
        image: carouselImages[0],
    },
];

const features = [
    {
        icon: "🚚",
        title: "Miễn Phí Vận Chuyển",
        desc: "Đơn hàng từ 500K",
    },
    {
        icon: "💳",
        title: "Thanh Toán An Toàn",
        desc: "100% bảo mật",
    },
    {
        icon: "🔄",
        title: "Đổi Trả 7 Ngày",
        desc: "Miễn phí đổi size",
    },
    {
        icon: "🎁",
        title: "Quà Tặng Hấp Dẫn",
        desc: "Ưu đãi mỗi ngày",
    },
];

/* ================== STYLE ================== */
const styles = {
    layout: {
        background: "#ffffff",
    },
    heroSection: {
        height: "520px",
        position: "relative",
        backgroundImage: `url('https://content.pancake.vn/1/s2360x2950/0c/08/c4/fe/0d4cab0e2f469f44164457126b73c5afd037891e0587ea74c31fca07-w:3000-h:3750-l:951876-t:image/jpeg.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    heroOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
            "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)",
    },
    heroContent: {
        position: "relative",
        zIndex: 2,
        maxWidth: 1400,
        margin: "0 auto",
        padding: "0 60px",
        width: "100%",
    },
    heroTextBox: {
        maxWidth: 650,
    },
    heroBadge: {
        display: "inline-block",
        backgroundColor: "#FF4D4F",
        color: "white",
        padding: "8px 20px",
        borderRadius: "30px",
        fontSize: "14px",
        fontWeight: 600,
        marginBottom: 24,
        letterSpacing: "1px",
    },
    heroTitle: {
        fontSize: "48px",
        color: "white",
        fontWeight: 900,
        lineHeight: 1.2,
        marginBottom: 20,
        textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
    },
    heroTitleAccent: {
        color: "#FF4D4F",
        display: "block",
    },
    heroSubtitle: {
        fontSize: "16px",
        color: "rgba(255,255,255,0.95)",
        marginBottom: 40,
        lineHeight: 1.6,
        maxWidth: 550,
    },
    heroButtons: {
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
    },
    heroPrimaryButton: {
        backgroundColor: "#FF4D4F",
        borderColor: "#FF4D4F",
        height: 48,
        padding: "0 40px",
        fontSize: "16px",
        fontWeight: 600,
        borderRadius: "28px",
        boxShadow: "0 8px 24px rgba(255,77,79,0.4)",
        transition: "all 0.3s",
    },
    heroSecondaryButton: {
        height:48,
        padding: "0 40px",
        fontSize: "16px",
        fontWeight: 600,
        borderRadius: "28px",
        backgroundColor: "transparent",
        borderColor: "white",
        color: "white",
        transition: "all 0.3s",
    },
    featuresBanner: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "32px 40px",
    },
    featureItem: {
        textAlign: "center",
        color: "white",
    },
    featureIcon: {
        fontSize: "36px",
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: "18px",
        fontWeight: 700,
        marginBottom: 8,
        color: "white",
    },
    featureDesc: {
        fontSize: "14px",
        color: "rgba(255,255,255,0.9)",
        margin: 0,
    },
    content: {
        padding: "56px 40px",
        background: "#F9FAFB",
    },
    sectionHeader: {
        textAlign: "center",
        marginBottom: 48,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
    },
    sectionTitle: {
        fontSize: "32px",
        fontWeight: 800,
        marginBottom: 8,
        color: "#1a1a1a",
    },
    sectionSubtitle: {
        fontSize: "16px",
        color: "#666",
        margin: 0,
    },
    viewAllButton: {
        fontSize: "16px",
        fontWeight: 600,
        color: "#FF4D4F",
    },
    carouselWrapper: {
        padding: "0 20px",
    },
    carouselImageContainer: {
        position: "relative",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    },
    carouselImage: {
        width: "100%",
        height: "420px",
        objectFit: "cover",
        display: "block",
    },
    carouselOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "24px",
        background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: 0,
        transition: "opacity 0.3s",
    },
    carouselButton: {
        backgroundColor: "white",
        color: "#1a1a1a",
        borderColor: "white",
        height: 40,
        padding: "0 24px",
        fontSize: "16px",
        fontWeight: 600,
        borderRadius: "24px",
    },
    productSection: {
        marginBottom: 80,
    },
    productCard: {
        borderRadius: "16px",
        overflow: "hidden",
        border: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
    },
    productImageWrapper: {
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
    },
    productImage: {
        width: "100%",
        height: "260px",
        objectFit: "cover",
        transition: "transform 0.5s ease",
    },
    productOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: 0,
        transition: "opacity 0.3s",
    },
    productName: {
        fontSize: "16px",
        fontWeight: 600,
        marginBottom: 8,
        color: "#1a1a1a",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    productPrice: {
        fontSize: "18px",
        fontWeight: 700,
        color: "#FF4D4F",
        marginBottom: 4,
    },
    soldText: {
        fontSize: "13px",
        color: "#888",
        display: "flex",
        alignItems: "center",
    },
    categorySection: {
        marginBottom: 80,
    },
    categoryCard: {
        borderRadius: "16px",
        overflow: "hidden",
        border: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
    },
    categoryImageWrapper: {
        position: "relative",
        height: "240px",
        overflow: "hidden",
    },
    categoryImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "transform 0.5s ease",
    },
    categoryOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
    },
    categoryName: {
        fontSize: "24px",
        fontWeight: 700,
        color: "white",
        marginBottom: 8,
    },
    categoryDesc: {
        fontSize: "14px",
        color: "rgba(255,255,255,0.9)",
        marginBottom: 16,
    },
    brandSection: {
        padding: "80px 0",
        background: "white",
        borderRadius: "24px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        marginTop: 40,
    },
    brandImage: {
        width: "100%",
        borderRadius: "16px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
    },
    brandTitle: {
        fontSize: "42px",
        fontWeight: 800,
        marginBottom: 24,
        color: "#1a1a1a",
    },
    brandText: {
        fontSize: "16px",
        lineHeight: 1.8,
        color: "#666",
        marginBottom: 16,
    },
    brandButton: {
        marginTop: 24,
        backgroundColor: "#FF4D4F",
        borderColor: "#FF4D4F",
        height: 48,
        padding: "0 32px",
        fontSize: "16px",
        fontWeight: 600,
        borderRadius: "24px",
    },
    footer: {
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        padding: "60px 60px 20px",
        color: "#ffffff",
    },
    footerTitle: {
        fontSize: "28px",
        fontWeight: 800,
        marginBottom: 16,
        color: "#FF4D4F",
    },
    footerText: {
        fontSize: "14px",
        color: "rgba(255,255,255,0.8)",
        lineHeight: 1.6,
    },
    footerHeading: {
        fontSize: "18px",
        fontWeight: 700,
        marginBottom: 16,
        color: "white",
    },
    footerLinks: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    footerLink: {
        color: "rgba(255,255,255,0.8)",
        textDecoration: "none",
        fontSize: "14px",
    },
};

export default Home;