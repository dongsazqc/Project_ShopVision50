import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    message,
    InputNumber,
    Select,
    Upload,
    Spin,
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    SaveOutlined,
    StarFilled,
    StarOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../utils/axios";

const FIXED_BRAND = "StyleWear";
const FIXED_WARRANTY = "1 đổi 1 trong 3 ngày nếu chưa tháo mác";

export default function Products() {
    // main states
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // variants & images
    const [variants, setVariants] = useState([]);
    const [images, setImages] = useState([]);
    const [imageLoading, setImageLoading] = useState(false);

    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);

    // meta data
    const [metaData, setMetaData] = useState({});

    // product form
    const [form] = Form.useForm();

    // variant modal/form
    const [variantModalOpen, setVariantModalOpen] = useState(false);
    const [variantForm] = Form.useForm();
    const [editingVariant, setEditingVariant] = useState(null);

    // ================= SEARCH / FILTER STATES =================
    const [searchText, setSearchText] = useState("");
    const [searchId, setSearchId] = useState("");
    const [filterCategory, setFilterCategory] = useState(null);

    // ================= APPLY FILTER =================
    const applyFilter = () => {
        // We don't mutate original products array — fetchProducts will restore when reset
        let filtered = products.slice();

        if (searchText.trim()) {
            const lowerText = searchText.trim().toLowerCase();
            filtered = filtered.filter((p) =>
                p.name?.toLowerCase().includes(lowerText)
            );
        }

        if (searchId.trim()) {
            filtered = filtered.filter((p) =>
                String(p.productId).includes(searchId.trim())
            );
        }

        if (filterCategory) {
            filtered = filtered.filter((p) => p.categoryId === filterCategory);
        }

        setProducts(filtered);
    };

    const resetFilter = () => {
        setSearchText("");
        setSearchId("");
        setFilterCategory(null);
        fetchProducts();
    };

    // ==================== FETCH PRODUCTS ====================
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/Products/getAllProducts");
            setProducts(res.data?.$values || res.data || []);
        } catch (err) {
            console.error(err);
            message.error("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    // ==================== FETCH META DATA ====================
    const fetchMetaData = async () => {
        try {
            const [cat, chat, style, gen, origin] = await Promise.all([
                api.get("/Category/GetAll"),
                api.get("/Material/GetAllMaterial"),
                api.get("/Style/GetAll"),
                api.get("/Gender/GetAllGender"),
                api.get("/Origin/GetAll"),
            ]);
            setMetaData({
                categories: cat.data?.$values || cat.data || [],
                chatlieus: chat.data?.$values || chat.data || [],
                phongcachs: style.data?.$values || style.data || [],
                gioitinhs: gen.data?.$values || gen.data || [],
                xuatxus: origin.data?.$values || origin.data || [],
            });
        } catch (err) {
            console.error(err);
            message.error("Không thể tải dữ liệu meta");
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchMetaData();
        fetchColorAndSizes();
    }, []);

    // ===== FETCH COLORS & SIZES =====
    const fetchColorAndSizes = async () => {
        try {
            const [colorRes, sizeRes] = await Promise.all([
                api.get("/ProductColor/GetAll"),
                api.get("/ProductSize/GetAll"),
            ]);

            const uniqueColors = Array.from(
                new Map(
                    (colorRes.data?.$values || []).map((c) => [c.name, c])
                ).values()
            );
            const uniqueSizes = Array.from(
                new Map(
                    (sizeRes.data?.$values || []).map((s) => [s.name, s])
                ).values()
            );

            setColors(uniqueColors);
            setSizes(uniqueSizes);
        } catch (e) {
            message.error("Không thể tải màu hoặc size", e);
        }
    };

    // ==================== FETCH VARIANTS ====================
    const fetchVariants = async (productId) => {
        if (!productId) {
            setVariants([]);
            return;
        }
        try {
            const res = await api.get(`/ProductVariant/${productId}/variants`);
            const data = res.data?.variants?.$values || [];
            setVariants(
                data.map((v) => ({
                    bienTheId: v.productVariantId,
                    tenMau: v.tenMau,
                    tenKichCo: v.tenKichCo,
                    giaBan: v.giaBan,
                    soLuongTon: v.soLuongTon,
                    discountPercent: v.discountPercent ?? 0,
                }))
            );
        } catch (err) {
            console.error(err);
            message.error("Không thể tải biến thể");
        }
    };

    // ==================== FETCH IMAGES ====================
    const fetchImages = async (productId) => {
        if (!productId) {
            setImages([]);
            return;
        }
        try {
            setImageLoading(true);
            const res = await api.get(
                `/products/${productId}/images/checkimages`
            );
            // backend may return productImages array or root fields — support both
            const raw = res.data?.productImages ?? res.data ?? [];
            const imgs = (raw?.$values || raw || []).map((img) => ({
                id: img.productImageId || img.hinhAnhId || img.id,
                url: img.url || img.path || img.imageUrl || "",
                isMain: img.isMain || img.anhChinh || false,
            }));
            setImages(imgs);
        } catch (err) {
            console.error(err);
            message.error("Không thể tải ảnh");
        } finally {
            setImageLoading(false);
        }
    };

    // ==================== SAVE PRODUCT ====================
    const handleSave = async (values) => {
        try {
            const lowerName = values.Name.trim().toLowerCase();
            const isNameExist = products.some(
                (p) =>
                    p.name?.trim().toLowerCase() === lowerName &&
                    p.productId !== editingProduct?.productId
            );

            if (isNameExist) {
                message.error("Tên sản phẩm đã tồn tại");
                return;
            }

            if (editingProduct && editingProduct.productId) {
                await api.put(
                    `/Products/UpdateProducts/${editingProduct.productId}`,
                    {
                        name: values.Name,
                        description: values.Description,
                        price: values.Price,
                        brand: FIXED_BRAND,
                        warranty: FIXED_WARRANTY,
                        categoryId: values.CategoryId,
                        materialId: values.MaterialId,
                        styleId: values.StyleId,
                        genderId: values.GenderId,
                        originId: values.OriginId,
                    }
                );

                message.success("Cập nhật sản phẩm thành công!");
                fetchProducts();
                fetchVariants(editingProduct.productId);
                fetchImages(editingProduct.productId);
                setOpenModal(false);
            } else {
                const res = await api.post("/Products/addProduct", {
                    name: values.Name,
                    description: values.Description,
                    price: values.Price,
                    brand: FIXED_BRAND,
                    warranty: FIXED_WARRANTY,
                    categoryId: values.CategoryId,
                    materialId: values.MaterialId,
                    styleId: values.StyleId,
                    genderId: values.GenderId,
                    originId: values.OriginId,
                });

                message.success("Thêm sản phẩm thành công!");

                const created = res.data;
                const createdProduct = created?.$values
                    ? created.$values[0]
                    : created;

                if (createdProduct) {
                    setEditingProduct(createdProduct);
                    form.setFieldsValue({
                        Brand: FIXED_BRAND,
                        Warranty: FIXED_WARRANTY,
                    });
                    fetchVariants(createdProduct.productId);
                    fetchImages(createdProduct.productId);
                }

                fetchProducts();
                setOpenModal(true);
            }
        } catch (err) {
            console.error(err);
            message.error("Lưu sản phẩm thất bại");
        }
    };

    // ==================== VARIANTS: add / update / delete ====================
    const openAddVariantModal = () => {
        if (!editingProduct?.productId) {
            message.warning("Vui lòng lưu sản phẩm trước khi thêm biến thể.");
            return;
        }
        setEditingVariant(null);
        variantForm.resetFields();
        setVariantModalOpen(true);
    };

    const openEditVariantModal = (variant) => {
        setEditingVariant(variant);
        variantForm.setFieldsValue({
            tenMau: variant.tenMau,
            tenKichCo: variant.tenKichCo,
            giaBan: variant.giaBan,
            soLuongTon: variant.soLuongTon,
            discountPercent: variant.discountPercent ?? 0,
        });
        setVariantModalOpen(true);
    };

    const submitVariant = async (values) => {
        try {
            if (!editingProduct?.productId) {
                message.warning("Sản phẩm chưa được lưu.");
                return;
            }

            const duplicate = variants.some(
                (v) =>
                    v.tenMau === values.tenMau &&
                    v.tenKichCo === values.tenKichCo &&
                    v.bienTheId !== editingVariant?.bienTheId
            );

            if (duplicate) {
                message.error("Biến thể với màu và kích cỡ này đã tồn tại");
                return;
            }

            if (editingVariant && editingVariant.bienTheId) {
                await api.put(`/ProductVariant/${editingVariant.bienTheId}`, {
                    tenMau: values.tenMau,
                    tenKichCo: values.tenKichCo,
                    giaBan: values.giaBan,
                    soLuongTon: values.soLuongTon,
                    discountPercent: values.discountPercent ?? 0,
                });

                message.success("Cập nhật biến thể thành công!");
            } else {
                await api.post("/ProductVariant", {
                    ProductId: editingProduct.productId,
                    tenMau: values.tenMau,
                    tenKichCo: values.tenKichCo,
                    giaBan: values.giaBan,
                    soLuongTon: values.soLuongTon,
                    discountPercent: values.discountPercent ?? 0,
                });

                message.success("Thêm biến thể thành công!");
            }

            setVariantModalOpen(false);
            variantForm.resetFields();

            await fetchVariants(editingProduct.productId);
            await checkProductStatus(editingProduct.productId);
        } catch (err) {
            console.error(err);
            message.error("Thao tác biến thể thất bại");
        }
    };

    const handleUpdateVariant = async (record) => {
        try {
            await api.put(`/ProductVariant/${record.bienTheId}`, {
                giaBan: record.giaBan,
                soLuongTon: record.soLuongTon,
                discountPercent: record.discountPercent ?? 0,
            });
            message.success("Cập nhật biến thể thành công!");
            if (editingProduct?.productId) {
                await fetchVariants(editingProduct.productId);
                await checkProductStatus(editingProduct.productId);
            }
        } catch (err) {
            console.error(err);
            message.error("Không thể cập nhật biến thể");
        }
    };

    const handleDeleteVariant = async (bienTheId, productId) => {
        try {
            await api.delete(`/ProductVariant/${bienTheId}`);
            message.success("Xóa biến thể thành công!");
            await fetchVariants(productId);
            await checkProductStatus(productId);
        } catch (err) {
            console.error(err);
            message.error("Không thể xóa biến thể");
        }
    };

    // ==================== CHECK PRODUCT STATUS ====================
    const checkProductStatus = async (productId) => {
        try {
            const res = await api.get(`/ProductVariant/${productId}/variants`);
            const data = res.data?.variants?.$values || [];
            const allZero =
                data.length === 0
                    ? true
                    : data.every((v) => Number(v.soLuongTon) === 0);
            await api.put(`/Products/UpdateStatus/${productId}`, {
                status: !allZero,
            });
            fetchProducts();
        } catch (err) {
            console.error("Lỗi khi kiểm tra trạng thái sản phẩm:", err);
        }
    };

    // ==================== IMAGES ====================
    const handleUploadImage = async ({ file, onSuccess, onError }) => {
        if (!editingProduct?.productId) {
            message.warning("Chưa chọn sản phẩm để tải ảnh");
            onError?.();
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("ProductId", editingProduct.productId);

        try {
            setImageLoading(true);
            await api.post(
                `/products/${editingProduct.productId}/images`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            message.success("Tải ảnh thành công!");
            fetchImages(editingProduct.productId);
            onSuccess?.();
        } catch (err) {
            console.error(err);
            message.error("Tải ảnh thất bại");
            onError?.();
        } finally {
            setImageLoading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        try {
            await api.delete(`/Images/Delete/${imageId}`);
            message.success("Xóa ảnh thành công!");
            if (editingProduct?.productId)
                fetchImages(editingProduct.productId);
        } catch (err) {
            console.error(err);
            message.error("Không thể xóa ảnh");
        }
    };

    // const handleSetMainImage = async (imageId) => {
    //   try {
    //     await api.put(`/Images/SetMain/${imageId}`);
    //     message.success("Đặt ảnh chính thành công!");
    //     if (editingProduct?.productId) fetchImages(editingProduct.productId);
    //   } catch (err) {
    //     console.error(err);
    //     message.error("Không thể đặt ảnh chính");
    //   }
    // };

    // ==================== MODAL PRODUCT OPEN ====================
    const openEditModal = async (record) => {
        if (
            !metaData.categories?.length ||
            !metaData.chatlieus?.length ||
            !metaData.phongcachs?.length ||
            !metaData.gioitinhs?.length ||
            !metaData.xuatxus?.length
        ) {
            await fetchMetaData();
        }

        setEditingProduct(record || null);

        form.setFieldsValue({
            Name: record?.name || "",
            Description: record?.description || "",
            Price: record?.price ?? 0,
            Brand: FIXED_BRAND,
            Warranty: FIXED_WARRANTY,
            CategoryId: record?.categoryId ?? undefined,
            MaterialId: record?.materialId ?? undefined,
            StyleId: record?.styleId ?? undefined,
            GenderId: record?.genderId ?? undefined,
            OriginId: record?.originId ?? undefined,
        });

        setOpenModal(true);

        if (record?.productId) {
            fetchVariants(record.productId);
            fetchImages(record.productId);
        } else {
            setVariants([]);
            setImages([]);
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            await api.delete(`/Products/DeleteProducts/${id}`);
            message.success("Xóa sản phẩm thành công!");
            fetchProducts();
        } catch (err) {
            console.error(err);
            message.error("Không thể xóa sản phẩm");
        }
    };

    // ==================== COLUMNS ====================
    const columns = [
        {
            title: "Mã SP",
            dataIndex: "productId",
            width: 80,
            align: "center",
        },
        {
            title: "Ảnh",
            dataIndex: "productImages",
            width: 100,
            render: (_, record) => {
                // productImages là dạng { $values: [...] }
                const imgs = record.productImages?.$values || [];

                // ưu tiên ảnh isMain = true, nếu không có thì lấy ảnh đầu tiên
                const cover =
                    imgs.find((x) => x.isMain === true) || imgs[0] || null;

                const rawUrl = cover?.url || "";
                const src = rawUrl
                    ? rawUrl.startsWith("http")
                        ? rawUrl
                        : `http://160.250.5.26:5000${rawUrl}` // base URL BE của bạn
                    : "/no-image.png";

                return (
                    <img
                        src={src}
                        alt="product"
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 6,
                            objectFit: "cover",
                            border: "1px solid #ddd",
                        }}
                    />
                );
            },
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            render: (text, record) => (
                <span
                    style={{ color: "#1677ff", cursor: "pointer" }}
                    onClick={() => openEditModal(record)}
                >
                    {text}
                </span>
            ),
        },
        {
            title: "Danh mục",
            dataIndex: "categoryId",
            render: (val) => {
                const dm = metaData.categories?.find(
                    (x) => x.categoryId === val
                );
                return dm ? dm.name : "—";
            },
        },
        {
            title: "Thương hiệu",
            dataIndex: "brand",
            render: (val) => val || "—",
        },
        {
            title: "Country",
            dataIndex: "originId",
            render: (val) => {
                const xx = metaData.xuatxus?.find((x) => x.originId === val);
                return xx ? xx.country : "—";
            },
        },
        {
            title: "Thao tác",
            width: 100,
            render: (_, record) => (
                <Space>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteProduct(record.productId)}
                    />
                </Space>
            ),
        },
    ];

    // ==================== VARIANT TABLE COLUMNS ====================
    const variantColumns = [
        { title: "Màu sắc", dataIndex: "tenMau" },
        { title: "Kích cỡ", dataIndex: "tenKichCo" },
        {
            title: "Giá bán",
            dataIndex: "giaBan",
            render: (v, r) => (
                <InputNumber
                    value={r.giaBan}
                    min={0}
                    onChange={(val) =>
                        setVariants((prev) =>
                            prev.map((x) =>
                                x.bienTheId === r.bienTheId
                                    ? { ...x, giaBan: val }
                                    : x
                            )
                        )
                    }
                />
            ),
        },
        {
            title: "Tồn kho",
            dataIndex: "soLuongTon",
            render: (v, r) => (
                <InputNumber
                    value={r.soLuongTon}
                    min={0}
                    onChange={(val) =>
                        setVariants((prev) =>
                            prev.map((x) =>
                                x.bienTheId === r.bienTheId
                                    ? { ...x, soLuongTon: val }
                                    : x
                            )
                        )
                    }
                />
            ),
        },
        {
            title: "Hành động",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<SaveOutlined />}
                        type="primary"
                        onClick={() => handleUpdateVariant(record)}
                    >
                        Lưu
                    </Button>
                    <Button onClick={() => openEditVariantModal(record)}>
                        Sửa
                    </Button>
                    <Button
                        danger
                        onClick={() =>
                            handleDeleteVariant(
                                record.bienTheId,
                                editingProduct?.productId
                            )
                        }
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Space
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <h2>Quản lý sản phẩm</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openEditModal(null)}
                >
                    Thêm sản phẩm
                </Button>
            </Space>

            <Space
                style={{
                    display: "flex",
                    marginBottom: 16,
                    gap: 8,
                    flexWrap: "wrap",
                }}
            >
                <Input
                    placeholder="Tìm theo tên sản phẩm"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                    style={{ width: 200 }}
                />
                <Input
                    placeholder="Tìm theo Mã SP"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    allowClear
                    style={{ width: 120 }}
                />
                <Select
                    placeholder="Lọc theo danh mục"
                    value={filterCategory}
                    onChange={(val) => setFilterCategory(val)}
                    allowClear
                    style={{ width: 180 }}
                >
                    {metaData.categories?.map((c) => (
                        <Select.Option key={c.categoryId} value={c.categoryId}>
                            {c.name}
                        </Select.Option>
                    ))}
                </Select>
                <Button onClick={applyFilter}>Áp dụng</Button>
                <Button onClick={resetFilter}>Reset</Button>
            </Space>

            <Table
                dataSource={products}
                columns={columns}
                loading={loading}
                rowKey="productId"
                bordered
            />

            <Modal
                title={editingProduct ? "Chi tiết sản phẩm" : "Thêm sản phẩm"}
                open={openModal}
                onCancel={() => {
                    setOpenModal(false);
                    setEditingProduct(null);
                    form.resetFields();
                    setVariants([]);
                    setImages([]);
                }}
                onOk={() => form.submit()}
                okText="Lưu"
                cancelText="Hủy"
                width={1000}
                destroyOnClose={false}
            >
                <Spin spinning={imageLoading}>
                    <Form layout="vertical" form={form} onFinish={handleSave}>
                        <Form.Item
                            label="Tên sản phẩm"
                            name="Name"
                            rules={[
                                {
                                    required: true,
                                    message: "Tên sản phẩm không được để trống",
                                },
                                {
                                    min: 3,
                                    message: "Tên sản phẩm phải từ 3 ký tự",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Mô tả"
                            name="Description"
                            rules={[
                                {
                                    max: 1000,
                                    message: "Mô tả tối đa 1000 ký tự",
                                },
                            ]}
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>

                        <Form.Item
                            label="Giá gốc"
                            name="Price"
                            rules={[
                                {
                                    required: true,
                                    message: "Giá không được để trống",
                                },
                                {
                                    validator: (_, value) =>
                                        value > 0
                                            ? Promise.resolve()
                                            : Promise.reject(
                                                  "Giá phải lớn hơn 0"
                                              ),
                                },
                            ]}
                        >
                            <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item
                            label="Thương hiệu"
                            name="Brand"
                            initialValue={FIXED_BRAND}
                        >
                            <Input readOnly />
                        </Form.Item>

                        <Form.Item
                            label="Bảo hành"
                            name="Warranty"
                            initialValue={FIXED_WARRANTY}
                        >
                            <Input readOnly />
                        </Form.Item>

                        <Form.Item
                            label="Danh mục"
                            name="CategoryId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn danh mục",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn danh mục"
                                options={metaData.categories?.map((x) => ({
                                    value: x.categoryId,
                                    label: x.name,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Chất liệu"
                            name="MaterialId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chất liệu",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn chất liệu"
                                options={metaData.chatlieus?.map((x) => ({
                                    value: x.materialId,
                                    label: x.name,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Phong cách"
                            name="StyleId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn phong cách",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn phong cách"
                                options={metaData.phongcachs?.map((x) => ({
                                    value: x.styleId,
                                    label: x.name,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Giới tính"
                            name="GenderId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn giới tính",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn giới tính"
                                options={metaData.gioitinhs?.map((x) => ({
                                    value: x.genderId,
                                    label: x.name,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Xuất xứ"
                            name="OriginId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn xuất xứ",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn xuất xứ"
                                options={metaData.xuatxus?.map((x) => ({
                                    value: x.originId,
                                    label: x.country,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item label="Ảnh sản phẩm">
                            <Upload
                                customRequest={handleUploadImage}
                                listType="picture-card"
                                accept="image/*"
                                multiple
                                showUploadList={false} // thêm dòng này
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            </Upload>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    marginTop: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                {images.map((img, index) => (
                                    <div
                                        key={img.id || index}
                                        style={{ position: "relative" }}
                                    >
                                        <img
                                            src={
                                                img.url?.startsWith("http")
                                                    ? img.url
                                                    : `http://160.250.5.26:5000${img.url}`
                                            }
                                            alt=""
                                            style={{
                                                width: 100,
                                                height: 100,
                                                objectFit: "cover",
                                                borderRadius: 6,
                                                border: "1px solid #ccc",
                                            }}
                                        />

                                        {/* Nút xóa */}
                                        <Button
                                            size="small"
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            danger
                                            style={{
                                                position: "absolute",
                                                top: 2,
                                                right: 2,
                                                background: "white",
                                                borderRadius: "50%",
                                            }}
                                            onClick={() =>
                                                handleDeleteImage(img.id)
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </Form.Item>
                        <Form.Item label="Biến thể sản phẩm">
                            <Button
                                type="dashed"
                                style={{ marginBottom: 8 }}
                                onClick={openAddVariantModal}
                            >
                                Thêm biến thể
                            </Button>

                            <Table
                                dataSource={variants}
                                columns={variantColumns}
                                rowKey="bienTheId"
                                bordered
                                pagination={false}
                            />
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>

            <Modal
                title={editingVariant ? "Sửa biến thể" : "Thêm biến thể"}
                open={variantModalOpen}
                onCancel={() => {
                    setVariantModalOpen(false);
                    variantForm.resetFields();
                    setEditingVariant(null);
                }}
                onOk={() => variantForm.submit()}
                okText="Lưu"
            >
                <Form
                    layout="vertical"
                    form={variantForm}
                    onFinish={submitVariant}
                >
                    <Form.Item
                        label="Màu sắc"
                        name="tenMau"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn màu sắc",
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn màu"
                            options={colors.map((c) => ({
                                value: c.name,
                                label: c.name,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Kích cỡ"
                        name="tenKichCo"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn kích cỡ",
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn kích cỡ"
                            options={sizes.map((s) => ({
                                value: s.name,
                                label: s.name,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Giá bán"
                        name="giaBan"
                        rules={[
                            {
                                required: true,
                                message: "Giá bán không được để trống",
                            },
                            {
                                validator: (_, value) =>
                                    value > 0
                                        ? Promise.resolve()
                                        : Promise.reject(
                                              "Giá bán phải lớn hơn 0"
                                          ),
                            },
                        ]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label="Số lượng tồn"
                        name="soLuongTon"
                        rules={[
                            {
                                required: true,
                                message: "Số lượng tồn không được để trống",
                            },
                            {
                                validator: (_, value) =>
                                    value >= 0
                                        ? Promise.resolve()
                                        : Promise.reject("Tồn kho phải ≥ 0"),
                            },
                        ]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label="Khuyến mãi (%)"
                        name="discountPercent"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value >= 0 && value <= 100
                                        ? Promise.resolve()
                                        : Promise.reject(
                                              "Khuyến mãi phải từ 0–100%"
                                          ),
                            },
                        ]}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
