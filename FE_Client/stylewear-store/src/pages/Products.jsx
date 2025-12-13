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
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [topProductIds, setTopProductIds] = useState([]);

    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [filterCategory, setFilterCategory] = useState([]);
    const [filterPrice, setFilterPrice] = useState([0, 500000]);
    const [filterTop, setFilterTop] = useState(false);
    const [filterNew, setFilterNew] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchTopProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get("/Category/GetAll");
            const categoryList = res.data?.$values || res.data || [];
            setCategories(categoryList);
        } catch (error) {
            console.error("Lỗi load categories:", error);
        }
    };

    const fetchTopProducts = async () => {
        try {
            const res = await api.get("/TopSanPham");
            if (res?.data?.length > 0) {
                // Lưu danh sách productIds của top products
                const ids = res.data.map((item) => item.productId);
                setTopProductIds(ids);
            }
        } catch (error) {
            console.error("Lỗi load top products:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/Products/getAllProducts");
            if (res?.data?.length > 0) {
                // Fetch ảnh cho từng sản phẩm và set trực tiếp vào product object
                const productsWithImages = await Promise.all(
                    res.data.map(async (item) => {
                        try {
                            const imageRes = await api.get(
                                `/products/${item.productId}/images/checkimages`
                            );
                            const img = imageRes.data[0]?.url || "";
                            const price = imageRes.data[0]?.product?.price || 0;
                            return {
                                ...item,
                                price: price,
                                image: `http://160.250.5.26:5000${img}`,
                                tenSanPham: item.tenSanPham || item.name,
                            };
                        } catch (err) {
                            console.error(
                                `Lỗi fetch ảnh cho product ${item.productId}:`,
                                err
                            );
                            return {
                                ...item,
                                price: item.price || 0,
                                image: "https://via.placeholder.com/300x300?text=No+Image",
                                tenSanPham: item.tenSanPham || item.name,
                            };
                        }
                    })
                );
                setProducts(productsWithImages);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Lỗi load products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const getMainImage = (product) => {
        return (
            product?.image ||
            "https://via.placeholder.com/300x300?text=No+Image"
        );
    };

    const filteredProducts = products.filter((p) => {
        const matchCategory =
            filterCategory.length === 0 ||
            filterCategory.includes(p.categoryId);

        const productPrice = p.price || 0;
        const matchPrice =
            productPrice >= filterPrice[0] && productPrice <= filterPrice[1];

        // Filter Top bán chạy: kiểm tra productId có trong danh sách top products
        const matchTop = filterTop ? topProductIds.includes(p.productId) : true;

        // Filter Sản phẩm mới: kiểm tra createdDate trong 30 ngày gần đây hoặc field isNew
        const matchNew = filterNew
            ? (() => {
                  if (p.isNew !== undefined) {
                      return p.isNew;
                  }
                  if (p.createdDate) {
                      const createdDate = new Date(p.createdDate);
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return createdDate >= thirtyDaysAgo;
                  }
                  return false;
              })()
            : true;

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
                        options={categories.map((cat) => ({
                            label: cat.name || cat.Name,
                            value: cat.categoryId || cat.CategoryId,
                        }))}
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
                        {filterPrice[0].toLocaleString()} -{" "}
                        {filterPrice[1].toLocaleString()}
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <Checkbox
                        checked={filterTop}
                        onChange={(e) => setFilterTop(e.target.checked)}
                    >
                        Top bán chạy
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={filterNew}
                        onChange={(e) => setFilterNew(e.target.checked)}
                    >
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
                    <Spin
                        size="large"
                        style={{
                            marginTop: 50,
                            display: "block",
                            textAlign: "center",
                        }}
                    />
                ) : (
                    <Row gutter={[24, 24]}>
                        {paginatedProducts.map((product) => (
                            <Col
                                xs={24}
                                sm={12}
                                md={8}
                                lg={6}
                                key={product.productId}
                            >
                                <Card
                                    hoverable
                                    onClick={() =>
                                        navigate(
                                            `/products/${product.productId}`
                                        )
                                    }
                                    style={{
                                        borderRadius: 8,
                                        overflow: "hidden",
                                        height: 340,
                                        boxShadow:
                                            "0 2px 10px rgba(0,0,0,0.08)",
                                    }}
                                    bodyStyle={{ padding: 10 }}
                                    cover={
                                        <div style={{ position: "relative" }}>
                                            <img
                                                src={getMainImage(product)}
                                                alt={
                                                    product.tenSanPham ||
                                                    product.name
                                                }
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
                                        {product.tenSanPham || product.name}
                                    </div>

                                    {/* Giá */}
                                    <div style={{ marginBottom: 6 }}>
                                        <span
                                            style={{
                                                color: "#d0011b",
                                                fontSize: 16,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {product.price?.toLocaleString() ||
                                                0}
                                            ₫
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
                                        <div>⭐ {product.rating || 4.8}</div>
                                        <div>
                                            Đã bán:{" "}
                                            {product.tongSoLuongBan ||
                                                product.daBan ||
                                                0}
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
                                            navigate(
                                                `/products/${product.productId}`
                                            );
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
