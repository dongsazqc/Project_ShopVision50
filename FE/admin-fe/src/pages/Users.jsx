// src/pages/admin/Users.jsx
import { Table, Button, Space, Modal, message, Tabs } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";

const { TabPane } = Tabs;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // =======================
  // 📦 Lấy danh sách từ API
  // =======================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://160.250.5.26:5000/api/Auth/getAllUsers"
      );
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      message.error("Lấy danh sách thất bại!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🗑️ Xóa local
  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    message.success("Đã xóa (local)!");
  };

  // 👁️ Xem chi tiết
  const handleView = (user) => {
    setSelectedUser(user);
    setDetailModal(true);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
      />

      {/* MODAL CHI TIẾT */}
      <Modal
        open={detailModal}
        title="Chi tiết người dùng"
        onCancel={() => setDetailModal(false)}
        footer={null}
      >
        {selectedUser && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin cơ bản" key="1">
              <p>
                <b>ID:</b> {selectedUser.id}
              </p>
              <p>
                <b>Username:</b> {selectedUser.username}
              </p>
              <p>
                <b>Email:</b> {selectedUser.email}
              </p>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
}
