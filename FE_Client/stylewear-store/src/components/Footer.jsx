import React from "react";
import { Row, Col, Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        padding: "30px 40px 15px", // padding trên/dưới gọn
        color: "#ffffff",
      }}
    >
      <Row gutter={[24, 24]} justify="space-between" align="top">
        {/* Thương hiệu */}
        <Col xs={24} sm={8} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h3
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#FF4D4F",
              margin: 0,
            }}
          >
            StyleWear
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Thời trang dành cho giới trẻ - Phong cách hiện đại, chất lượng cao cấp.
          </p>
        </Col>

        {/* Liên kết */}
        <Col xs={24} sm={8} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h4
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "white",
              margin: 0,
            }}
          >
            Liên Kết
          </h4>
          <a href="/products" style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
            Sản Phẩm
          </a>
          <a href="/cart" style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
            Giỏ Hàng
          </a>
        </Col>

        {/* Theo dõi & giỏ hàng */}
        <Col xs={24} sm={8} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h4
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "white",
              margin: 0,
            }}
          >
            Theo Dõi
          </h4>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
            Facebook | Instagram | TikTok
          </p>
          <Button
            icon={<ShoppingCartOutlined />}
            size="large"
            style={{
              backgroundColor: "#FF4D4F",
              borderColor: "#FF4D4F",
              color: "white",
              fontWeight: 600,
            }}
            onClick={() => navigate("/cart")}
          >
            Xem Giỏ Hàng
          </Button>
        </Col>
      </Row>

      {/* Bottom */}
      <div
        style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: 14,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        © 2025 StyleWear. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
