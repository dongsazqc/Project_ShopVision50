import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message } from "antd";
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
          navigate("/admin/products");
        } else if (storedUser?.roleId === 3) {
          navigate("/admin/pos");
        } else {
          message.warning("Tài khoản không có quyền truy cập trang quản trị!");
        }
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      message.error("Lỗi đăng nhập, thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background:
          "radial-gradient(circle at top left, #e0f7ff 0, #f4f5ff 40%, #fff5f8 75%, #ffffff 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
        }}
      >
        <Card
          style={{
            borderRadius: 24,
            boxShadow: "0 22px 55px rgba(15, 23, 42, 0.12)",
            overflow: "hidden",
            border: "1px solid rgba(203, 213, 225, 0.8)",
            padding: 0,
          }}
          bodyStyle={{
            padding: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            {/* Cột trái: pastel mint + tím */}
            <div
              style={{
                flex: 1,
                padding: "32px",
                background:
                  "linear-gradient(135deg, #c7f5ff 0%, #e0ecff 40%, #f1ddff 100%)",
                color: "#1f2937",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                {/* Logo / Brand nhỏ */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 28,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background:
                        "conic-gradient(from 160deg, #22c55e, #0ea5e9, #6366f1, #ec4899, #22c55e)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "#f9fafb",
                        fontWeight: 800,
                        fontSize: 20,
                      }}
                    >
                      S
                    </span>
                  </div>
                  <div>
                    <Text
                      style={{
                        color: "#111827",
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      StyleWear Admin
                    </Text>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#4b5563",
                      }}
                    >
                      Fashion Store Management Panel
                    </div>
                  </div>
                </div>

                {/* Title + mô tả */}
                <div style={{ marginBottom: 28 }}>
                  <Title
                    level={3}
                    style={{
                      color: "#111827",
                      marginBottom: 10,
                      fontWeight: 700,
                    }}
                  >
                    Quản lý cửa hàng thời trang thông minh
                  </Title>
                  <Text
                    style={{
                      color: "#4b5563",
                      fontSize: 14,
                      lineHeight: 1.7,
                    }}
                  >
                    Theo dõi sản phẩm, đơn hàng và điểm bán (POS) trên cùng một
                    nền tảng. Tối ưu cho admin với giao diện hiện đại, trực
                    quan và dễ sử dụng.
                  </Text>
                </div>

                {/* Tag nhỏ */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(59, 130, 246, 0.08)",
                      border: "1px solid rgba(59, 130, 246, 0.25)",
                      fontSize: 12,
                      color: "#1d4ed8",
                    }}
                  >
                    ◦ Quản lý tồn kho
                  </div>
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      fontSize: 12,
                      color: "#047857",
                    }}
                  >
                    ◦ Theo dõi doanh thu
                  </div>
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(236, 72, 153, 0.06)",
                      border: "1px solid rgba(236, 72, 153, 0.25)",
                      fontSize: 12,
                      color: "#db2777",
                    }}
                  >
                    ◦ Đồng bộ POS
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 28,
                  fontSize: 12,
                  color: "#6b7280",
                }}
              >
                © {new Date().getFullYear()} StyleWear. Designed for modern
                fashion brands.
              </div>
            </div>

            {/* Cột phải: Form login, nền trắng */}
            <div
              style={{
                flex: 1,
                padding: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ width: "100%", maxWidth: 360 }}>
                <div style={{ marginBottom: 24 }}>
                  <Title
                    level={3}
                    style={{
                      marginBottom: 8,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Đăng nhập quản trị
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Vui lòng đăng nhập bằng email nội bộ hoặc tài khoản đã được
                    cấp quyền truy cập.
                  </Text>
                </div>

                <Form
                  layout="vertical"
                  onFinish={handleLogin}
                  size="large"
                  requiredMark={false}
                >
                  <Form.Item
                    label={
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        Email
                      </span>
                    }
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <Input
                      placeholder="Nhập email"
                      style={{
                        borderRadius: 999,
                        height: 44,
                        paddingInline: 16,
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        Mật khẩu
                      </span>
                    }
                    name="password"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                    ]}
                  >
                    <Input.Password
                      placeholder="Nhập mật khẩu"
                      style={{
                        borderRadius: 999,
                        height: 44,
                        paddingInline: 16,
                      }}
                    />
                  </Form.Item>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      Chỉ sử dụng trên thiết bị đáng tin cậy.
                    </div>
                    <button
                      type="button"
                      style={{
                        border: "none",
                        background: "none",
                        padding: 0,
                        color: "#2563eb",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        message.info(
                          "Liên hệ quản trị viên để được hỗ trợ cấp lại mật khẩu."
                        );
                      }}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  <Form.Item style={{ marginBottom: 12 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                      style={{
                        borderRadius: 999,
                        height: 44,
                        fontWeight: 600,
                        fontSize: 15,
                        background:
                          "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #ec4899 100%)",
                        border: "none",
                        boxShadow: "0 14px 28px rgba(129, 140, 248, 0.35)",
                      }}
                    >
                      Đăng nhập
                    </Button>
                  </Form.Item>

                  {/* <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      textAlign: "center",
                      lineHeight: 1.6,
                    }}
                  >
                    Bằng việc đăng nhập, bạn đồng ý với{" "}
                    <span
                      style={{
                        color: "#2563eb",
                        cursor: "pointer",
                      }}
                    >
                      Điều khoản sử dụng
                    </span>{" "}
                    và{" "}
                    <span
                      style={{
                        color: "#2563eb",
                        cursor: "pointer",
                      }}
                    >
                      Chính sách bảo mật
                    </span>{" "}
                    của StyleWear.
                  </div> */}
                </Form>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Responsive */}
      <style>
        {`
          @media (max-width: 768px) {
            .ant-card {
              border-radius: 18px !important;
            }
            .ant-card > div {
              flex-direction: column !important;
            }
          }

          @media (max-width: 640px) {
            .ant-card {
              box-shadow: 0 18px 40px rgba(148, 163, 184, 0.45) !important;
            }
          }
        `}
      </style>
    </div>
  );
}
