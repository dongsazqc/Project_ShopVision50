import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const handleSendEmail = async () => {
        try {
            const { email } = await form.validateFields(["email"]);
            setSendingEmail(true);
            await api.post("/Users/send-otp", {
                email: email,
            });
            messageApi.success(`Đã gửi OTP tới ${email}.`);
            setIsEmailSent(true);
        } catch (err) {
            if (err?.errorFields) return; // antd already shows validation errors
            console.error("Send OTP error:", err);
            messageApi.error("Không thể gửi OTP, vui lòng thử lại.");
        } finally {
            setSendingEmail(false);
        }
    };

    const handleSubmit = async (values) => {
        if (!isEmailSent) {
            messageApi.warning("Vui lòng gửi OTP tới email trước.");
            return;
        }

        const { otp } = values;
        const email = form.getFieldValue("email");
        const payload = { email, otp };

        setLoading(true);
        try {
            await api.post("/Users/forgot-password", payload);
            messageApi.success(
                `Đổi mật khẩu thành công cho ${
                    email || "tài khoản"
                }, hãy đăng nhập lại.`
            );
            navigate("/login");
        } catch (err) {
            console.error("Change password error:", err);
            messageApi.error("Có lỗi xảy ra, vui lòng thử lại.");
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
                                        Đổi mật khẩu bằng OTP
                                    </Title>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            lineHeight: 1.7,
                                            color: "#4b5563",
                                        }}
                                    >
                                        Nhập mã OTP đã gửi tới email và thiết
                                        lập mật khẩu mới để tiếp tục sử dụng hệ
                                        thống.
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
                                        ◦ Bảo mật tài khoản
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
                                        ◦ Xác thực OTP
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
                                        ◦ Đổi mật khẩu nhanh
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

                        {/* Right section - Change password form */}
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
                                        Đổi mật khẩu
                                    </Title>
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 13 }}
                                    >
                                        Nhập mã OTP nhận được và tạo mật khẩu
                                        mới cho tài khoản.
                                    </Text>
                                </div>

                                <Form
                                    layout="vertical"
                                    onFinish={handleSubmit}
                                    size="large"
                                    requiredMark={false}
                                    form={form}
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
                                            type="email"
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
                                            gap: 12,
                                            marginBottom: isEmailSent ? 0 : 12,
                                        }}
                                    >
                                        <Button
                                            type="primary"
                                            htmlType="button"
                                            block
                                            loading={sendingEmail}
                                            onClick={handleSendEmail}
                                            style={{
                                                borderRadius: 999,
                                                height: 44,
                                                fontWeight: 600,
                                                background:
                                                    "linear-gradient(135deg,#22c55e,#3b82f6)",
                                                border: "none",
                                            }}
                                        >
                                            Gửi OTP
                                        </Button>
                                    </div>

                                    {isEmailSent && (
                                        <>
                                            <Form.Item
                                                label={
                                                    <span
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        Mã OTP
                                                    </span>
                                                }
                                                name="otp"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Vui lòng nhập mã OTP!",
                                                    },
                                                    {
                                                        len: 6,
                                                        message:
                                                            "Mã OTP gồm 6 ký tự số.",
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    placeholder="Nhập mã OTP"
                                                    maxLength={6}
                                                    inputMode="numeric"
                                                    style={{
                                                        borderRadius: 999,
                                                        height: 44,
                                                        paddingInline: 16,
                                                        letterSpacing: 2,
                                                        textAlign: "center",
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </Form.Item>

                                            {/* <Form.Item
                                                label={
                                                    <span
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        Mật khẩu mới
                                                    </span>
                                                }
                                                name="newPassword"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Vui lòng nhập mật khẩu mới!",
                                                    },
                                                    {
                                                        min: 6,
                                                        message:
                                                            "Mật khẩu tối thiểu 6 ký tự.",
                                                    },
                                                ]}
                                            >
                                                <Input.Password
                                                    placeholder="Nhập mật khẩu mới"
                                                    style={{
                                                        borderRadius: 999,
                                                        height: 44,
                                                        paddingInline: 16,
                                                    }}
                                                />
                                            </Form.Item> */}
                                        </>
                                    )}

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            loading={loading}
                                            disabled={!isEmailSent}
                                            style={{
                                                borderRadius: 999,
                                                height: 44,
                                                fontWeight: 600,
                                                fontSize: 15,
                                                background:
                                                    "linear-gradient(135deg,#2563eb,#4f46e5,#ec4899)",
                                                border: "none",
                                                opacity: isEmailSent ? 1 : 0.6,
                                            }}
                                        >
                                            Đổi mật khẩu
                                        </Button>
                                    </Form.Item>
                                </Form>
                                <div className="w-full flex justify-end">
                                    <Button
                                        type="link"
                                        onClick={() => navigate("/login")}
                                    >
                                        Quay lại đăng nhập
                                    </Button>
                                </div>

                                <div
                                    style={{
                                        marginTop: 12,
                                        fontSize: 12,
                                        color: "#6b7280",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Không nhận được mã? Kiểm tra hộp thư rác
                                    hoặc liên hệ quản trị viên để được hỗ trợ.
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
