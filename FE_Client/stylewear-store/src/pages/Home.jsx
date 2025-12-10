import React, { useEffect, useState } from "react";
import { Layout, Row, Col, Button, Card, Carousel, Spin } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

const { Content } = Layout;

const Home = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVariants();
  }, []);

  // ================= FETCH PRODUCTS =================
  const fetchVariants = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ProductVariant");
      const variants = res.data?.$values || [];
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
      const res = await api.get(`/products/${productId}/images/checkimages`);
      const imgs = res.data?.$values || [];
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
  const topBest = [...products]
    .sort((a, b) => b.daBan - a.daBan)
    .slice(0, 4);

  return (
    <Layout>
      {/* ================= HERO BANNER ================= */}
      <div style={styles.heroSection}>
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>Khuyến Mãi Cực Lớn - Giảm Đến 50%</h1>
          <p style={styles.heroSubtitle}>
            Bộ sưu tập áo phông phong cách hiện đại, chất liệu cao cấp.
          </p>
          <Button
            type="primary"
            size="large"
            style={styles.heroButton}
            onClick={() => navigate("/products")}
          >
            Mua Ngay
          </Button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <Content style={styles.content}>
        {/* BRAND STORY */}
        <Row justify="center" style={{ marginBottom: 60 }}>
          <Col xs={24} md={16} style={{ textAlign: "center" }}>
            <h2 style={styles.sectionTitle}>Về StyleWear</h2>
            <p style={styles.sectionText}>
              Thời trang chất lượng – phong cách hiện đại – giá cả hợp lý.
              StyleWear cam kết mang đến trải nghiệm tuyệt vời nhất.
            </p>
          </Col>
        </Row>

        {/* FEATURED COLLECTION - CAROUSEL */}
        <Row justify="center" style={{ marginBottom: 70 }}>
          <Col xs={24} md={20}>
            <h2 style={styles.sectionTitle}>Bộ Sưu Tập Nổi Bật</h2>
            <Carousel
              autoplay
              speed={1200}
              dots
              effect="fade"
              style={{ maxWidth: 900, margin: "0 auto" }}
            >
              {carouselImages.map((img, i) => (
                <div key={i} style={styles.carouselWrapper}>
                  <img src={img} style={styles.carouselImage} />
                </div>
              ))}
            </Carousel>
          </Col>
        </Row>

        {/* TOP NEW PRODUCTS */}
        <Row gutter={[32, 32]} style={{ marginBottom: 70 }}>
          <Col span={24}>
            <h2 style={styles.sectionTitle}>✨ Sản Phẩm Mới</h2>
          </Col>
          {loading ? (
            <Spin size="large" />
          ) : (
            topNew.map((p) => (
              <Col xs={12} md={6} key={p.productId}>
                <Card
                  hoverable
                  style={styles.productCard}
                  cover={
                    <img
                      src={getImage(p.productId)}
                      style={styles.productImage}
                      alt={p.tenSanPham}
                    />
                  }
                  onClick={() => navigate(`/products/${p.productId}`)}
                >
                  <b>{p.tenSanPham}</b>
                  <div style={styles.priceText}>
                    ₫{getMinPrice(p.variants).toLocaleString()}
                  </div>
                </Card>
              </Col>
            ))
          )}
        </Row>

        {/* TOP BEST SELLERS */}
        <Row gutter={[32, 32]} style={{ marginBottom: 70 }}>
          <Col span={24}>
            <h2 style={styles.sectionTitle}>🔥 Bán Chạy Nhất</h2>
          </Col>
          {loading ? (
            <Spin size="large" />
          ) : (
            topBest.map((p) => (
              <Col xs={12} md={6} key={p.productId}>
                <Card
                  hoverable
                  style={styles.productCard}
                  cover={
                    <img
                      src={getImage(p.productId)}
                      style={styles.productImage}
                      alt={p.tenSanPham}
                    />
                  }
                  onClick={() => navigate(`/products/${p.productId}`)}
                >
                  <b>{p.tenSanPham}</b>
                  <div style={styles.priceText}>
                    ₫{getMinPrice(p.variants).toLocaleString()}
                  </div>
                  <div style={styles.soldText}>Đã bán {p.daBan}</div>
                </Card>
              </Col>
            ))
          )}
        </Row>

        {/* CATEGORIES */}
        <Row gutter={[32, 32]}>
          <Col span={24}>
            <h2 style={styles.sectionTitle}>Danh Mục Sản Phẩm</h2>
          </Col>
          {categories.map((c) => (
            <Col xs={24} sm={12} md={6} key={c.id}>
              <Card
                hoverable
                style={styles.categoryCard}
                cover={
                  <div style={styles.categoryImageWrapper}>
                    <img
                      src={c.image}
                      style={styles.categoryImage}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.08)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    />
                  </div>
                }
                onClick={() => navigate("/products")}
              >
                <Card.Meta title={c.name} description={c.description} />
              </Card>
            </Col>
          ))}
        </Row>
      </Content>

      {/* ================= FOOTER ================= */}
      <div style={styles.footer}>
        <p>© 2025 StyleWear - Thời trang dành cho giới trẻ.</p>
        <Button
          icon={<ShoppingCartOutlined />}
          size="large"
          style={styles.footerButton}
          onClick={() => navigate("/cart")}
        >
          Xem Giỏ Hàng
        </Button>
      </div>
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

