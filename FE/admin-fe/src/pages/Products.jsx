// src/pages/admin/Products.jsx
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
  Upload,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Option } = Select;
const { TabPane } = Tabs;

export default function Products() {
  const [products, setProducts] = useState([
    {
      SanPhamId: 1,
      TenSanPham: "Áo thun nam StyleWear",
      MoTa: "Áo thun cotton cao cấp, thoáng mát, dễ phối đồ.",
      GiaGoc: 250000,
      ThuongHieu: "StyleWear",
      BaoHanh: "6 tháng",
      TrangThai: true,
      NgayTao: "2025-01-01",
      DanhMuc: { TenDanhMuc: "Áo nam" },
      BienTheSanPham: [
        {
          BienTheId: 1,
          GiaBan: 200000,
          SoLuongTon: 50,
          KichCo: { TenKichCo: "M" },
          MauSac: { TenMau: "Trắng" },
        },
        {
          BienTheId: 2,
          GiaBan: 200000,
          SoLuongTon: 30,
          KichCo: { TenKichCo: "L" },
          MauSac: { TenMau: "Đen" },
        },
      ],
      HinhAnhSanPham: [
        { HinhAnhId: 1, URL: "https://via.placeholder.com/120x120", AnhChinh: true },
        { HinhAnhId: 2, URL: "https://via.placeholder.com/120x120/cccccc", AnhChinh: false },
      ],
    },
  ]);

  //const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [detailModal, setDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // =======================
  // 📦 TODO: GỌI API DANH SÁCH SẢN PHẨM Ở ĐÂY SAU NÀY
  // =======================

  // 🧩 Lưu sản phẩm (thêm/sửa cục bộ)
  const handleSave = (values) => {
    if (editingProduct) {
      // Cập nhật
      setProducts((prev) =>
        prev.map((p) =>
          p.SanPhamId === editingProduct.SanPhamId ? { ...p, ...values } : p
        )
      );
      message.success("Cập nhật sản phẩm thành công (mock)");
    } else {
      // Thêm mới
      const newProduct = {
        SanPhamId: Date.now(),
        NgayTao: new Date().toISOString(),
        ...values,
      };
      setProducts((prev) => [...prev, newProduct]);
      message.success("Thêm sản phẩm thành công (mock)");
    }

    setOpenModal(false);
    form.resetFields();
  };

  // 🗑️ Xóa sản phẩm
  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.SanPhamId !== id));
    message.success("Đã xóa sản phẩm (mock)");
  };

  // 👁️ Xem chi tiết
  const handleView = (record) => {
    setSelectedProduct(record);
    setDetailModal(true);
  };

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "TenSanPham",
      key: "TenSanPham",
    },
    {
      title: "Danh mục",
      dataIndex: ["DanhMuc", "TenDanhMuc"],
      key: "DanhMuc",
      render: (_, record) => record.DanhMuc?.TenDanhMuc || "—",
    },
    {
      title: "Giá gốc",
      dataIndex: "GiaGoc",
      key: "GiaGoc",
      render: (val) => `${Number(val).toLocaleString()} ₫`,
    },
    {
      title: "Thương hiệu",
      dataIndex: "ThuongHieu",
      key: "ThuongHieu",
    },
    {
      title: "Trạng thái",
      dataIndex: "TrangThai",
      key: "TrangThai",
      render: (val) => (val ? "Đang bán" : "Ngừng bán"),
    },
    {
      title: "Ngày tạo",
      dataIndex: "NgayTao",
      key: "NgayTao",
      render: (val) => new Date(val).toLocaleDateString("vi-VN"),
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
          <Popconfirm
            title="Xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.SanPhamId)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
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
                p.TenSanPham.toLowerCase().includes(value.toLowerCase())
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

      <Table
        dataSource={products}
        columns={columns}
        //loading={loading}
        rowKey="SanPhamId"
        bordered
      />

      {/* MODAL THÊM / SỬA */}
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
            name="TenSanPham"
            rules={[{ required: true, message: "Nhập tên sản phẩm" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="MoTa">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Giá gốc" name="GiaGoc">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item label="Thương hiệu" name="ThuongHieu">
            <Input />
          </Form.Item>
          <Form.Item label="Bảo hành" name="BaoHanh">
            <Input />
          </Form.Item>
          <Form.Item label="Trạng thái" name="TrangThai" initialValue={true}>
            <Select>
              <Option value={true}>Đang bán</Option>
              <Option value={false}>Ngừng bán</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL CHI TIẾT */}
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
              <p>
                <b>Tên:</b> {selectedProduct.TenSanPham}
              </p>
              <p>
                <b>Mô tả:</b> {selectedProduct.MoTa}
              </p>
              <p>
                <b>Thương hiệu:</b> {selectedProduct.ThuongHieu}
              </p>
              <p>
                <b>Giá gốc:</b>{" "}
                {selectedProduct.GiaGoc
                  ? Number(selectedProduct.GiaGoc).toLocaleString()
                  : "0"}{" "}
                ₫
              </p>
              <p>
                <b>Danh mục:</b>{" "}
                {selectedProduct.DanhMuc?.TenDanhMuc || "Chưa có"}
              </p>
            </TabPane>
            <TabPane tab="Biến thể" key="2">
              <Table
                dataSource={selectedProduct?.BienTheSanPham || []}
                columns={[
                  { title: "Kích cỡ", dataIndex: ["KichCo", "TenKichCo"] },
                  { title: "Màu sắc", dataIndex: ["MauSac", "TenMau"] },
                  { title: "Giá bán", dataIndex: "GiaBan" },
                  { title: "Tồn kho", dataIndex: "SoLuongTon" },
                ]}
                pagination={false}
                rowKey="BienTheId"
              />
            </TabPane>
            <TabPane tab="Hình ảnh" key="3">
              <Upload
                listType="picture-card"
                fileList={
                  selectedProduct?.HinhAnhSanPham?.map((img) => ({
                    uid: img.HinhAnhId,
                    url: img.URL,
                    name: `Ảnh ${img.HinhAnhId}`,
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
