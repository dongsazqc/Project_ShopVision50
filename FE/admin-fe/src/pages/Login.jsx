import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { useAuth } from "../context/AuthContext";
import { Modal } from "antd";

const { Title, Text } = Typography;

export default function Login() {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const result = await login(values.email, values.password);

            if (!result?.success) {
                Modal.error({
                    title: "Đăng nhập thất bại",
                    content:
                        result?.message || "Email hoặc mật khẩu không đúng!",
                });
                return;
            }

            const storedUser = JSON.parse(localStorage.getItem("user"));

            if (storedUser?.roleId === 1) {
                navigate("/admin/products");
            } else if (storedUser?.roleId === 2) {
                navigate("/admin/pos");
            } else {
                Modal.warning({
                    title: "Không có quyền truy cập",
                    content:
                        "Tài khoản này không có quyền truy cập trang quản trị!",
                });
            }
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            Modal.error({
                title: "Lỗi hệ thống",
                content: "Có lỗi xảy ra, vui lòng thử lại sau!",
            });
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
                padding: 16,
                background:
                    "radial-gradient(circle at top left, #e0f7ff 0, #f4f5ff 40%, #fff5f8 75%, #ffffff 100%)",
            }}
        >
            {contextHolder}
            <div style={{ width: "100%", maxWidth: 960 }}>
                <Card
                    style={{
                        borderRadius: 24,
                        boxShadow: "0 22px 55px rgba(15,23,42,0.12)",
                        overflow: "hidden",
                        border: "1px solid rgba(203,213,225,0.8)",
                    }}
                    bodyStyle={{ padding: 0 }}
                >
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        {/* Left section */}
                        <div
                            style={{
                                flex: 1,
                                padding: 32,
                                background:
                                    "linear-gradient(135deg,#c7f5ff 0%, #e0ecff 40%, #f1ddff 100%)",
                                color: "#1f2937",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                {/* Brand */}
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
                                                "conic-gradient(from 160deg,#22c55e,#0ea5e9,#6366f1,#ec4899,#22c55e)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: "#fff",
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

                                {/* Description */}
                                <div style={{ marginBottom: 28 }}>
                                    <Title
                                        level={3}
                                        style={{
                                            marginBottom: 10,
                                            fontWeight: 700,
                                        }}
                                    >
                                        Quản lý cửa hàng thời trang thông minh
                                    </Title>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            lineHeight: 1.7,
                                            color: "#4b5563",
                                        }}
                                    >
                                        Theo dõi sản phẩm, đơn hàng và điểm bán
                                        trên cùng một nền tảng dễ sử dụng.
                                    </Text>
                                </div>

                                {/* Tags */}
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
                                            background: "rgba(59,130,246,0.08)",
                                            border: "1px solid rgba(59,130,246,0.25)",
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
                                            background: "rgba(16,185,129,0.08)",
                                            border: "1px solid rgba(16,185,129,0.25)",
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
                                            background: "rgba(236,72,153,0.06)",
                                            border: "1px solid rgba(236,72,153,0.25)",
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
                                © {new Date().getFullYear()} StyleWear.
                            </div>
                        </div>

                        {/* Right section - Login Form */}
                        <div
                            style={{
                                flex: 1,
                                padding: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#fff",
                            }}
                        >
                            <div style={{ width: "100%", maxWidth: 360 }}>
                                <div style={{ marginBottom: 24 }}>
                                    <Title
                                        level={3}
                                        style={{
                                            marginBottom: 8,
                                            fontWeight: 700,
                                        }}
                                    >
                                        Đăng nhập quản trị
                                    </Title>
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 13 }}
                                    >
                                        Vui lòng dùng tài khoản đã được cấp
                                        quyền.
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
                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                Email
                                            </span>
                                        }
                                        name="email"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng nhập email!",
                                            },
                                            {
                                                type: "email",
                                                message: "Email không hợp lệ!",
                                            },
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
                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                Mật khẩu
                                            </span>
                                        }
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Vui lòng nhập mật khẩu!",
                                            },
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
                                            marginBottom: 16,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#6b7280",
                                            }}
                                        >
                                            Chỉ sử dụng trên thiết bị đáng tin
                                            cậy.
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                // messageApi.info(
                                                //     "Liên hệ quản trị viên để cấp lại mật khẩu."
                                                // )
                                                navigate("/forgot-password")
                                            }
                                            style={{
                                                border: "none",
                                                background: "none",
                                                padding: 0,
                                                color: "#2563eb",
                                                cursor: "pointer",
                                                fontSize: 12,
                                            }}
                                        >
                                            Quên mật khẩu?
                                        </button>
                                    </div>

                                    <Form.Item>
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
                                                    "linear-gradient(135deg,#2563eb,#4f46e5,#ec4899)",
                                                border: "none",
                                            }}
                                        >
                                            Đăng nhập
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}