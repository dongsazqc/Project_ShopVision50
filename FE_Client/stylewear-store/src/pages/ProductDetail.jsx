import React from "react";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams(); // Lấy id từ URL
  return (
    <div>
      <h2>Product Detail Page</h2>
      <p>Chi tiết sản phẩm có ID: {id}</p>
    </div>
  );
};

export default ProductDetail;
