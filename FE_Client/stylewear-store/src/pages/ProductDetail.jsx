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
} from "antd";
import api from "../utils/axios";
import { useAppContext } from "../context/AppContext";

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

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const resProduct = await api.get(
                    `/ProductVariant/${id}/variants`
                );
                const data = resProduct.data;

                const rawVariants =
                    data.variants?.$values || data.variants || [];

                const resImages = await api.get(
                    `/products/${id}/images/checkimages`
                );
                const images =
                    resImages.data
                        ?.map((img) => img.url)
                        .filter(Boolean)
                        .map((url) => baseURL + url) || [];

                setProduct({
                    productId: data.productId,
                    name: data.tenSanPham || data.name,
                    description: data.description || "",
                    images,
                });
                setVariants(rawVariants);
                setActiveImage(images[0] || null);
            } catch (err) {
                console.error(err);
                message.error("Không thể tải thông tin sản phẩm");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (selectedColor && selectedSize) {
            setActiveVariant(
                variants.find(
                    (v) =>
                        v.tenMau === selectedColor &&
                        v.tenKichCo === selectedSize
                ) || null
            );
            setQuantity(1);
        } else {
            setActiveVariant(null);
        }
    }, [selectedColor, selectedSize, variants]);

    const colors = [...new Set(variants.map((v) => v.tenMau).filter(Boolean))];
    const sizes = [
        ...new Set(variants.map((v) => v.tenKichCo).filter(Boolean)),
    ];
    const minPrice = variants.length
        ? Math.min(...variants.map((v) => Number(v.giaBan)))
        : 0;
    const isVariantSelected = !!activeVariant;

    const handleAddToCart = () => {
        if (!activeVariant) return;
        const token = localStorage.getItem("token");

        if (!token) {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            const existing = cart.find(
                (item) => item.variantId === activeVariant.productVariantId
            );
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

        setTimeout(()=>{
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

    if (loading) return <Spin style={{ marginTop: 100 }} size="large" />;
    if (!product)
        return (
            <Empty
                description="Sản phẩm không tồn tại"
                style={{ marginTop: 100 }}
            />
        );

    return (
        <div style={{ padding: 24 }}>
            <Row gutter={[24, 24]}>
                {/* Hình ảnh */}
                <Col xs={24} md={10}>
                    <Card style={{ borderRadius: 16, overflow: "hidden" }}>
                        <Image
                            src={
                                activeImage || "https://via.placeholder.com/400"
                            }
                            width="100%"
                            style={{ borderRadius: 16 }}
                        />
                        {product.images.length > 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    marginTop: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                {product.images.map((img, index) => (
                                    <Image
                                        key={index}
                                        src={img}
                                        width={60}
                                        height={60}
                                        preview={false}
                                        style={{
                                            cursor: "pointer",
                                            borderRadius: 8,
                                            border:
                                                activeImage === img
                                                    ? "2px solid #ee4d2d"
                                                    : "1px solid #eee",
                                        }}
                                        onClick={() => setActiveImage(img)}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Thông tin */}
                <Col xs={24} md={14}>
                    <Card style={{ borderRadius: 16, padding: 24 }}>
                        <h2 style={{ marginBottom: 8 }}>{product.name}</h2>
                        <div style={{ marginBottom: 16 }}>
                            <Tag color="red">HOT</Tag>
                            <Tag color="green">Freeship</Tag>
                        </div>

                        <div
                            style={{
                                background: "#fff5f5",
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 16,
                            }}
                        >
                            <span style={{ fontSize: 14 }}>Giá từ </span>
                            <span
                                style={{
                                    fontSize: 28,
                                    color: "#ee4d2d",
                                    fontWeight: 600,
                                }}
                            >
                                {minPrice.toLocaleString("vi-VN")} ₫
                            </span>
                        </div>

                        {/* Chọn màu */}
                        {colors.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                                <strong>Màu sắc:</strong>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                        flexWrap: "wrap",
                                        marginTop: 8,
                                    }}
                                >
                                    {colors.map((c) => (
                                        <Button
                                            key={c}
                                            type={
                                                selectedColor === c
                                                    ? "primary"
                                                    : "default"
                                            }
                                            onClick={() => setSelectedColor(c)}
                                        >
                                            {c}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chọn size */}
                        {sizes.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                                <strong>Kích cỡ:</strong>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                        flexWrap: "wrap",
                                        marginTop: 8,
                                    }}
                                >
                                    {sizes.map((s) => (
                                        <Button
                                            key={s}
                                            type={
                                                selectedSize === s
                                                    ? "primary"
                                                    : "default"
                                            }
                                            onClick={() => setSelectedSize(s)}
                                        >
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Số lượng */}
                        <div
                            style={{
                                marginTop: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                            }}
                        >
                            <strong>Số lượng:</strong>
                            <InputNumber
                                min={1}
                                max={activeVariant?.soLuongTon || 99}
                                value={quantity}
                                onChange={(v) =>
                                    setQuantity(
                                        Math.min(
                                            v,
                                            activeVariant?.soLuongTon || 99
                                        )
                                    )
                                }
                            />
                            {activeVariant && (
                                <span style={{ color: "#888" }}>
                                    Còn {activeVariant.soLuongTon}
                                </span>
                            )}
                        </div>

                        {/* Nút hành động */}
                        <div
                            style={{ display: "flex", gap: 16, marginTop: 24 }}
                        >
                            <Button
                                style={{
                                    flex: 1,
                                    borderRadius: 8,
                                    background: isVariantSelected
                                        ? "#fff5f5"
                                        : "#ffe6e6",
                                    border: `1px solid ${
                                        isVariantSelected
                                            ? "#ee4d2d"
                                            : "#ff9999"
                                    }`,
                                    color: isVariantSelected
                                        ? "#ee4d2d"
                                        : "#ff9999",
                                    fontWeight: 600,
                                    height: 44,
                                }}
                                onClick={handleAddToCart}
                                disabled={!isVariantSelected}
                            >
                                Thêm vào giỏ
                            </Button>

                            <Button
                                style={{
                                    flex: 1,
                                    borderRadius: 8,
                                    background: isVariantSelected
                                        ? "#ee4d2d"
                                        : "#ff9999",
                                    border: `1px solid ${
                                        isVariantSelected
                                            ? "#ee4d2d"
                                            : "#ff9999"
                                    }`,
                                    color: "#fff",
                                    fontWeight: 600,
                                    height: 44,
                                }}
                                onClick={handleBuyNow}
                                disabled={!isVariantSelected}
                            >
                                Mua ngay
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Mô tả sản phẩm */}
            <Divider />
            <Card style={{ borderRadius: 16, padding: 16 }}>
                <h3>Mô tả sản phẩm</h3>
                <p style={{ color: "#666", whiteSpace: "pre-line" }}>
                    {product.description}
                </p>
            </Card>

            {/* Modal */}
            <Modal
                title="Thêm vào giỏ hàng"
                open={addedModalVisible}
                footer={[
                    <Button
                        key="view"
                        type="primary"
                        onClick={() => {
                            setAddedModalVisible(false);
                            navigate("/cart");
                        }}
                    >
                        Xem giỏ hàng
                    </Button>,
                    <Button
                        key="continue"
                        onClick={() => setAddedModalVisible(false)}
                    >
                        Tiếp tục mua sắm
                    </Button>,
                ]}
                onCancel={() => setAddedModalVisible(false)}
            >
                <p>Sản phẩm đã được thêm vào giỏ hàng thành công!</p>
            </Modal>
        </div>
    );
};

export default ProductDetail;
