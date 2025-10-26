// src/pages/Users.jsx
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Popconfirm,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../utils/axios"; // ⚙️ axios cấu hình sẵn baseURL + token interceptor

const { Option } = Select;
const { TabPane } = Tabs;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  // 📦 Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: ⚙️ thay API thật tại đây: GET /api/nguoidung
      const res = await api.get("/nguoidung");
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // 📋 Lấy danh sách vai trò
  const fetchRoles = async () => {
    try {
      // TODO: ⚙️ API thật: GET /api/vaitro
      const res = await api.get("/vaitro");
      setRoles(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // 💾 Thêm / sửa người dùng
  const handleSave = async (values) => {
    try {
      if (editingUser) {
        // TODO: ⚙️ API thật: PUT /api/nguoidung/:id
        await api.put(`/nguoidung/${editingUser.nguoiDungId}`, values);
        message.success("Cập nhật người dùng thành công");
      } else {
        // TODO: ⚙️ API thật: POST /api/nguoidung
        await api.post("/nguoidung", values);
        message.success("Thêm người dùng thành công");
      }
      fetchUsers();
      setOpenModal(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Lưu thất bại");
    }
  };

  // 🔒 Đổi trạng thái người dùng (hoạt động <-> khóa)
  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.trangThai;
      // TODO: ⚙️ API thật: PUT /api/nguoidung/{id}/trangthai hoặc tương đương
      await api.put(`/nguoidung/${user.nguoiDungId}`, {
        ...user,
        trangThai: newStatus,
      });
      message.success(
        newStatus ? "Mở khóa người dùng thành công" : "Khóa người dùng thành công"
      );
      fetchUsers();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  // 👁️ Xem chi tiết
  const handleView = async (record) => {
    try {
      // TODO: ⚙️ API thật: GET /api/nguoidung/:id (bao gồm địa chỉ)
      const res = await api.get(`/nguoidung/${record.nguoiDungId}`);
      setSelectedUser(res.data);
      setDetailModal(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải chi tiết người dùng");
    }
  };

  const columns = [
    { title: "Họ tên", dataIndex: "hoTen", key: "hoTen" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "soDienThoai", key: "soDienThoai" },
    {
      title: "Vai trò",
      dataIndex: "vaiTro",
      key: "vaiTro",
      render: (val) => (
        <Tag color={val?.tenVaiTro === "Admin" ? "red" : "blue"}>
          {val?.tenVaiTro || "Khách hàng"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (val) =>
        val ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="volcano">Đã khóa</Tag>
        ),
    },
    {
      title: "Ngày tham gia",
      dataIndex: "ngayThamGia",
      key: "ngayThamGia",
      render: (val) => new Date(val).toLocaleDateString("vi-VN"),
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
              setEditingUser(record);
              form.setFieldsValue(record);
              setOpenModal(true);
            }}
            type="primary"
          />
          <Popconfirm
            title={
              record.trangThai
                ? "Khóa tài khoản người dùng này?"
                : "Mở khóa tài khoản người dùng này?"
            }
            onConfirm={() => handleToggleStatus(record)}
          >
            <Button
              icon={record.trangThai ? <LockOutlined /> : <UnlockOutlined />}
              danger={record.trangThai}
              type="default"
            />
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
          placeholder="Tìm người dùng..."
          onSearch={(value) =>
            setUsers((prev) =>
              prev.filter((u) =>
                u.hoTen.toLowerCase().includes(value.toLowerCase())
              )
            )
          }
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingUser(null);
            setOpenModal(true);
          }}
        >
          Thêm người dùng
        </Button>
      </Space>

      {/* Bảng người dùng */}
      <Table
        dataSource={users}
        columns={columns}
        loading={loading}
        rowKey="nguoiDungId"
        bordered
      />

      {/* Modal thêm / sửa */}
      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Họ tên"
            name="hoTen"
            rules={[{ required: true, message: "Nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              label="Mật khẩu"
              name="matKhau"
              rules={[{ required: true, message: "Nhập mật khẩu" }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item label="Số điện thoại" name="soDienThoai">
            <Input />
          </Form.Item>
          <Form.Item label="Địa chỉ mặc định" name="diaChiMacDinh">
            <Input />
          </Form.Item>
          <Form.Item label="Vai trò" name="vaiTroId">
            <Select placeholder="Chọn vai trò">
              {roles.map((r) => (
                <Option key={r.vaiTroId} value={r.vaiTroId}>
                  {r.tenVaiTro}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết */}
      <Modal
        open={detailModal}
        title="Chi tiết người dùng"
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={700}
      >
        {selectedUser && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin cá nhân" key="1">
              <p><b>Họ tên:</b> {selectedUser.hoTen}</p>
              <p><b>Email:</b> {selectedUser.email}</p>
              <p><b>Số điện thoại:</b> {selectedUser.soDienThoai}</p>
              <p><b>Vai trò:</b> {selectedUser.vaiTro?.tenVaiTro}</p>
              <p><b>Trạng thái:</b> {selectedUser.trangThai ? "Hoạt động" : "Đã khóa"}</p>
            </TabPane>
            <TabPane tab="Địa chỉ người dùng" key="2">
              <Table
                dataSource={selectedUser.diaChiNguoiDung || []}
                columns={[
                  { title: "Họ tên nhận", dataIndex: "hoTenNhan" },
                  { title: "SĐT nhận", dataIndex: "soDienThoaiNhan" },
                  { title: "Địa chỉ chi tiết", dataIndex: "diaChiChiTiet" },
                  {
                    title: "Mặc định",
                    dataIndex: "macDinh",
                    render: (val) => (val ? "✅" : "—"),
                  },
                ]}
                pagination={false}
                rowKey="diaChiId"
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
}
