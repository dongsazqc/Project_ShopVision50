// src/pages/Products.jsx
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tabs,
  Tag,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
  CheckOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../utils/axios";

const { Option } = Select;
const { TabPane } = Tabs;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();

  // 📦 1️⃣ Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // TODO: ⚙️ API thật: GET /api/sanpham (include BienThe, DanhMuc, HinhAnh)
      const res = await api.get("/sanpham");
      const data = res.data || [];

      // ✅ Nếu sản phẩm có tổng tồn = 0 → cập nhật trạng thái tạm trên FE
      const updated = data.map((p) => {
        const totalStock =
          p.bienTheSanPham?.reduce(
            (sum, b) => sum + (b.soLuongTon || 0),
            0
          ) || 0;
        return { ...p, tongTon: totalStock, trangThai: totalStock > 0 };
      });

      setProducts(updated);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // 📋 2️⃣ Lấy danh mục
  const fetchCategories = async () => {
    try {
      // TODO: ⚙️ API thật: GET /api/danhmuc
      const res = await api.get("/danhmuc");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // 💾 3️⃣ Thêm / sửa sản phẩm
  const handleSave = async (values) => {
    try {
      if (editingProduct) {
        // TODO: ⚙️ API thật: PUT /api/sanpham/:id
        await api.put(`/sanpham/${editingProduct.sanPhamId}`, values);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        // TODO: ⚙️ API thật: POST /api/sanpham
        await api.post("/sanpham", values);
        message.success("Thêm sản phẩm thành công");
      }
      fetchProducts();
      setOpenModal(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Lưu thất bại");
    }
  };

  // 🔄 4️⃣ Đổi trạng thái sản phẩm (ngừng bán <-> đang bán)
  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.trangThai;

      // TODO: ⚙️ API thật: PUT /api/sanpham/{id}/trangthai
      await api.put(`/sanpham/${product.sanPhamId}`, {
        ...product,
        trangThai: newStatus,
      });

      message.success(
        newStatus ? "Đã mở bán sản phẩm" : "Đã ngừng bán sản phẩm"
      );
      fetchProducts();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  // 👁️ 5️⃣ Xem chi tiết sản phẩm
  const handleView = async (record) => {
    try {
      // TODO: ⚙️ API thật: GET /api/sanpham/:id (include BienThe, HinhAnh)
      const res = await api.get(`/sanpham/${record.sanPhamId}`);
      setSelectedProduct(res.data);
      setDetailModal(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải chi tiết sản phẩm");
    }
  };

  const columns = [
    { title: "Tên sản phẩm", dataIndex: "tenSanPham", key: "tenSanPham" },
    {
      title: "Danh mục",
      dataIndex: ["danhMuc", "tenDanhMuc"],
      render: (_, record) => record.danhMuc?.tenDanhMuc || "—",
    },
    {
      title: "Giá gốc",
      dataIndex: "giaGoc",
      render: (val) => `${val?.toLocaleString()} ₫`,
    },
    { title: "Thương hiệu", dataIndex: "thuongHieu" },
    {
      title: "Tồn kho",
      dataIndex: "tongTon",
      render: (val) => <b>{val || 0}</b>,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      render: (val, record) => {
        const color = record.tongTon === 0 ? "volcano" : val ? "green" : "gray";
        const text =
          record.tongTon === 0
            ? "Hết hàng"
            : val
            ? "Đang bán"
            : "Ngừng bán";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => {
              setEditingProduct(record);
              form.setFieldsValue(record);
              setOpenModal(true);
            }}
          />
          <Button
            icon={record.trangThai ? <StopOutlined /> : <CheckOutlined />}
            danger={record.trangThai}
            onClick={() => handleToggleStatus(record)}
          >
            {record.trangThai ? "Ngừng bán" : "Mở bán"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Thanh tìm kiếm + nút thêm */}
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input.Search
          placeholder="Tìm sản phẩm..."
          onSearch={(value) =>
            setProducts((prev) =>
              prev.filter((p) =>
                p.tenSanPham.toLowerCase().includes(value.toLowerCase())
              )
            )
          }
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingProduct(null);
            setOpenModal(true);
          }}
        >
          Thêm sản phẩm
        </Button>
      </Space>

      {/* Bảng sản phẩm */}
      <Table
        dataSource={products}
        columns={columns}
        loading={loading}
        rowKey="sanPhamId"
        bordered
      />

      {/* Modal thêm / sửa */}
      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Tên sản phẩm"
            name="tenSanPham"
            rules={[{ required: true, message: "Nhập tên sản phẩm" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="moTa">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Giá gốc" name="giaGoc">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item label="Thương hiệu" name="thuongHieu">
            <Input />
          </Form.Item>
          <Form.Item label="Bảo hành" name="baoHanh">
            <Input />
          </Form.Item>
          <Form.Item label="Danh mục" name="danhMucId">
            <Select placeholder="Chọn danh mục">
              {categories.map((c) => (
                <Option key={c.danhMucId} value={c.danhMucId}>
                  {c.tenDanhMuc}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết */}
      <Modal
        open={detailModal}
        title="Chi tiết sản phẩm"
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={800}
      >
        {selectedProduct && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin chung" key="1">
              <p><b>Tên:</b> {selectedProduct.tenSanPham}</p>
              <p><b>Mô tả:</b> {selectedProduct.moTa}</p>
              <p><b>Thương hiệu:</b> {selectedProduct.thuongHieu}</p>
              <p><b>Bảo hành:</b> {selectedProduct.baoHanh}</p>
              <p>
                <b>Giá gốc:</b>{" "}
                {selectedProduct.giaGoc?.toLocaleString()} ₫
              </p>
              <p>
                <b>Danh mục:</b>{" "}
                {selectedProduct.danhMuc?.tenDanhMuc || "Chưa có"}
              </p>
            </TabPane>

            <TabPane tab="Biến thể" key="2">
              <Table
                dataSource={selectedProduct.bienTheSanPham || []}
                columns={[
                  { title: "Kích cỡ", dataIndex: ["kichCo", "tenKichCo"] },
                  { title: "Màu sắc", dataIndex: ["mauSac", "tenMau"] },
                  { title: "Giá bán", dataIndex: "giaBan" },
                  { title: "Tồn kho", dataIndex: "soLuongTon" },
                ]}
                pagination={false}
                rowKey="bienTheId"
              />
            </TabPane>

            <TabPane tab="Hình ảnh" key="3">
              <Upload
                listType="picture-card"
                fileList={
                  selectedProduct.hinhAnhSanPham?.map((img) => ({
                    uid: img.hinhAnhId,
                    url: img.url,
                    name: `Ảnh ${img.hinhAnhId}`,
                    status: "done",
                  })) || []
                }
                showUploadList={{ showRemoveIcon: false }}
                itemRender={(originNode, file) => (
                  <img
                    src={file.url}
                    alt="Ảnh sản phẩm"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                )}
              >
                <Button icon={<UploadOutlined />}>Thêm ảnh</Button>
              </Upload>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
}
