// src/pages/Users.jsx
import {
  Table,
  Button,
  Tag,
  message,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../utils/axios";

const { Option } = Select;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form] = Form.useForm();
  const [formAdd] = Form.useForm();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterRole, setFilterRole] = useState(null);

  // ================== FETCH USERS ==================
  const fetchUsers = async () => {
    let mounted = true;
    try {
      setLoading(true);
      const res = await api.get("/Users/getAll");
      const list = res.data?.$values || [];

      if (!mounted) return;

      const formatted = list.map((u) => {
        const roleId = u.userRoles?.$values?.[0]?.role?.roleId || 4;
        let roleName = "Khách hàng";
        if (roleId === 1) roleName = "Admin";
        else if (roleId === 3) roleName = "Nhân viên";

        return {
          ...u,
          role: roleName,
          roleId,
          joinDate: u.joinDate
            ? new Date(u.joinDate).toLocaleDateString("vi-VN")
            : "—",
        };
      });

      setUsers(formatted);
      setFilteredUsers(formatted);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Không thể tải danh sách người dùng";
      message.error(msg);
    } finally {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================== FILTER USERS ==================
  useEffect(() => {
    let data = [...users];

    if (search.trim()) {
      data = data.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterStatus !== null) {
      data = data.filter((u) => String(u.status) === filterStatus);
    }

    if (filterRole !== null) {
      data = data.filter((u) => String(u.roleId) === filterRole);
    }

    setFilteredUsers(data);
  }, [search, filterStatus, filterRole, users]);

  // ================== EDIT USER ==================
  const openModal = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      defaultAddress: user.defaultAddress,
      joinDate: user.joinDate,
      roleId: user.roleId,
      status: user.status,
    });
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    form.resetFields();
  };

  const submitUpdate = async (values) => {
    try {
      if (!selectedUser) return;

      const payload = {
        UserId: selectedUser.userId,
        FullName: values.fullName,
        Email: values.email,
        Phone: values.phone,
        Status: values.status,
        DefaultAddress: values.defaultAddress,
        RoleId: values.roleId,
      };

      await api.put(`/Users/update/${selectedUser.userId}`, payload);

      message.success("Cập nhật người dùng thành công!");
      closeEditModal();
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Cập nhật người dùng thất bại!";
      message.error(msg);
    }
  };

  // ================== ADD USER ==================
  const openAddModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    formAdd.resetFields();
    formAdd.setFieldsValue({
      status: true,
      joinDate: today,
    });
    setModalAddOpen(true);
  };

  const closeAddModal = () => {
    setModalAddOpen(false);
    formAdd.resetFields();
  };

  const submitAdd = async (values) => {
    try {
      const payload = {
        FullName: values.fullName,
        Email: values.email,
        Phone: values.phone,
        Password: "123456",
        Status: values.status,
        JoinDate: new Date(values.joinDate).toISOString(),
        DefaultAddress: values.defaultAddress,
        RoleId: values.roleId,
      };

      await api.post("/Users/register", payload);

      message.success("Thêm người dùng thành công!");
      closeAddModal();
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Thêm người dùng thất bại!";
      message.error(msg);
    }
  };

  // ================== TABLE COLUMNS ==================
  const columns = [
    { title: "ID", dataIndex: "userId", width: 60 },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      render: (text, record) => (
        <span
          style={{ color: "#1677ff", cursor: "pointer" }}
          onClick={() => openModal(record)}
        >
          {text}
        </span>
      ),
    },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone", render: (v) => v || "—" },
    { title: "Vai trò", dataIndex: "role" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (v) =>
        v ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Khóa</Tag>,
    },
    { title: "Ngày tham gia", dataIndex: "joinDate" },
  ];

  // ================== RENDER ==================
  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Quản lý người dùng</h2>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Tìm theo tên / email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col span={5}>
          <Select
            allowClear
            placeholder="Lọc trạng thái"
            style={{ width: "100%" }}
            onChange={setFilterStatus}
          >
            <Option value="true">Hoạt động</Option>
            <Option value="false">Khóa</Option>
          </Select>
        </Col>
        <Col span={5}>
          <Select
            allowClear
            placeholder="Lọc vai trò"
            style={{ width: "100%" }}
            onChange={setFilterRole}
          >
            <Option value="1">Admin</Option>
            <Option value="3">Nhân viên</Option>
            <Option value="4">Khách hàng</Option>
          </Select>
        </Col>
        <Col span={6} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddModal}
          >
            Thêm người dùng
          </Button>
        </Col>
      </Row>

      <Table
        rowKey="userId"
        dataSource={filteredUsers}
        columns={columns}
        loading={loading}
        bordered
        pagination={{ pageSize: 15 }}
      />

      {/* ================== EDIT MODAL ================== */}
      <Modal
        open={modalOpen}
        onCancel={closeEditModal}
        title="Cập nhật người dùng"
        footer={[
          <Button onClick={closeEditModal}>Hủy</Button>,
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={submitUpdate}>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="defaultAddress" label="Địa chỉ mặc định">
            <Input />
          </Form.Item>
          <Form.Item name="joinDate" label="Ngày tham gia">
            <Input disabled />
          </Form.Item>
          <Form.Item name="roleId" label="Vai trò">
            <Select>
              <Option value={1}>Admin</Option>
              <Option value={3}>Nhân viên</Option>
              <Option value={4}>Khách hàng</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Khóa</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* ================== ADD MODAL ================== */}
      <Modal
        open={modalAddOpen}
        onCancel={closeAddModal}
        title="Thêm người dùng"
        footer={[
          <Button onClick={closeAddModal}>Hủy</Button>,
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => formAdd.submit()}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form form={formAdd} layout="vertical" onFinish={submitAdd}>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="defaultAddress" label="Địa chỉ mặc định">
            <Input />
          </Form.Item>
          <Form.Item name="joinDate" label="Ngày tham gia">
            <Input disabled />
          </Form.Item>
          <Form.Item name="roleId" label="Vai trò" rules={[{ required: true }]}>
            <Select>
              <Option value={1}>Admin</Option>
              <Option value={3}>Nhân viên</Option>
              <Option value={4}>Khách hàng</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Khóa</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
