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

export default function Gender() {
  const [genders, setGenders] = useState([]);
  const [allGenders, setAllGenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null);

  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();

  // ================= LẤY TẤT CẢ GENDER =================
  const fetchGenders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/Gender/GetAll");
      const list = res.data?.$values || res.data || [];
      setGenders(list);
      setAllGenders(list);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách giới tính");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenders();
  }, []);

  // ================= TÌM KIẾM GENDER =================
  const handleSearch = (value) => {
    if (!value.trim()) {
      setGenders(allGenders);
    } else {
      setGenders(
        allGenders.filter((g) =>
          (g.name || "").toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  // ================= THÊM GENDER =================
  const handleAdd = async (values) => {
    try {
      setSaving(true);
      const name = values.name.trim();
      const exists = allGenders.some(
        (g) => (g.name || "").trim().toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        message.warning("Tên giới tính đã tồn tại!");
        return;
      }

      await api.post("/Gender/CreateGender", { name });
      message.success("Thêm giới tính thành công!");
      setAddModalOpen(false);
      formAdd.resetFields();
      fetchGenders();
    } catch (err) {
      console.error(err);
      message.error("Không thể thêm giới tính");
    } finally {
      setSaving(false);
    }
  };

  // ================= MỞ MODAL CHỈNH SỬA =================
  const openEditModal = async (record) => {
    try {
      const res = await api.get(`/Gender/GetGenderById/${record.genderId}`);
      const gender = res.data;
      setSelectedGender(gender);
      formEdit.setFieldsValue({ name: gender.name });
      setEditModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải thông tin giới tính");
    }
  };

  // ================= CẬP NHẬT GENDER =================
  const handleUpdate = async (values) => {
    try {
      setSaving(true);
      const name = values.name.trim();
      const exists = allGenders.some(
        (g) =>
          (g.name || "").trim().toLowerCase() === name.toLowerCase() &&
          g.genderId !== selectedGender.genderId
      );
      if (exists) {
        message.warning("Tên giới tính đã tồn tại!");
        return;
      }

      await api.put(`/Gender/UpdateGender/${selectedGender.genderId}`, {
        genderId: selectedGender.genderId,
        name,
      });

      message.success("Cập nhật giới tính thành công!");
      setEditModalOpen(false);
      setSelectedGender(null);
      fetchGenders();
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật giới tính");
    } finally {
      setSaving(false);
    }
  };

  // ================= XÓA GENDER =================
  const handleDelete = async (id) => {
    try {
      await api.delete(`/Gender/DeleteGender/${id}`);
      message.success("Xóa giới tính thành công!");
      fetchGenders();
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa giới tính");
    }
  };

  // ================= CỘT HIỂN THỊ =================
  const columns = [
    { title: "ID", dataIndex: "genderId", key: "genderId", width: 80, sorter: (a, b) => a.genderId - b.genderId, defaultSortOrder: "descend" },
    {
      title: "Tên giới tính",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <span
          style={{ color: "#1677ff", cursor: "pointer", display: "flex", alignItems: "center" }}
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
          title={`Xóa giới tính "${record.name}"?`}
          onConfirm={() => handleDelete(record.genderId)}
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
      <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Input.Search placeholder="Tìm giới tính..." onSearch={handleSearch} allowClear style={{ width: 300 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { formAdd.resetFields(); setAddModalOpen(true); }}>
          Thêm giới tính
        </Button>
      </Space>

      <Table
        dataSource={[...genders].sort((a, b) => b.genderId - a.genderId)}
        columns={columns}
        loading={loading}
        rowKey="genderId"
        bordered
        pagination={{ pageSize: 15 }}
      />

      {/* Modal thêm mới */}
      <Modal
        title="Thêm giới tính mới"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={() => formAdd.submit()}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
      >
        <Form layout="vertical" form={formAdd} onFinish={handleAdd} preserve={false}>
          <Form.Item
            label="Tên giới tính"
            name="name"
            rules={[
              { required: true, message: "Nhập tên giới tính" },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) return Promise.reject("Tên giới tính không được chỉ chứa khoảng trắng");
                  const name = value.trim().toLowerCase();
                  if (allGenders.some(g => (g.name || "").trim().toLowerCase() === name)) {
                    return Promise.reject("Tên giới tính đã tồn tại");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="VD: Nam, Nữ, Unisex..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Cập nhật giới tính"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => formEdit.submit()}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
      >
        <Form layout="vertical" form={formEdit} onFinish={handleUpdate} preserve={false}>
          <Form.Item
            label="Tên giới tính"
            name="name"
            rules={[
              { required: true, message: "Nhập tên giới tính" },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) return Promise.reject("Tên giới tính không được chỉ chứa khoảng trắng");
                  const name = value.trim().toLowerCase();
                  if (allGenders.some(g => (g.name || "").trim().toLowerCase() === name && g.genderId !== selectedGender?.genderId)) {
                    return Promise.reject("Tên giới tính đã tồn tại");
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
