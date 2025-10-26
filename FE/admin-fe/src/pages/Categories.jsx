// src/pages/Categories.jsx
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tabs,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../utils/axios";

const { TabPane } = Tabs;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form] = Form.useForm();

  // 📦 Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      setLoading(true);
      // TODO: ⚙️ API thật: GET /api/danhmuc (include SanPham nếu cần)
      const res = await api.get("/danhmuc");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 💾 Thêm / Sửa danh mục
  const handleSave = async (values) => {
    try {
      if (editingCategory) {
        // TODO: ⚙️ API thật: PUT /api/danhmuc/:id
        await api.put(`/danhmuc/${editingCategory.danhMucId}`, values);
        message.success("Cập nhật danh mục thành công");
      } else {
        // TODO: ⚙️ API thật: POST /api/danhmuc
        await api.post("/danhmuc", values);
        message.success("Thêm danh mục thành công");
      }
      fetchCategories();
      setOpenModal(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Lưu danh mục thất bại");
    }
  };

  // 👁️ Xem chi tiết danh mục (và danh sách sản phẩm)
  const handleView = async (record) => {
    try {
      // TODO: ⚙️ API thật: GET /api/danhmuc/:id (include SanPham)
      const res = await api.get(`/danhmuc/${record.danhMucId}`);
      setSelectedCategory(res.data);
      setDetailModal(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải chi tiết danh mục");
    }
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "tenDanhMuc",
      key: "tenDanhMuc",
      render: (text) => (
        <Space>
          <FolderOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
      render: (text) => text || "—",
    },
    {
      title: "Số lượng sản phẩm",
      key: "soLuongSanPham",
      render: (_, record) => (
        <Tag color="blue">{record.sanPham?.length || 0}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            type="default"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCategory(record);
              form.setFieldsValue(record);
              setOpenModal(true);
            }}
            type="primary"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Thanh chức năng */}
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input.Search
          placeholder="Tìm danh mục..."
          onSearch={(value) =>
            setCategories((prev) =>
              prev.filter((c) =>
                c.tenDanhMuc.toLowerCase().includes(value.toLowerCase())
              )
            )
          }
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCategory(null);
            setOpenModal(true);
          }}
        >
          Thêm danh mục
        </Button>
      </Space>

      {/* Bảng danh mục */}
      <Table
        dataSource={categories}
        columns={columns}
        loading={loading}
        rowKey="danhMucId"
        bordered
      />

      {/* Modal thêm / sửa */}
      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Tên danh mục"
            name="tenDanhMuc"
            rules={[{ required: true, message: "Nhập tên danh mục" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="moTa">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết danh mục */}
      <Modal
        open={detailModal}
        title="Chi tiết danh mục"
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={800}
      >
        {selectedCategory && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin" key="1">
              <p>
                <b>Tên danh mục:</b> {selectedCategory.tenDanhMuc}
              </p>
              <p>
                <b>Mô tả:</b> {selectedCategory.moTa || "Không có"}
              </p>
              <p>
                <b>Số lượng sản phẩm:</b>{" "}
                {selectedCategory.sanPham?.length || 0}
              </p>
            </TabPane>

            <TabPane tab="Danh sách sản phẩm" key="2">
              <Table
                dataSource={selectedCategory.sanPham || []}
                columns={[
                  { title: "Tên sản phẩm", dataIndex: "tenSanPham" },
                  {
                    title: "Giá gốc",
                    dataIndex: "giaGoc",
                    render: (val) => `${val?.toLocaleString()} ₫`,
                  },
                  { title: "Thương hiệu", dataIndex: "thuongHieu" },
                  {
                    title: "Trạng thái",
                    dataIndex: "trangThai",
                    render: (val) => (
                      <Tag color={val ? "green" : "volcano"}>
                        {val ? "Đang bán" : "Ngừng bán"}
                      </Tag>
                    ),
                  },
                ]}
                pagination={false}
                rowKey="sanPhamId"
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
}
