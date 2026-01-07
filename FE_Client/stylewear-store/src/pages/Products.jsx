import { useEffect, useState, useMemo } from "react";
import {
    Row,
    Col,
    Card,
    Button,
    Spin,
    Pagination,
    Checkbox,
    Slider,
    Typography,
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/axios";

const { Title } = Typography;

const Products = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [topProductIds, setTopProductIds] = useState([]);
    const [searchParams] = useSearchParams();
    const keyword = useMemo(
        () => searchParams.get("keyword") || "",
        [searchParams]
    );

    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [filterCategory, setFilterCategory] = useState([]);
    const [filterPrice, setFilterPrice] = useState([0, 500000]);
    const [filterTop, setFilterTop] = useState(false);
    const [filterNew, setFilterNew] = useState(false);

    // ===== FETCH DATA =====
    useEffect(() => {
        fetchCategories();
        fetchTopProducts();
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get("/Category/GetAll");
            const list = res.data?.$values || res.data || [];
            setCategories(list);
        } catch (err) {
            console.error("Lỗi load categories:", err);
        }
    };

    const fetchTopProducts = async () => {
        try {
            const res = await api.get("/TopSanPham");
            const ids = res.data?.map((item) => item.productId) || [];
            setTopProductIds(ids);
        } catch (err) {
            console.error("Lỗi load top products:", err);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/Products/getAllProducts");
            if (!res.data?.length) return setProducts([]);

            const productsWithImages = await Promise.all(
                res.data.map(async (item) => {
                    try {
                        const imgRes = await api.get(
                            `/products/${item.productId}/images/checkimages`
                        );
                        const img = imgRes.data[0]?.url || "";
                        const price = imgRes.data[0]?.product?.price || 0;
                        return {
                            ...item,
                            price,
                            image: `http://160.250.5.26:5000${img}`,
                            tenSanPham: item.tenSanPham || item.name,
                        };
                    } catch (err) {
                        console.error(
                            `Lỗi fetch ảnh product ${item.productId}:`,
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
        } catch (err) {
            console.error("Lỗi load products:", err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // ===== FILTER & PAGINATION =====
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchCategory =
                !filterCategory.length || filterCategory.includes(p.categoryId);
            const price = p.price || 0;
            const matchPrice =
                price >= filterPrice[0] && price <= filterPrice[1];
            const matchTop = filterTop
                ? topProductIds.includes(p.productId)
                : true;
            const matchNew = filterNew
                ? (() => {
                      if (p.isNew !== undefined) return p.isNew;
                      if (p.createdDate) {
                          const created = new Date(p.createdDate);
                          const thirtyDaysAgo = new Date();
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                          return created >= thirtyDaysAgo;
                      }
                      return false;
                  })()
                : true;
            const isMatchKeyword = keyword
                ? p.tenSanPham.toLowerCase().includes(keyword.toLowerCase())
                : true;

            return (
                matchCategory &&
                matchPrice &&
                matchTop &&
                matchNew &&
                isMatchKeyword
            );
        });
    }, [
        products,
        filterCategory,
        filterPrice,
        filterTop,
        filterNew,
        topProductIds,
        keyword,
    ]);

    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, page]);

    const getMainImage = (product) =>
        product?.image || "https://via.placeholder.com/300x300?text=No+Image";

    // const handleBuyNow = () => {
    //     if (!activeVariant) return;
    //     const buyNowData = {
    //         variantId: activeVariant.productVariantId,
    //         productId: product.productId,
    //         name: product.name,
    //         giaBan: activeVariant.giaBan,
    //         quantity,
    //         color: selectedColor,
    //         size: selectedSize,
    //         image: activeImage,
    //     };
    //     sessionStorage.setItem("buyNow", JSON.stringify(buyNowData));
    //     navigate("/checkout");
    // };

    // ===== RENDER =====
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
                                        borderRadius: 14,
                                        overflow: "hidden",
                                        boxShadow:
                                            "0 6px 18px rgba(0,0,0,0.08)",
                                        transition:
                                            "transform 0.3s, box-shadow 0.3s",
                                        cursor: "pointer",
                                    }}
                                    bodyStyle={{ padding: 12 }}
                                    cover={
                                        <div
                                            style={{
                                                width: "100%",
                                                height: 250,
                                                overflow: "hidden",
                                                borderRadius: 12,
                                                background: "#f5f5f5",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                position: "relative",
                                            }}
                                        >
                                            <img
                                                src={getMainImage(product)}
                                                alt={
                                                    product.tenSanPham ||
                                                    product.name
                                                }
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    transition:
                                                        "transform 0.3s",
                                                }}
                                            />
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
                                    <div
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 600,
                                            lineHeight: "20px",
                                            height: 40,
                                            overflow: "hidden",
                                            marginBottom: 6,
                                        }}
                                    >
                                        {product.tenSanPham || product.name}
                                    </div>

                                    <div style={{ marginBottom: 12 }}>
                                        <span
                                            style={{
                                                color: "#d0011b",
                                                fontSize: 18,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {product.price?.toLocaleString() ||
                                                0}
                                            ₫
                                        </span>
                                    </div>

                                    <Button
                                        type="primary"
                                        block
                                        size="middle"
                                        style={{
                                            background: "#ee4d2d",
                                            borderColor: "#ee4d2d",
                                            fontWeight: 600,
                                            borderRadius: 6,
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
                        onChange={setPage}
                        showSizeChanger={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default Products;
