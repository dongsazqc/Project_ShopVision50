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
  Tabs,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../utils/axios";

const { TabPane } = Tabs;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [form] = Form.useForm();
  const [imageLoading, setImageLoading] = useState(false);

  // ==================== FETCH PRODUCTS ====================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("Products/getAllProducts"); // TODO: BE cần trả kèm danh mục, chất liệu, v.v.
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
      api.get("/Material/GetAll"),
      api.get("/Style/GetAll"),
      api.get("/Gender/GetAll"),
      api.get("/Origin/GetAll"),
    ]);

    const newMeta = {
      categories: cat.data?.$values || cat.data || [],
      chatlieus: chat.data?.$values || chat.data || [],
      phongcachs: style.data?.$values || style.data || [],
      gioitinhs: gen.data?.$values || gen.data || [],
      xuatxus: origin.data?.$values || origin.data || [],
    };

    setMetaData(newMeta);
    return newMeta; // Trả về để có thể await
  } catch (err) {
    console.error(err);
    message.error("Không thể tải dữ liệu meta");
    return null;
  }
};


  useEffect(() => {
    fetchProducts();
    fetchMetaData();
  }, []);

  // ==================== FETCH VARIANTS ====================
  const fetchVariants = async (productId) => {
    try {
      const res = await api.get(`/ProductVariants/GetByProductId/${productId}`); // TODO
      setVariants(res.data?.$values || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ==================== FETCH IMAGES ====================
  const fetchImages = async (productId) => {
    try {
      setImageLoading(true);
      const res = await api.get(`/Images/GetByProductId/${productId}`); // TODO
      setImages(res.data?.$values || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setImageLoading(false);
    }
  };

  // ==================== SAVE PRODUCT ====================
  const handleSave = async (values) => {
  try {
    if (editingProduct) {
      await api.put(`/Products/UpdateProducts/${editingProduct.productId}`, {
        name: values.Name,
        description: values.Description,
        price: values.Price,
        brand: values.Brand,
        warranty: values.Warranty,
        categoryId: values.CategoryId,
        materialId: values.MaterialId,
        styleId: values.StyleId,
        genderId: values.GenderId,
        originId: values.OriginId,
      });
      message.success("Cập nhật sản phẩm thành công!");
    } else {
      await api.post("/Products/addProduct", {
        name: values.Name,
        description: values.Description,
        price: values.Price,
        brand: values.Brand,
        warranty: values.Warranty,
        categoryId: values.CategoryId,
        materialId: values.MaterialId,
        styleId: values.StyleId,
        genderId: values.GenderId,
        originId: values.OriginId,
      });
      message.success("Thêm sản phẩm thành công!");
    }
    fetchProducts();
    setOpenModal(false);
    form.resetFields();
  } catch (err) {
    console.error(err);
    message.error("Lưu sản phẩm thất bại");
  }
};


  // ==================== UPDATE VARIANT ====================
  const handleUpdateVariant = async (record) => {
    try {
      await api.put(`/ProductVariants/Update/${record.bienTheId}`, {
        giaBan: record.giaBan,
        soLuongTon: record.soLuongTon,
      }); // TODO
      message.success("Cập nhật biến thể thành công!");
      fetchVariants(record.ProductId);
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật biến thể");
    }
  };

  // ==================== UPLOAD IMAGE ====================
  const handleUploadImage = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ProductId", editingProduct?.ProductId);
    try {
      await api.post("/Images/Upload", formData); // TODO
      message.success("Tải ảnh thành công!");
      fetchImages(editingProduct?.ProductId);
    } catch (err) {
      console.error(err);
      message.error("Tải ảnh thất bại");
    }
  };

  // ==================== OPEN MODAL ====================
const openEditModal = async (record) => {
  // Nếu metaData chưa load đủ, load lại
  if (
    !metaData.categories?.length ||
    !metaData.chatlieus?.length ||
    !metaData.phongcachs?.length ||
    !metaData.gioitinhs?.length ||
    !metaData.xuatxus?.length
  ) {
    await fetchMetaData();
  }

  setEditingProduct(record);
  
  form.setFieldsValue({
    Name: record.name,
    Description: record.description,
    Price: record.price,
    Brand: record.brand,
    Warranty: record.warranty,
    CategoryId: record.categoryId,
    MaterialId: record.materialId,
    StyleId: record.styleId,
    GenderId: record.genderId,
    OriginId: record.originId,
  });

  setOpenModal(true);
  fetchVariants(record.productId);
  fetchImages(record.productId);
};

  // ==================== DELETE PRODUCT ====================
  const handleDelete = async (id) => {
    try {
      await api.delete(`/Products/DeleteProducts/${id}`); // TODO
      message.success("Xóa sản phẩm thành công!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa sản phẩm");
    }
  };

  const columns = [
  { title: "ID", dataIndex: "productId", width: 70 },
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
    title: "Giá gốc",
    dataIndex: "price", 
    render: (v) => `${Number(v).toLocaleString()} ₫`,
  },
  { title: "Thương hiệu", dataIndex: "brand" },
  {
    title: "Trạng thái",
    dataIndex: "status",
    render: (val) => (val ? "Hoạt động" : "Không hoạt động"),
  },
  {
    title: "Thao tác",
    render: (_, record) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
        <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.productId)} />
      </Space>
    ),
  },
];


  return (
    <div>
      <Space style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Quản lý sản phẩm</h2>
<Button
  type="primary"
  icon={<PlusOutlined />}
  onClick={async () => {
    if (
      !metaData.categories?.length ||
      !metaData.chatlieus?.length ||
      !metaData.phongcachs?.length ||
      !metaData.gioitinhs?.length ||
      !metaData.xuatxus?.length
    ) {
      await fetchMetaData();
    }
    setEditingProduct(null);
    form.resetFields();
    setOpenModal(true);
  }}
>
  Thêm sản phẩm
</Button>
      </Space>

<Table
  dataSource={products}
  columns={columns}
  loading={loading} 
  rowKey="productId"
  bordered
/>

      {/* ==================== MODAL ==================== */}
      <Modal
        title={editingProduct ? "Chi tiết sản phẩm" : "Thêm sản phẩm"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        width={1000}
      >
        <Tabs defaultActiveKey="1">
          {/* TAB 1: THÔNG TIN CHUNG */}
          <TabPane tab="Thông tin chung" key="1">
            <Form layout="vertical" form={form} onFinish={handleSave}>
              <Form.Item label="Tên sản phẩm" name="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Mô tả" name="Description">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item label="Giá gốc" name="Price">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="Thương hiệu" name="Brand">
                <Input />
              </Form.Item>
              <Form.Item label="Bảo hành" name="Warranty">
                <Input />
              </Form.Item>

              {/* Dropdown các bảng con */}
              <Form.Item label="Danh mục" name="CategoryId">
                <Select
                  options={metaData.categories?.map((x) => ({
                    value: x.categoryId,
                    label: x.name,
                  }))}
                />
              </Form.Item>
              <Form.Item label="Chất liệu" name="MaterialId">
                <Select
                  options={metaData.chatlieus?.map((x) => ({
                    value: x.materialId,
                    label: x.name,
                  }))}
                />
              </Form.Item>
              <Form.Item label="Phong cách" name="StyleId">
                <Select
                  options={metaData.phongcachs?.map((x) => ({
                    value: x.styleId,
                    label: x.name,
                  }))}
                />
              </Form.Item>
              <Form.Item label="Giới tính" name="GenderId">
                <Select
                  options={metaData.gioitinhs?.map((x) => ({
                    value: x.genderId,
                    label: x.name,
                  }))}
                />
              </Form.Item>
              <Form.Item label="Xuất xứ" name="OriginId">
                <Select
                  options={metaData.xuatxus?.map((x) => ({
                    value: x.originId,
                    label: x.country,
                  }))}
                />
              </Form.Item>
            </Form>
          </TabPane>

          {/* TAB 2: BIẾN THỂ SẢN PHẨM */}
          <TabPane tab="Biến thể sản phẩm" key="2">
            <Table
              dataSource={variants}
              rowKey="bienTheId"
              bordered
              pagination={false}
              columns={[
                { title: "Màu sắc", dataIndex: "tenMau" },
                { title: "Kích cỡ", dataIndex: "tenKichCo" },
                {
                  title: "Giá bán",
                  dataIndex: "giaBan",
                  render: (v, r) => (
                    <InputNumber
                      value={r.giaBan}
                      onChange={(val) =>
                        setVariants((prev) =>
                          prev.map((x) =>
                            x.bienTheId === r.bienTheId ? { ...x, giaBan: val } : x
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
                      onChange={(val) =>
                        setVariants((prev) =>
                          prev.map((x) =>
                            x.bienTheId === r.bienTheId ? { ...x, soLuongTon: val } : x
                          )
                        )
                      }
                    />
                  ),
                },
                {
                  title: "Hành động",
                  render: (_, record) => (
                    <Button
                      icon={<SaveOutlined />}
                      type="primary"
                      onClick={() => handleUpdateVariant(record)}
                    >
                      Lưu
                    </Button>
                  ),
                },
              ]}
            />
          </TabPane>

          {/* TAB 3: ẢNH SẢN PHẨM */}
          <TabPane tab="Ảnh sản phẩm" key="3">
            <Upload
              customRequest={handleUploadImage}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Tải ảnh mới</Button>
            </Upload>
            <Spin spinning={imageLoading}>
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                {images.map((img) => (
                  <img
                    key={img.hinhAnhId}
                    src={img.url}
                    alt=""
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: img.anhChinh ? "2px solid #1890ff" : "1px solid #ccc",
                    }}
                  />
                ))}
              </div>
            </Spin>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
}
