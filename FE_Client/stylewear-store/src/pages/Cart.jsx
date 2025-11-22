import { useState } from "react";
import { Card, Button, Image, Tag, message } from "antd";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [hoverImage, setHoverImage] = useState(product.images[0] || "");

  const handleAddToCart = () => {
    // Chỉ add vào giỏ hàng sản phẩm có ít nhất 1 biến thể
    if (!product.variants || product.variants.length === 0) {
      message.warning("Sản phẩm này hiện chưa có hàng.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const firstVariant = product.variants[0];

    const itemToAdd = {
      variantId: firstVariant.productVariantId,
      productId: product.productId,
      name: product.tenSanPham,
      giaBan: firstVariant.giaBan,
      quantity: 1,
      color: firstVariant.tenMau,
      size: firstVariant.tenKichCo,
    };

    const existing = cart.find(i => i.variantId === itemToAdd.variantId);
    if (existing) existing.quantity += 1;
    else cart.push(itemToAdd);

    localStorage.setItem("cart", JSON.stringify(cart));
    message.success("Đã thêm vào giỏ hàng");
  };

  return (
    <Card
      hoverable
      style={{ borderRadius: 12 }}
      cover={
        <Image
          src={hoverImage || "https://via.placeholder.com/200"}
          preview={false}
          onMouseOver={() => setHoverImage(product.images[1] || product.images[0])}
          onMouseOut={() => setHoverImage(product.images[0])}
        />
      }
      onClick={() => navigate(`/product/${product.productId}`)}
    >
      <h4 style={{ marginBottom: 8 }}>{product.tenSanPham}</h4>
      <div style={{ marginBottom: 8 }}>
        <Tag color="red">HOT</Tag>
        <Tag color="green">Freeship</Tag>
      </div>
      <p style={{ fontWeight: 600, color: "#ee4d2d" }}>
        {Math.min(...product.variants.map(v => v.giaBan)).toLocaleString("vi-VN")} ₫
      </p>
      <Button
        type="primary"
        style={{ width: "100%", marginTop: 8 }}
        onClick={e => {
          e.stopPropagation(); // tránh navigate khi bấm add
          handleAddToCart();
        }}
      >
        Thêm vào giỏ
      </Button>
    </Card>
  );
};

export default ProductCard;
