import { useCallback, useEffect, useState } from "react";
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
} from "antd";
import api from "../utils/axios";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const baseURL = "http://160.250.5.26:5000";

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [activeVariant, setActiveVariant] = useState(null);
    const [activeImage, setActiveImage] = useState(null);

    // === Fetch product + variants + images ===
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);

                // === Lấy danh sách biến thể ===
                const resProduct = await api.get(
                    `/ProductVariant/${id}/variants`
                );
                const data = resProduct.data;

                const rawVariants = data.variants?.$values || [];

                // === Lấy danh sách ảnh ===
                const resImages = await api.get(
                    `/products/${id}/images/checkimages`
                );
                const images =
                    resImages.data?.$values
                        ?.map((img) => img.url)
                        .filter(Boolean)
                        .map((url) => baseURL + url) || [];

                const normalizedProduct = {
                    productId: data.productId,
                    name: data.tenSanPham,
                    description: data.description || "",
                    images,
                };

                setProduct(normalizedProduct);
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

    // === Khi chọn màu + size, tìm variant tương ứng ===
    useEffect(() => {
        if (selectedColor && selectedSize) {
            const variant = variants.find(
                (v) =>
                    v.tenMau === selectedColor && v.tenKichCo === selectedSize
            );
            setActiveVariant(variant || null);
        }
    }, [selectedColor, selectedSize, variants]);

    const handleAddToCart = async () => {
        if (!selectedColor || !selectedSize || !activeVariant) {
            message.warning(
                "Vui lòng chọn màu và kích cỡ trước khi thêm vào giỏ hàng"
            );
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart") || "[]");

        const itemToAdd = {
            variantId: activeVariant.productVariantId,
            productId: product.productId,
            name: product.name,
            giaBan: activeVariant.giaBan,
            quantity,
            color: selectedColor,
            size: selectedSize,
        };

        const existing = cart.find((i) => i.variantId === itemToAdd.variantId);
        if (existing) existing.quantity += quantity;
        else cart.push(itemToAdd);

        try {
            const payload = {
                productVariantId: activeVariant.productVariantId,
                quantity: quantity,
            };

            const res = await api.post("/Cart/AddToCart", payload);
            console.log("res", res);
        } catch (error) {
            console.log(error);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        message.success("Đã thêm vào giỏ hàng");
    };

    const handleBuyNow = () => {
        if (!selectedColor || !selectedSize || !activeVariant) {
            message.warning("Vui lòng chọn màu và kích cỡ trước khi mua");
            return;
        }

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

    const minPrice = variants.length
        ? Math.min(...variants.map((v) => Number(v.giaBan)))
        : 0;

    const styles = {
        cardRadius: { borderRadius: 16 },
        thumbnailWrapper: { display: "flex", gap: 8, marginTop: 12 },
        thumbnail: (isActive) => ({
            cursor: "pointer",
            borderRadius: 8,
            border: isActive ? "2px solid #ee4d2d" : "1px solid #eee",
        }),
        priceBox: {
            background: "#fff5f5",
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
        },
        priceText: { fontSize: 14 },
        priceNumber: { fontSize: 28, color: "#ee4d2d", fontWeight: 600 },
        productDesc: { color: "#666", whiteSpace: "pre-line" },
        variantWrapper: { marginTop: 12 },
        variantButtons: {
            display: "flex",
            gap: 10,
            marginTop: 8,
            flexWrap: "wrap",
        },
        quantityWrapper: {
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
        },
        stockText: { color: "#888" },
        actionButtons: { display: "flex", gap: 16, marginTop: 28 },
        btnAdd: {
            background: "#fff5f5",
            borderColor: "#ee4d2d",
            color: "#ee4d2d",
            flex: 1,
        },
        btnBuy: {
            background: "#ee4d2d",
            borderColor: "#ee4d2d",
            color: "#fff",
            flex: 1,
        },
        sizeGuide: { marginTop: 8, fontSize: 12, color: "#888" },
    };

    const colors = [...new Set(variants.map((v) => v.tenMau).filter(Boolean))];
    const sizes = [
        ...new Set(variants.map((v) => v.tenKichCo).filter(Boolean)),
    ];
    const checkIsDisable = useCallback(
        (type, value) => {
            if (type === "color" && selectedSize) {
                if (
                    !variants.find(
                        (i) =>
                            i.tenKichCo === selectedSize && i.tenMau === value
                    )
                ) {
                    return true;
                }
            }
            if (type === "size" && selectedColor) {
                if (
                    !variants.find(
                        (i) =>
                            i.tenMau === selectedColor && i.tenKichCo === value
                    )
                ) {
                    return true;
                }
            }
            return false;
        },
        [selectedColor, selectedSize]
    );

    console.log("selectedColor", selectedColor);
    console.log("selectedSize", selectedSize);
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
                    <Card style={styles.cardRadius}>
                        <Image
                            src={
                                activeImage || "https://via.placeholder.com/400"
                            }
                            width="100%"
                            style={styles.cardRadius}
                        />
                        {product.images.length > 0 && (
                            <div style={styles.thumbnailWrapper}>
                                {product.images.map((img, index) => (
                                    <Image
                                        key={index}
                                        src={img}
                                        width={60}
                                        height={60}
                                        preview={false}
                                        style={styles.thumbnail(
                                            activeImage === img
                                        )}
                                        onClick={() => setActiveImage(img)}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Thông tin */}
                <Col xs={24} md={14}>
                    <Card style={styles.cardRadius}>
                        <h2 style={{ marginBottom: 8 }}>{product.name}</h2>
                        <div style={{ marginBottom: 12 }}>
                            <Tag color="red">HOT</Tag>
                            <Tag color="green">Freeship</Tag>
                        </div>

                        <div style={styles.priceBox}>
                            <span style={styles.priceText}>Giá từ </span>
                            <span style={styles.priceNumber}>
                                {minPrice.toLocaleString("vi-VN")} ₫
                            </span>
                        </div>

                        {/* Số lượng */}
                        <div style={styles.quantityWrapper}>
                            <strong>Số lượng:</strong>
                            <InputNumber
                                min={1}
                                max={activeVariant?.soLuongTon || 99}
                                value={quantity}
                                onChange={(v) => setQuantity(v)}
                            />
                            {activeVariant && (
                                <span style={styles.stockText}>
                                    Còn {activeVariant.soLuongTon} sản phẩm
                                </span>
                            )}
                        </div>

                        {/* Chọn màu */}
                        {colors.length > 0 && (
                            <div style={styles.variantWrapper}>
                                <strong>Màu sắc:</strong>
                                <div style={styles.variantButtons}>
                                    {colors.map((c) => (
                                        <Button
                                            key={c}
                                            type={
                                                selectedColor === c
                                                    ? "primary"
                                                    : "default"
                                            }
                                            disabled={checkIsDisable(
                                                "color",
                                                c
                                            )}
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
                            <div style={styles.variantWrapper}>
                                <strong>Kích cỡ:</strong>
                                <div style={styles.variantButtons}>
                                    {sizes.map((s) => (
                                        <Button
                                            key={s}
                                            type={
                                                selectedSize === s
                                                    ? "primary"
                                                    : "default"
                                            }
                                            onClick={() => setSelectedSize(s)}
                                            disabled={checkIsDisable("size", s)}
                                        >
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                                <div style={styles.sizeGuide}>
                                    Hướng dẫn chọn size: Tham khảo bảng size bên
                                    dưới.
                                </div>
                            </div>
                        )}

                        {/* Nút hành động */}
                        <div style={styles.actionButtons}>
                            <Button
                                style={styles.btnAdd}
                                onClick={handleAddToCart}
                            >
                                Thêm vào giỏ
                            </Button>
                            <Button
                                style={styles.btnBuy}
                                onClick={handleBuyNow}
                            >
                                Mua ngay
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Mô tả sản phẩm */}
            <Divider />
            <Card style={styles.cardRadius}>
                <h3>Mô tả sản phẩm</h3>
                <p style={styles.productDesc}>{product.description}</p>
            </Card>
        </div>
    );
};

export default ProductDetail;
