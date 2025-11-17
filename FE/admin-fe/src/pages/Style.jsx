import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined, FolderOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../utils/axios";

export default function StylePage() {
  const [styles, setStyles] = useState([]);
  const [allStyles, setAllStyles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);

  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();

  // ================= LẤY TẤT CẢ STYLE =================
  const fetchStyles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/Style/GetAll");
      const list = res.data?.$values || res.data || [];
      setStyles(list);
      setAllStyles(list);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách phong cách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStyles();
  }, []);

  // ================= TÌM KIẾM STYLE =================
  const handleSearch = (value) => {
    if (!value.trim()) {
      setStyles(allStyles);
    } else {
      setStyles(
        allStyles.filter((s) =>
          (s.name || "").toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  // ================= THÊM STYLE =================
  const handleAdd = async (values) => {
    try {
      setSaving(true);
      const name = values.name.trim();
      const exists = allStyles.some(
        (s) => (s.name || "").trim().toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        message.warning("Tên phong cách đã tồn tại!");
        return;
      }

      await api.post("/Style/CreateStyle", { name });
      message.success("Thêm phong cách thành công!");
      setAddModalOpen(false);
      formAdd.resetFields();
      fetchStyles();
    } catch (err) {
      console.error(err);
      message.error("Không thể thêm phong cách");
    } finally {
      setSaving(false);
    }
  };

  // ================= MỞ MODAL CHỈNH SỬA =================
  const openEditModal = async (record) => {
    try {
      const res = await api.get(`/Style/GetStyleById/${record.styleId}`);
      const style = res.data;
      setSelectedStyle(style);

      formEdit.setFieldsValue({
        name: style.name,
      });

      setEditModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải thông tin phong cách");
    }
  };

  // ================= CẬP NHẬT STYLE =================
  const handleUpdate = async (values) => {
    try {
      setSaving(true);
      const name = values.name.trim();
      const exists = allStyles.some(
        (s) =>
          (s.name || "").trim().toLowerCase() === name.toLowerCase() &&
          s.styleId !== selectedStyle.styleId
      );
      if (exists) {
        message.warning("Tên phong cách đã tồn tại!");
        return;
      }

      const payload = {
        styleId: selectedStyle.styleId,
        name,
      };

      await api.put(`/Style/UpdateStyle/${selectedStyle.styleId}`, payload);
      message.success("Cập nhật phong cách thành công!");
      setEditModalOpen(false);
      setSelectedStyle(null);
      fetchStyles();
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật phong cách");
    } finally {
      setSaving(false);
    }
  };

  // ================= XÓA STYLE =================
  const handleDelete = async (id) => {
    try {
      await api.delete(`/Style/DeleteStyle/${id}`);
      message.success("Xóa phong cách thành công!");
      fetchStyles();
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa phong cách");
    }
  };

  // ================= CỘT HIỂN THỊ =================
  const columns = [
    {
      title: "ID",
      dataIndex: "styleId",
      key: "styleId",
      width: 80,
      sorter: (a, b) => a.styleId - b.styleId,
      defaultSortOrder: "descend",
    },
    {
      title: "Tên phong cách",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <span
          style={{
            color: "#1677ff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => openEditModal(record)}
        >
          <FolderOutlined style={{ marginRight: 6 }} />
          {text}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title={`Xóa phong cách "${record.name}"?`}
          onConfirm={() => handleDelete(record.styleId)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
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
          placeholder="Tìm phong cách..."
          onSearch={handleSearch}
          allowClear
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            formAdd.resetFields();
            setAddModalOpen(true);
          }}
        >
          Thêm phong cách
        </Button>
      </Space>

      <Table
        dataSource={[...styles].sort((a, b) => b.styleId - a.styleId)}
        columns={columns}
        loading={loading}
        rowKey="styleId"
        bordered
        pagination={{ pageSize: 15 }}
      />

      {/* Modal thêm mới */}
      <Modal
        title="Thêm phong cách mới"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={() => formAdd.submit()}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
      >
        <Form layout="vertical" form={formAdd} onFinish={handleAdd} preserve={false}>
          <Form.Item
            label="Tên phong cách"
            name="name"
            rules={[
              { required: true, message: "Nhập tên phong cách" },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject("Tên phong cách không được chỉ chứa khoảng trắng");
                  }
                  const name = value.trim().toLowerCase();
                  const exists = allStyles.some(
                    (s) => (s.name || "").trim().toLowerCase() === name
                  );
                  if (exists) {
                    return Promise.reject("Tên phong cách đã tồn tại");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="VD: Basic, Streetwear, Vintage..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Cập nhật phong cách"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => formEdit.submit()}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
      >
        <Form layout="vertical" form={formEdit} onFinish={handleUpdate} preserve={false}>
          <Form.Item
            label="Tên phong cách"
            name="name"
            rules={[
              { required: true, message: "Nhập tên phong cách" },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject("Tên phong cách không được chỉ chứa khoảng trắng");
                  }
                  const name = value.trim().toLowerCase();
                  const exists = allStyles.some(
                    (s) =>
                      (s.name || "").trim().toLowerCase() === name &&
                      s.styleId !== selectedStyle?.styleId
                  );
                  if (exists) {
                    return Promise.reject("Tên phong cách đã tồn tại");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
