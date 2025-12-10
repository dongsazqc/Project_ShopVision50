import { useState } from "react";
import { Form, Input, Button, Card, message, Modal, Steps, Alert } from "antd";
import { useNavigate, Link } from "react-router-dom";
import {
    MailOutlined,
    UnlockOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import api from "../utils/axios";

const { Step } = Steps;

const Login = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // ===== Forgot password states =====
    const [openForgot, setOpenForgot] = useState(false);
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: success
    const [forgotLoading, setForgotLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    // ================= LOGIN =================
    const onFinish = async (values) => {
        try {
            setLoading(true);
            const res = await api.post("/Login/login", {
                Email: values.email,
                Password: values.password,
            });

            console.log("Login response:", res.data); // debug

            if (res.data?.token && res.data?.user) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userId", res.data.user.userId);
                localStorage.setItem("email", res.data.user.email);
                localStorage.setItem("fullName", res.data.user.fullName);
                localStorage.setItem("role", res.data.user.roleId);

                messageApi.success("Đăng nhập thành công");

                // Redirect về trang cũ hoặc home
                const redirect =
                    new URLSearchParams(window.location.search).get(
                        "redirect"
                    ) || "/";
                navigate(redirect, { replace: true });
            } else {
                messageApi.error("Sai tài khoản hoặc mật khẩu");
            }
        } catch (err) {
            console.error(err);
            messageApi.error("Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    // ================= GỬI OTP =================
    const handleSendOTP = async (values) => {
        try {
            setForgotLoading(true);
            setUserEmail(values.email);

            // ❗ API CẦN BACKEND CUNG CẤP
            // await api.post("/Auth/send-otp", { email: values.email });

            messageApi.success("OTP đã được gửi về email của bạn");
            setStep(2);
        } catch {
            messageApi.error("Không thể gửi OTP");
        } finally {
            setForgotLoading(false);
        }
    };

    // ================= XÁC NHẬN OTP + ĐỔI MK =================
    const handleResetPassword = async (values) => {
        try {
            setForgotLoading(true);

            // ❗ API CẦN BACKEND CUNG CẤP
            // await api.post("/Auth/reset-password", {
            //   email: userEmail,
            //   otp: values.otp,
            //   newPassword: values.newPassword,
            // });

            messageApi.success("Đổi mật khẩu thành công");
            setStep(3);
        } catch {
            messageApi.error("OTP không chính xác");
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                background: "linear-gradient(135deg, #0f172a, #1e293b)",
            }}
        >
            {contextHolder}
            {/* LEFT */}
            <div
                style={{
                    flex: 1,
                    color: "#fff",
                    padding: "80px 60px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                <h1 style={{ fontSize: 48, fontWeight: 700 }}>STYLEWEAR</h1>
                <p style={{ fontSize: 18, color: "#cbd5e1", maxWidth: 400 }}>
                    Đăng nhập để khám phá thế giới thời trang hiện đại, nhanh
                    chóng và an toàn.
                </p>
            </div>

            {/* RIGHT */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Card
                    style={{
                        width: 420,
                        borderRadius: 20,
                        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
                    }}
                >
                    <h2 style={{ textAlign: "center", fontSize: 26 }}>
                        Đăng nhập tài khoản
                    </h2>

                    <Form layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Nhập email" },
                                {
                                    type: "email",
                                    message: "Email không hợp lệ",
                                },
                            ]}
                        >
                            <Input size="large" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[
                                { required: true, message: "Nhập mật khẩu" },
                            ]}
                        >
                            <Input.Password size="large" />
                        </Form.Item>

                        <div style={{ textAlign: "right", marginBottom: 10 }}>
                            <span
                                style={{ color: "#2563eb", cursor: "pointer" }}
                                onClick={() => setOpenForgot(true)}
                            >
                                Quên mật khẩu?
                            </span>
                        </div>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            style={{
                                borderRadius: 12,
                                background:
                                    "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                border: "none",
                            }}
                        >
                            Đăng nhập
                        </Button>

                        <div style={{ textAlign: "center", marginTop: 15 }}>
                            Chưa có tài khoản?{" "}
                            <Link to="/register">Đăng ký</Link>
                        </div>
                    </Form>
                </Card>
            </div>

            {/* MODAL QUÊN MẬT KHẨU */}
            <Modal
                open={openForgot}
                footer={null}
                onCancel={() => {
                    setOpenForgot(false);
                    setStep(1);
                }}
                title="Khôi phục mật khẩu"
                centered
                bodyStyle={{ padding: "30px 24px" }}
            >
                <Steps
                    current={step - 1}
                    size="small"
                    style={{ marginBottom: 20 }}
                >
                    <Step title="Email" icon={<MailOutlined />} />
                    <Step
                        title="OTP & Mật khẩu mới"
                        icon={<UnlockOutlined />}
                    />
                    <Step title="Hoàn tất" icon={<CheckCircleOutlined />} />
                </Steps>

                {step === 1 && (
                    <Form layout="vertical" onFinish={handleSendOTP}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập email",
                                },
                                {
                                    type: "email",
                                    message: "Email không hợp lệ",
                                },
                            ]}
                        >
                            <Input
                                placeholder="Nhập email để nhận OTP"
                                size="large"
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={forgotLoading}
                            block
                            size="large"
                            style={{
                                borderRadius: 12,
                                background:
                                    "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                border: "none",
                            }}
                        >
                            Gửi OTP
                        </Button>
                    </Form>
                )}

                {step === 2 && (
                    <Form layout="vertical" onFinish={handleResetPassword}>
                        <Alert
                            message={`Đã gửi OTP tới ${userEmail}. Vui lòng kiểm tra email.`}
                            type="info"
                            showIcon
                            style={{ marginBottom: 20 }}
                        />
                        <Form.Item
                            label="OTP"
                            name="otp"
                            rules={[{ required: true, message: "Nhập OTP" }]}
                        >
                            <Input size="large" placeholder="Nhập mã OTP" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[
                                {
                                    required: true,
                                    message: "Nhập mật khẩu mới",
                                },
                                {
                                    min: 6,
                                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                                },
                            ]}
                        >
                            <Input.Password
                                size="large"
                                placeholder="Nhập mật khẩu mới"
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={forgotLoading}
                            block
                            size="large"
                            style={{
                                borderRadius: 12,
                                background:
                                    "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                border: "none",
                            }}
                        >
                            Đổi mật khẩu
                        </Button>
                    </Form>
                )}

                {step === 3 && (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <CheckCircleOutlined
                            style={{
                                fontSize: 48,
                                color: "#52c41a",
                                marginBottom: 15,
                            }}
                        />
                        <h3>Mật khẩu đã được đổi thành công!</h3>
                        <Button
                            type="primary"
                            block
                            size="large"
                            onClick={() => {
                                setOpenForgot(false);
                                setStep(1);
                            }}
                            style={{
                                borderRadius: 12,
                                background:
                                    "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                border: "none",
                                marginTop: 20,
                            }}
                        >
                            Quay lại đăng nhập
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Login;
