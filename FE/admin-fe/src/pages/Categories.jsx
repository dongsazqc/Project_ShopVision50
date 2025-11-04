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
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  FolderOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../utils/axios";

const { TabPane } = Tabs;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form] = Form.useForm();

  // ================= LẤY DANH MỤC =================
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/Category/GetAll");
      const list = res.data?.$values || res.data || [];
      setCategories(list);
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

  // ================= XEM + CHỈNH SỬA DANH MỤC =================
  const handleView = async (record) => {
    try {
      const res = await api.get(`/Category/${record.categoryId}`);
      setSelectedCategory(res.data);
      form.setFieldsValue({
        name: res.data.name,
        description: res.data.description,
      });
      setDetailModal(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải chi tiết danh mục");
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await api.put(`/Category/Update/${selectedCategory.categoryId}`, values);
      message.success("Cập nhật danh mục thành công!");
      setDetailModal(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật danh mục");
    }
  };

  // ================= THÊM DANH MỤC =================
  const handleAdd = async (values) => {
    try {
      await api.post("/Category", values);
      message.success("Thêm danh mục thành công!");
      setOpenModal(false);
      form.resetFields();
      fetchCategories();
    } catch (err) {
      console.error(err);
      message.error("Không thể thêm danh mục");
    }
  };

  // ================= XÓA DANH MỤC =================
  const handleDelete = async () => {
    if (!selectedCategory) {
      message.warning("Chọn danh mục để xóa");
      return;
    }
    try {
      await api.delete(`/Category/${selectedCategory.categoryId}`);
      message.success("Xóa danh mục thành công!");
      setSelectedCategory(null);
      setDetailModal(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa danh mục");
    }
  };

  // ================= CỘT TRONG BẢNG =================
  const columns = [
    {
      title: "ID",
      dataIndex: "categoryId",
      key: "categoryId",
      width: 80,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <span
          style={{
            color: "#1677ff",
            fontWeight: 400,
            cursor: "pointer",
          }}
          onClick={() => handleView(record)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "—",
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
          placeholder="Tìm danh mục..."
          onSearch={(value) =>
            setCategories((prev) =>
              prev.filter((c) =>
                c.name.toLowerCase().includes(value.toLowerCase())
              )
            )
          }
          style={{ width: 300 }}
        />
        <Space>
          <Popconfirm
            title="Bạn có chắc muốn xóa danh mục đang chọn không?"
            onConfirm={handleDelete}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa danh mục
            </Button>
          </Popconfirm>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setOpenModal(true);
            }}
          >
            Thêm danh mục
          </Button>
        </Space>
      </Space>

      <Table
        dataSource={categories}
        columns={columns}
        loading={loading}
        rowKey="categoryId"
        bordered
      />

      {/* Modal thêm mới */}
      <Modal
        title="Thêm danh mục mới"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form} onFinish={handleAdd}>
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: "Nhập tên danh mục" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết + cập nhật */}
      <Modal
        open={detailModal}
        title="Chi tiết & Cập nhật danh mục"
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setDetailModal(false)}>
            Đóng
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleUpdate}
          >
            Lưu thay đổi
          </Button>,
        ]}
        width={700}
      >
        {selectedCategory && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin" key="1">
              <Form layout="vertical" form={form}>
                <Form.Item
                  label="Tên danh mục"
                  name="name"
                  rules={[{ required: true, message: "Nhập tên danh mục" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="Danh sách sản phẩm" key="2">
              <Table
                dataSource={selectedCategory.products?.$values || []}
                columns={[
                  { title: "Tên sản phẩm", dataIndex: "name" },
                  {
                    title: "Giá",
                    dataIndex: "price",
                    render: (val) => `${val?.toLocaleString()} ₫`,
                  },
                  { title: "Thương hiệu", dataIndex: "brand" },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    render: (val) => (
                      <Tag color={val ? "green" : "volcano"}>
                        {val ? "Còn hàng" : "Hết hàng"}
                      </Tag>
                    ),
                  },
                ]}
                pagination={false}
                rowKey="productId"
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
}