/* ================== STYLE ================== */
const styles = {
  heroSection: {
    height: "650px",
    backgroundImage:
      "url('https://content.pancake.vn/1/s2360x2950/0c/08/c4/fe/0d4cab0e2f469f44164457126b73c5afd037891e0587ea74c31fca07-w:3000-h:3750-l:951876-t:image/jpeg.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  heroOverlay: {
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: "60px 80px",
    borderRadius: "14px",
    textAlign: "center",
    animation: "fadeIn 1.2s ease",
  },
  heroTitle: {
    fontSize: "52px",
    color: "white",
    fontWeight: 800,
  },
  heroSubtitle: {
    fontSize: "20px",
    color: "#eee",
    marginTop: 10,
    marginBottom: 30,
  },
  heroButton: {
    backgroundColor: "#ff4d4f",
    padding: "12px 45px",
    fontSize: "18px",
    borderRadius: "10px",
  },
  content: {
    padding: "70px 60px",
    background: "#f8f8f8",
  },
  sectionTitle: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "34px",
    fontWeight: 700,
  },
  sectionText: {
    textAlign: "center",
    fontSize: "18px",
    color: "#555",
    maxWidth: 800,
    margin: "0 auto",
  },
  carouselWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  carouselImage: {
    width: "100%",
    maxWidth: 700,
    aspectRatio: "4 / 5",
    objectFit: "cover",
    borderRadius: 20,
    margin: "0 auto",
    transition: "transform 0.3s",
  },
  productCard: {
    borderRadius: 14,
    overflow: "hidden",
    background: "white",
    paddingBottom: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  productCardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 22px rgba(0,0,0,0.15)",
  },
  productImage: {
    height: 280,
    width: "100%",
    objectFit: "cover",
    borderRadius: 8,
  },
  priceText: {
    color: "#d0011b",
    fontWeight: 700,
    marginTop: 8,
  },
  soldText: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  categoryCard: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 12,
    background: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  categoryImageWrapper: {
    width: "100%",
    height: 260,
    borderRadius: 12,
    overflow: "hidden",
    background: "#fafafa",
    marginBottom: 12,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s",
  },
  footer: {
    background: "#111",
    color: "#ccc",
    textAlign: "center",
    padding: "35px",
    marginTop: 80,
  },
  footerButton: {
    marginTop: 12,
    background: "#ff4d4f",
    border: "none",
    color: "white",
  },
};

export default Home;
