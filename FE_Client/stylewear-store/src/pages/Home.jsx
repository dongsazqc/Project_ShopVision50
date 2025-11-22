import React from "react";
import { Layout, Row, Col, Button, Card, Carousel } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

const { Content } = Layout;

const Home = () => {
  const imageLink =
    "https://content.pancake.vn/1/s2360x2950/ac/7e/2d/d2/11a51615a03a8918bda28100852b0ec9783634c7c43beaa4cf2103f7-w:3000-h:3750-l:908357-t:image/jpeg.jpeg";

  return (
    <Layout>
      {/* Banner Quảng Cáo */}
      <div style={{ ...styles.banner, backgroundImage: `url(${imageLink})` }}>
        <div style={styles.bannerOverlay}>
          <h1 style={styles.bannerTitle}>Khuyến Mãi Lớn! Giảm Giá Đến 50%</h1>
          <p style={styles.bannerText}>
            Khám phá bộ sưu tập áo phông độc đáo, phong cách thời trang hiện đại.
          </p>
          <Button type="primary" size="large" style={styles.bannerButton}>
            Mua Ngay
          </Button>
        </div>
      </div>

      <Content style={styles.content}>
        <Row gutter={[32, 32]}>
          {/* Giới thiệu Thương Hiệu */}
          <Col span={24}>
            <div style={styles.brandIntro}>
              <h2 style={styles.sectionTitle}>Về StyleWear</h2>
              <p style={styles.brandIntroText}>
                Chúng tôi cung cấp áo phông chất lượng cao, đa dạng phong cách, 
                phù hợp mọi lứa tuổi, giúp bạn luôn nổi bật trong mọi hoàn cảnh.
              </p>
            </div>
          </Col>

          {/* Bộ sưu tập áo phông nổi bật */}
          <Col span={24}>
            <div style={styles.carouselContainer}>
              <h2 style={styles.sectionTitle}>Bộ Sưu Tập Nổi Bật</h2>
              <Carousel autoplay dotPosition="bottom">
                <div>
                  <img src={imageLink} alt="Áo Phông Nam" style={styles.carouselImage} />
                </div>
                <div>
                  <img src={imageLink} alt="Áo Phông Nữ" style={styles.carouselImage} />
                </div>
                <div>
                  <img src={imageLink} alt="Áo Phông Unisex" style={styles.carouselImage} />
                </div>
              </Carousel>
            </div>
          </Col>

          {/* Danh mục sản phẩm */}
          <Col span={24}>
            <div style={styles.categoryList}>
              <h2 style={styles.sectionTitle}>Danh Mục Sản Phẩm</h2>
              <Row gutter={[16, 16]}>
                {categories.map((category) => (
                  <Col xs={24} sm={12} md={6} key={category.id}>
                    <Card
                      hoverable
                      cover={<img alt={category.name} src={imageLink} style={styles.categoryImage} />}
                      style={styles.card}
                    >
                      <Card.Meta title={category.name} description={category.description} />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
        </Row>
      </Content>

      {/* Footer */}
      <div style={styles.footer}>
        <p>© 2025 StyleWear - Mua sắm trực tuyến, giao hàng tận nơi.</p>
        <Button
          icon={<ShoppingCartOutlined />}
          size="large"
          style={styles.footerButton}
        >
          Xem Giỏ Hàng
        </Button>
      </div>
    </Layout>
  );
};

// Danh mục sản phẩm
const categories = [
  { id: 1, name: "Áo Phông Nam", description: "Thiết kế trẻ trung, năng động cho nam giới." },
  { id: 2, name: "Áo Phông Nữ", description: "Phong cách nữ tính, dễ phối đồ và thoải mái." },
  { id: 3, name: "Áo Phông Unisex", description: "Phù hợp mọi phong cách và giới tính." },
  { id: 4, name: "Áo Phông Oversize", description: "Thoải mái, cá tính với form oversize." },
];

// Style
const styles = {
  banner: {
    height: "600px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerOverlay: {
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: "60px",
    borderRadius: "12px",
    textAlign: "center",
  },
  bannerTitle: {
    color: "white",
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  bannerText: {
    color: "white",
    fontSize: "20px",
    marginBottom: "30px",
  },
  bannerButton: {
    backgroundColor: "#FF5733",
    border: "none",
    color: "#fff",
    fontWeight: "600",
    padding: "0 40px",
    fontSize: "16px",
  },
  content: {
    padding: "60px 50px",
    backgroundColor: "#f9f9f9",
  },
  brandIntro: {
    textAlign: "center",
    marginBottom: "50px",
  },
  brandIntroText: {
    fontSize: "18px",
    color: "#555",
    lineHeight: "1.6",
  },
  sectionTitle: {
    fontSize: "32px",
    fontWeight: "600",
    marginBottom: "25px",
    textAlign: "center",
  },
  carouselContainer: {
    marginBottom: "60px",
  },
  carouselImage: {
    width: "100%",
    height: "450px",
    objectFit: "cover",
    borderRadius: "12px",
  },
  categoryList: {
    marginBottom: "60px",
  },
  categoryImage: {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    borderRadius: "12px",
  },
  card: {
    borderRadius: "12px",
    overflow: "hidden",
    transition: "transform 0.3s",
  },
  footer: {
    backgroundColor: "#1a1a1a",
    color: "white",
    textAlign: "center",
    padding: "30px 20px",
  },
  footerButton: {
    backgroundColor: "#FF5733",
    borderColor: "#FF5733",
    color: "white",
    marginTop: "15px",
  },
};

export default Home;
