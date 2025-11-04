import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message, Spin } from "antd";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser?.roleId === 1) {
          navigate("/admin/dashboard");
        } else if (storedUser?.roleId === 3) {
          navigate("/admin/pos");
        } else {
          message.warning("Tài khoản không có quyền truy cập trang quản trị!");
        }
      }
    } catch (err) {
      console.error(err);
      message.error("Đăng nhập thất bại — cần backend bổ sung API!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f5f6fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 4px 18px rgba(0, 0, 0, 0.08)",
          borderRadius: 12,
          background: "#fff",
          padding: "30px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Title
            level={3}
            style={{
              color: "#1677ff",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            StyleWear Admin
          </Title>
          <Text type="secondary">Đăng nhập hệ thống quản trị</Text>
        </div>

        <Form layout="vertical" onFinish={handleLogin} size="large">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              placeholder="Nhập email của bạn"
              style={{
                borderRadius: 6,
                height: 42,
              }}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu"
              style={{
                borderRadius: 6,
                height: 42,
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                borderRadius: 6,
                height: 42,
                fontWeight: 500,
                fontSize: 15,
                backgroundColor: "#1677ff",
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        {loading && (
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <Spin size="small" />
          </div>
        )}
      </Card>
    </div>
  );
}
