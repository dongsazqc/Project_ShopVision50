import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Spin,
  Pagination,
  Tag,
  Slider,
  Checkbox,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

const { Title } = Typography;

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [filterCategory, setFilterCategory] = useState([]);
  const [filterPrice, setFilterPrice] = useState([0, 500000]);
  const [filterTop, setFilterTop] = useState(false);
  const [filterNew, setFilterNew] = useState(false);

  const categories = [
    "Áo Phông Nam",
    "Áo Phông Nữ",
    "Áo Phông Unisex",
    "Áo Phông Oversize",
  ];

  useEffect(() => {
    fetchVariants();
  }, []);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ProductVariant");
      const variantList = res.data?.$values || [];
      setVariants(variantList);

      const groupedProducts = groupVariantsToProducts(variantList);
      setProducts(groupedProducts);

      groupedProducts.forEach((p) => fetchImages(p.productId));
    } catch (error) {
      console.error("Lỗi load variants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async (productId) => {
    try {
      const res = await api.get(`/products/${productId}/images/checkimages`);
      const imgs = res.data?.$values || [];
      setImages((prev) => ({ ...prev, [productId]: imgs }));
    } catch (error) {
      console.error("Lỗi load ảnh productId=" + productId, error);
    }
  };

  const groupVariantsToProducts = (variants) => {
    const map = {};
    variants.forEach((v) => {
      if (!map[v.productId]) {
        map[v.productId] = {
          productId: v.productId,
          tenSanPham: v.tenSanPham,
          variants: [],
          topSelling: Math.random() > 0.7,
          isNew: Math.random() > 0.5,
        };
      }
      map[v.productId].variants.push(v);
    });
    return Object.values(map);
  };

  const getMinPrice = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map((v) => Number(v.giaBan)));
  };

  const getMainImage = (productId) => {
    const imgs = images[productId];
    if (!imgs || imgs.length === 0)
      return "https://via.placeholder.com/300x300?text=No+Image";
    const main = imgs.find((i) => i.isMain);
    const img = main || imgs[0];
    return `http://160.250.5.26:5000${img.url}`;
  };

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      filterCategory.length === 0 || filterCategory.includes(p.tenSanPham);

    const minPrice = getMinPrice(p.variants);
    const matchPrice = minPrice >= filterPrice[0] && minPrice <= filterPrice[1];

    const matchTop = filterTop ? p.topSelling : true;
    const matchNew = filterNew ? p.isNew : true;

    return matchCategory && matchPrice && matchTop && matchNew;
  });

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div style={{ display: "flex", padding: 40, background: "#f5f5f5" }}>
      {/* Sidebar */}
      <div style={{ width: 250, marginRight: 30 }}>
        <Title level={4}>Lọc sản phẩm</Title>

        <div style={{ marginBottom: 20 }}>
          <Title level={5}>Danh mục</Title>
          <Checkbox.Group
            options={categories}
            value={filterCategory}
            onChange={setFilterCategory}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <Title level={5}>Tầm giá (VNĐ)</Title>
          <Slider
            range
            min={0}
            max={1000000}
            step={50000}
            value={filterPrice}
            onChange={setFilterPrice}
          />
          <div>
            {filterPrice[0].toLocaleString()} - {filterPrice[1].toLocaleString()}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <Checkbox checked={filterTop} onChange={(e) => setFilterTop(e.target.checked)}>
            Top bán chạy
          </Checkbox>
          <br />
          <Checkbox checked={filterNew} onChange={(e) => setFilterNew(e.target.checked)}>
            Sản phẩm mới
          </Checkbox>
        </div>

        <Button
          type="default"
          block
          onClick={() => {
            setFilterCategory([]);
            setFilterPrice([0, 500000]);
            setFilterTop(false);
            setFilterNew(false);
          }}
        >
          Reset filter
        </Button>
      </div>

      {/* Products Grid */}
      <div style={{ flex: 1 }}>
       
        {loading ? (
          <Spin size="large" style={{ marginTop: 50, display: "block", textAlign: "center" }} />
        ) : (
          <Row gutter={[24, 24]}>
            {paginatedProducts.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.productId}>
<Card
  hoverable
  onClick={() => navigate(`/products/${product.productId}`)}
  style={{
    borderRadius: 8,
    overflow: "hidden",
    height: 340,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  }}
  bodyStyle={{ padding: 10 }}
  cover={
    <div style={{ position: "relative" }}>
      <img
        src={getMainImage(product.productId)}
        alt={product.tenSanPham}
        style={{
          width: "100%",
          height: 180,
          objectFit: "cover",
          background: "#f5f5f5",
        }}
      />

      {/* Badge giảm giá */}
      {product.giamGia && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#f5222d",
            color: "#fff",
            padding: "2px 6px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 4,
          }}
        >
          -{product.giamGia}%
        </div>
      )}
    </div>
  }
>
  {/* Tên sản phẩm */}
  <div
    style={{
      fontSize: 14,
      fontWeight: 500,
      lineHeight: "18px",
      height: 36,
      overflow: "hidden",
      marginBottom: 6,
    }}
  >
    {product.tenSanPham}
  </div>

  {/* Giá */}
  <div style={{ marginBottom: 6 }}>
    <span style={{ color: "#d0011b", fontSize: 16, fontWeight: 700 }}>
      ₫{getMinPrice(product.variants).toLocaleString()}
    </span>
  </div>

  {/* Rating + đã bán */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 12,
      color: "#888",
      marginBottom: 8,
    }}
  >
    <div>
      ⭐ {product.rating || 4.8}
    </div>
    <div>
      Đã bán {product.daBan || 120}
    </div>
  </div>

  {/* Nút mua */}
  <Button
    type="primary"
    block
    size="small"
    style={{
      background: "#ee4d2d",
      borderColor: "#ee4d2d",
      fontWeight: 600,
      borderRadius: 4,
    }}
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/products/${product.productId}`);
    }}
  >
    Mua ngay
  </Button>
</Card>
              </Col>
            ))}
          </Row>
        )}

        <div style={{ marginTop: 30, textAlign: "center" }}>
          <Pagination
            current={page}
            total={filteredProducts.length}
            pageSize={pageSize}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Products;
