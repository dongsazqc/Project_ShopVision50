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

export default function Material() {
  const [materials, setMaterials] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();

  // ================= LẤY TẤT CẢ MATERIAL =================
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get("/Material/GetAll");
      const list = res.data?.$values || res.data || [];
      setMaterials(list);
      setAllMaterials(list);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách chất liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // ================= TÌM KIẾM MATERIAL =================
  const handleSearch = (value) => {
    if (!value.trim()) {
      setMaterials(allMaterials);
    } else {
      setMaterials(
        allMaterials.filter((m) =>
          (m.name || "").toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  // ================= THÊM MATERIAL =================
  const handleAdd = async (values) => {
    try {
      setSaving(true);
      const name = values.name.trim();

      const exists = allMaterials.some(
        (m) => (m.name || "").trim().toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        message.warning("Tên chất liệu đã tồn tại!");
        return;
      }

      await api.post("/Material/Create", { name });
      message.success("Thêm chất liệu thành công!");
      setAddModalOpen(false);
      formAdd.resetFields();
      fetchMaterials();
    } catch (err) {
      console.error(err);
      message.error("Không thể thêm chất liệu");
    } finally {
      setSaving(false);
    }
  };

  // ================= MỞ MODAL CHỈNH SỬA =================
  const openEditModal = async (record) => {
    try {
      const res = await api.get(`/Material/GetById/${record.materialId}`);
      const material = res.data;
      setSelectedMaterial(material);

      formEdit.setFieldsValue({
        name: material.name,
      });

      setEditModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải thông tin chất liệu");
    }
  };

  // ================= CẬP NHẬT MATERIAL =================
  const handleUpdate = async (values) => {
    try {
      setSaving(true);
      const name = values.name.trim();

      const exists = allMaterials.some(
        (m) =>
          (m.name || "").trim().toLowerCase() === name.toLowerCase() &&
          m.materialId !== selectedMaterial.materialId
      );
      if (exists) {
        message.warning("Tên chất liệu đã tồn tại!");
        return;
      }

      const payload = {
        materialId: selectedMaterial.materialId,
        name,
      };

      await api.put(`/Material/Update/${selectedMaterial.materialId}`, payload);
      message.success("Cập nhật chất liệu thành công!");
      setEditModalOpen(false);
      setSelectedMaterial(null);
      fetchMaterials();
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật chất liệu");
    } finally {
      setSaving(false);
    }
  };

  // ================= XÓA MATERIAL =================
  const handleDelete = async (id) => {
    try {
      await api.delete(`/Material/DeleteMaterial/${id}`);
      message.success("Xóa chất liệu thành công!");
      fetchMaterials();
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa chất liệu");
    }
  };

  // ================= CỘT HIỂN THỊ =================
  const columns = [
    {
      title: "ID",
      dataIndex: "materialId",
      key: "materialId",
      width: 80,
      sorter: (a, b) => a.materialId - b.materialId,
      defaultSortOrder: "descend",
    },
    {
      title: "Tên chất liệu",
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
          title={`Xóa chất liệu "${record.name}"?`}
          onConfirm={() => handleDelete(record.materialId)}
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
          placeholder="Tìm chất liệu..."
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
          Thêm chất liệu
        </Button>
      </Space>

      <Table
        dataSource={[...materials].sort((a, b) => b.materialId - a.materialId)}
        columns={columns}
        loading={loading}
        rowKey="materialId"
        bordered
        pagination={{ pageSize: 15 }}
      />

      {/* Modal thêm mới */}
      <Modal
        title="Thêm chất liệu mới"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={() => formAdd.submit()}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
      >
        <Form layout="vertical" form={formAdd} onFinish={handleAdd} preserve={false}>
          <Form.Item
            label="Tên chất liệu"
            name="name"
            rules={[
              { required: true, message: "Nhập tên chất liệu" },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject("Tên chất liệu không được chỉ chứa khoảng trắng");
                  }
                  const name = value.trim().toLowerCase();
                  const exists = allMaterials.some(
                    (m) => (m.name || "").trim().toLowerCase() === name
                  );
                  if (exists) {
                    return Promise.reject("Tên chất liệu đã tồn tại");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="VD: Cotton, Polyester..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Cập nhật chất liệu"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => formEdit.submit()}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
      >
        <Form layout="vertical" form={formEdit} onFinish={handleUpdate} preserve={false}>
          <Form.Item
            label="Tên chất liệu"
            name="name"
            rules={[
              { required: true, message: "Nhập tên chất liệu" },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject("Tên chất liệu không được chỉ chứa khoảng trắng");
                  }
                  const name = value.trim().toLowerCase();
                  const exists = allMaterials.some(
                    (m) =>
                      (m.name || "").trim().toLowerCase() === name &&
                      m.materialId !== selectedMaterial?.materialId
                  );
                  if (exists) {
                    return Promise.reject("Tên chất liệu đã tồn tại");
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
