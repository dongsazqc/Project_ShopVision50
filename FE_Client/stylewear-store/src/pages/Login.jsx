import { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Modal, Steps, Alert, Space, Divider } from "antd";
import { useNavigate, Link } from "react-router-dom";
import {
    MailOutlined,
    UnlockOutlined,
    CheckCircleOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    LockOutlined,
    UserOutlined,
    ArrowRightOutlined,
    LoadingOutlined,
    SafetyCertificateOutlined,
    RocketOutlined,
    GlobalOutlined,
    StarOutlined,
    VerifiedOutlined,
    KeyOutlined,
    SendOutlined,
    CloudOutlined
} from "@ant-design/icons";
import api from "../utils/axios";

const { Step } = Steps;

const Login = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [forgotForm] = Form.useForm();
    const [resetForm] = Form.useForm();
    
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [particles, setParticles] = useState([]);
    const [bgIndex, setBgIndex] = useState(0);
    const [logoScale, setLogoScale] = useState(1);

    // ===== Forgot password states =====
    const [openForgot, setOpenForgot] = useState(false);
    const [step, setStep] = useState(1);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [otpResendable, setOtpResendable] = useState(true);

    // Particle animation
    useEffect(() => {
        const generateParticles = () => {
            const particlesArray = [];
            for (let i = 0; i < 30; i++) {
                particlesArray.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 4 + 1,
                    speed: Math.random() * 0.5 + 0.2,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
            setParticles(particlesArray);
        };
        generateParticles();
    }, []);

    // Background gradient rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex(prev => (prev + 1) % 4);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Logo animation
    useEffect(() => {
        const interval = setInterval(() => {
            setLogoScale(1.05);
            setTimeout(() => setLogoScale(1), 300);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Countdown for OTP resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setOtpResendable(true);
        }
    }, [countdown]);

    const bgGradients = [
        "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)",
        "linear-gradient(135deg, #0c0a2e 0%, #1e1b4b 25%, #312e81 50%, #4338ca 75%, #6366f1 100%)",
        "linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #6366f1 75%, #818cf8 100%)",
        "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)"
    ];

    // ================= LOGIN =================
    const onFinish = async (values) => {
        try {
            setLoading(true);
            const res = await api.post("/Login/login", {
                Email: values.email,
                Password: values.password,
            });

            console.log("Login response:", res.data);

            if (res.data?.token && res.data?.user) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userId", res.data.user.userId);
                localStorage.setItem("email", res.data.user.email);
                localStorage.setItem("fullName", res.data.user.fullName);
                localStorage.setItem("role", res.data.user.roleId);

                // Success animation
                messageApi.success({
                    content: "✨ Đăng nhập thành công!",
                    duration: 2,
                    style: {
                        marginTop: '20vh',
                    },
                });

                // Animated transition
                document.querySelector('.login-container')?.classList.add('success-exit');
                
                setTimeout(() => {
                    const redirect = new URLSearchParams(window.location.search).get("redirect") || "/";
                    navigate(redirect, { replace: true });
                }, 800);
            } else {
                messageApi.error({
                    content: "❌ Sai tài khoản hoặc mật khẩu",
                    style: {
                        marginTop: '10vh',
                    },
                });
            }
        } catch (err) {
            console.error(err);
            messageApi.error({
                content: err?.response?.data || "⚠️ Đăng nhập thất bại",
                style: {
                    marginTop: '10vh',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    // ================= GỬI OTP =================
    const handleSendOTP = async (values) => {
        try {
            setForgotLoading(true);
            setUserEmail(values.email);

            await api.post("/Users/send-otp", {
                email: values.email,
            });

            messageApi.success({
                content: "✅ OTP đã được gửi về email của bạn",
                duration: 3,
            });
            
            setStep(2);
            setCountdown(60);
            setOtpResendable(false);
        } catch {
            messageApi.error("❌ Không thể gửi OTP");
        } finally {
            setForgotLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!otpResendable) return;
        
        try {
            setForgotLoading(true);
            await api.post("/Users/send-otp", {
                email: userEmail,
            });
            
            messageApi.success("🔄 OTP mới đã được gửi");
            setCountdown(60);
            setOtpResendable(false);
        } catch {
            messageApi.error("❌ Gửi lại OTP thất bại");
        } finally {
            setForgotLoading(false);
        }
    };

    // ================= XÁC NHẬN OTP + ĐỔI MK =================
    const handleResetPassword = async (values) => {
        try {
            setForgotLoading(true);

            await api.post("/Users/forgot-password", {
                email: userEmail,
                otp: values.otp,
            });

            messageApi.success({
                content: "🎉 Đổi mật khẩu thành công!",
                duration: 2,
            });
            setStep(3);
        } catch {
            messageApi.error("❌ OTP không chính xác");
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="login-container" style={{
            minHeight: "100vh",
            display: "flex",
            background: bgGradients[bgIndex],
            transition: "background 2s ease-in-out",
            overflow: "hidden",
            position: "relative",
        }}>
            {contextHolder}
            
            {/* Animated Background Particles */}
            {particles.map(particle => (
                <div
                    key={particle.id}
                    style={{
                        position: "absolute",
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                        background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                        borderRadius: "50%",
                        opacity: particle.opacity,
                        animation: `float ${10 / particle.speed}s infinite ease-in-out`,
                        animationDelay: `${particle.id * 0.1}s`,
                    }}
                />
            ))}

            {/* Glass Morphism Left Panel */}
            <div style={{
                flex: 1.2,
                padding: "80px 60px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    zIndex: 0,
                }} />
                
                <div style={{
                    position: "relative",
                    zIndex: 1,
                    transform: `scale(${logoScale})`,
                    transition: "transform 0.3s ease",
                }}>
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <div>
                            <h1 style={{
                                fontSize: "4.5rem",
                                fontWeight: 900,
                                background: "linear-gradient(45deg, #fff 30%, #cbd5e1 70%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                marginBottom: 0,
                                letterSpacing: "-1px",
                                fontFamily: "'Inter', sans-serif",
                            }}>
                                STYLEWEAR
                            </h1>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "10px",
                            }}>
                                <div style={{
                                    width: "60px",
                                    height: "3px",
                                    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                                    borderRadius: "2px",
                                }} />
                                <span style={{
                                    color: "#94a3b8",
                                    fontSize: "1.1rem",
                                    fontWeight: 500,
                                }}>
                                    Premium Fashion Platform
                                </span>
                            </div>
                        </div>

                        <p style={{
                            fontSize: "1.25rem",
                            color: "#cbd5e1",
                            maxWidth: 500,
                            lineHeight: 1.6,
                            marginTop: "40px",
                            paddingLeft: "10px",
                            borderLeft: "4px solid #6366f1",
                        }}>
                            <RocketOutlined style={{ marginRight: 10, color: "#8b5cf6" }} />
                            Đăng nhập để khám phá thế giới thời trang hiện đại với trải nghiệm cao cấp
                            và bảo mật tối đa cho tài khoản của bạn.
                        </p>

                        <div style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "16px",
                            padding: "25px",
                            marginTop: "40px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                        }}>
                            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <VerifiedOutlined style={{ fontSize: "24px", color: "#10b981" }} />
                                    <span style={{ color: "#e2e8f0", fontSize: "1.1rem" }}>Bảo mật đa lớp</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <GlobalOutlined style={{ fontSize: "24px", color: "#3b82f6" }} />
                                    <span style={{ color: "#e2e8f0", fontSize: "1.1rem" }}>Đồng bộ đa thiết bị</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <StarOutlined style={{ fontSize: "24px", color: "#f59e0b" }} />
                                    <span style={{ color: "#e2e8f0", fontSize: "1.1rem" }}>Trải nghiệm cao cấp</span>
                                </div>
                            </Space>
                        </div>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                            marginTop: "30px",
                            flexWrap: "wrap",
                        }}>
                            <div style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                background: "linear-gradient(45deg, #10b981, #3b82f6)",
                                animation: "pulse 2s infinite",
                            }} />
                            <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                                <CloudOutlined style={{ marginRight: 8 }} />
                                Hệ thống đang hoạt động ổn định
                            </span>
                        </div>
                    </Space>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                position: "relative",
            }}>
                <Card
                    hoverable
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        width: "100%",
                        maxWidth: 480,
                        borderRadius: "24px",
                        background: "rgba(255, 255, 255, 0.03)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: isHovered 
                            ? "0 25px 50px -12px rgba(99, 102, 241, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)"
                            : "0 20px 40px -10px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: isHovered ? "translateY(-5px)" : "none",
                        overflow: "hidden",
                    }}
                    bodyStyle={{
                        padding: "50px 40px",
                    }}
                >
                    {/* Decorative Elements */}
                    <div style={{
                        position: "absolute",
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
                        borderRadius: "50%",
                    }} />
                    
                    <div style={{
                        position: "absolute",
                        bottom: -30,
                        left: -30,
                        width: 150,
                        height: 150,
                        background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
                        borderRadius: "50%",
                    }} />

                    <div style={{ position: "relative", zIndex: 2 }}>
                        <div style={{ textAlign: "center", marginBottom: "40px" }}>
                            <div style={{
                                width: "80px",
                                height: "80px",
                                margin: "0 auto 20px",
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                borderRadius: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transform: "rotate(45deg)",
                            }}>
                                <LockOutlined style={{
                                    fontSize: "32px",
                                    color: "white",
                                    transform: "rotate(-45deg)",
                                }} />
                            </div>
                            
                            <h2 style={{
                                fontSize: "2rem",
                                fontWeight: 700,
                                background: "linear-gradient(45deg, #fff, #cbd5e1)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                marginBottom: "8px",
                            }}>
                                Đăng nhập tài khoản
                            </h2>
                            
                            <p style={{
                                color: "#94a3b8",
                                fontSize: "1rem",
                                marginBottom: 0,
                            }}>
                                Chào mừng trở lại! Vui lòng nhập thông tin đăng nhập
                            </p>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            size="large"
                        >
                            <Form.Item
                                label={
                                    <span style={{ color: "#e2e8f0", fontWeight: 500 }}>
                                        <MailOutlined style={{ marginRight: 8 }} />
                                        Email
                                    </span>
                                }
                                name="email"
                                rules={[
                                    { required: true, message: "📧 Vui lòng nhập email" },
                                    { type: "email", message: "📧 Email không hợp lệ" },
                                ]}
                                style={{ marginBottom: 24 }}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                                    placeholder="your@email.com"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        borderRadius: "12px",
                                        padding: "12px 16px",
                                        color: "#fff",
                                        height: "48px",
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={
                                    <span style={{ color: "#e2e8f0", fontWeight: 500 }}>
                                        <KeyOutlined style={{ marginRight: 8 }} />
                                        Mật khẩu
                                    </span>
                                }
                                name="password"
                                rules={[
                                    { required: true, message: "🔑 Vui lòng nhập mật khẩu" },
                                ]}
                                style={{ marginBottom: 24 }}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                                    placeholder="••••••••"
                                    iconRender={visible => 
                                        visible ? 
                                        <EyeTwoTone style={{ color: "#94a3b8" }} /> : 
                                        <EyeInvisibleOutlined style={{ color: "#94a3b8" }} />
                                    }
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        borderRadius: "12px",
                                        padding: "12px 16px",
                                        height: "48px",
                                    }}
                                    className="password-input"
                                />
                            </Form.Item>

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 32,
                            }}>
                                <div
                                    onClick={() => setOpenForgot(true)}
                                    style={{
                                        color: "#818cf8",
                                        cursor: "pointer",
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        transition: "all 0.2s",
                                    }}
                                    className="forgot-link"
                                >
                                    <UnlockOutlined />
                                    Quên mật khẩu?
                                </div>
                                
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    color: "#94a3b8",
                                    fontSize: "0.9rem",
                                }}>
                                    <div style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        background: "#10b981",
                                        animation: "pulse 2s infinite",
                                    }} />
                                    Bảo mật cao
                                </div>
                            </div>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                size="large"
                                icon={!loading && <ArrowRightOutlined />}
                                style={{
                                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                    border: "none",
                                    borderRadius: "14px",
                                    height: "52px",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
                                    transition: "all 0.3s",
                                }}
                                className="login-button"
                            >
                                {loading ? <LoadingOutlined /> : "Đăng nhập"}
                            </Button>

                            <Divider style={{
                                borderColor: "rgba(255, 255, 255, 0.1)",
                                margin: "32px 0",
                                color: "#94a3b8",
                            }}>
                                hoặc
                            </Divider>

                            <div style={{ textAlign: "center" }}>
                                <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                                    Chưa có tài khoản?{" "}
                                    <Link 
                                        to="/register"
                                        style={{
                                            color: "#818cf8",
                                            fontWeight: 600,
                                            textDecoration: "none",
                                            transition: "all 0.2s",
                                        }}
                                        className="register-link"
                                    >
                                        Đăng ký ngay
                                    </Link>
                                </span>
                            </div>
                        </Form>
                    </div>
                </Card>
            </div>

            {/* Modal Quên Mật Khẩu với giao diện nâng cấp */}
            <Modal
                open={openForgot}
                footer={null}
                onCancel={() => {
                    setOpenForgot(false);
                    setStep(1);
                    setCountdown(0);
                    forgotForm.resetFields();
                    resetForm.resetFields();
                }}
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <SafetyCertificateOutlined style={{ color: "#ffffff", fontSize: "20px" }} />
                        <span style={{ fontSize: "1.25rem", fontWeight: 600 , color: "white"}}>
                            Khôi phục mật khẩu
                        </span>
                    </div>
                }
                centered
                width={520}
                styles={{
                    body: { 
                        padding: "30px 24px",
                        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
                        borderRadius: "0 0 16px 16px",
                    },
                    header: {
                        background: "rgba(15, 23, 42, 0.95)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "24px 24px 20px",
                        borderRadius: "16px 16px 0 0",
                    }
                }}
                className="forgot-modal"
            >
                <Steps
                    current={step - 1}
                    size="small"
                    style={{ marginBottom: 30}}
                    items={[
                        {
                            title: 'Email',
                            icon: <MailOutlined />,
                        },
                        {
                            title: 'Xác thực OTP',
                            icon: <SafetyCertificateOutlined />,
                        },
                        {
                            title: 'Hoàn tất',
                            icon: <CheckCircleOutlined />,
                        },
                    ]}
                />

                {step === 1 && (
                    <Form
                        form={forgotForm}
                        layout="vertical"
                        onFinish={handleSendOTP}
                        size="large"
                    >
                        <div style={{
                            background: "rgba(99, 102, 241, 0.1)",
                            borderRadius: "12px",
                            padding: "16px",
                            marginBottom: "24px",
                            border: "1px solid rgba(99, 102, 241, 0.2)",
                        }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                <SendOutlined style={{ color: "#6366f1", fontSize: "18px", marginTop: "2px" }} />
                                <div>
                                    <div style={{ color: "#e2e8f0", fontWeight: 500, marginBottom: "4px" }}>
                                        Nhận mã xác thực
                                    </div>
                                    <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                                        Nhập email để nhận mã OTP khôi phục mật khẩu
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Form.Item
                            label={<span style={{ color: "#e2e8f0", fontWeight: 500 }}>Địa chỉ Email</span>}
                            name="email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: "email", message: "Email không hợp lệ" },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                                placeholder="your@email.com"
                                size="large"
                                style={{
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "12px",
                                    color: "#fff",
                                }}
                            />
                        </Form.Item>
                        
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={forgotLoading}
                            block
                            size="large"
                            icon={<SendOutlined />}
                            style={{
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                border: "none",
                                borderRadius: "12px",
                                height: "48px",
                                fontSize: "1rem",
                                fontWeight: 600,
                                marginTop: "8px",
                            }}
                        >
                            Gửi mã OTP
                        </Button>
                    </Form>
                )}

                {step === 2 && (
                    <Form
                        form={resetForm}
                        layout="vertical"
                        onFinish={handleResetPassword}
                        size="large"
                    >
                        <Alert
                            message={
                                <div>
                                    <div style={{ fontWeight: 500, marginBottom: "4px" }}>
                                        Mã OTP đã được gửi
                                    </div>
                                    <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                                        Vui lòng kiểm tra email <strong>{userEmail}</strong> để lấy mã xác thực
                                    </div>
                                </div>
                            }
                            type="info"
                            showIcon
                            icon={<SafetyCertificateOutlined />}
                            style={{
                                background: "rgba(59, 130, 246, 0.1)",
                                border: "1px solid rgba(59, 130, 246, 0.2)",
                                marginBottom: "24px",
                            }}
                        />

                        <Form.Item
                            label={<span style={{ color: "#e2e8f0", fontWeight: 500 }}>Mã OTP</span>}
                            name="otp"
                            rules={[
                                { required: true, message: "Vui lòng nhập mã OTP" },
                                { len: 6, message: "Mã OTP phải có 6 chữ số" }
                            ]}
                        >
                            <Input.OTP
                                length={6}
                                size="large"
                                style={{ gap: "8px" }}
                                formatter={(str) => str.toUpperCase()}
                                inputStyle={{
                                    width: "48px",
                                    height: "48px",
                                    fontSize: "18px",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    color: "#fff",
                                    borderRadius: "8px",
                                }}
                            />
                        </Form.Item>

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "24px",
                        }}>
                            <Button
                                type="link"
                                onClick={handleResendOTP}
                                disabled={!otpResendable}
                                style={{
                                    padding: 0,
                                    color: otpResendable ? "#818cf8" : "#94a3b8",
                                }}
                            >
                                {otpResendable ? "Gửi lại OTP" : `Gửi lại sau ${countdown}s`}
                            </Button>
                            
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#94a3b8",
                                fontSize: "0.9rem",
                            }}>
                                <div style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: "#10b981",
                                }} />
                                Mã có hiệu lực trong 5 phút
                            </div>
                        </div>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={forgotLoading}
                            block
                            size="large"
                            style={{
                                background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
                                border: "none",
                                borderRadius: "12px",
                                height: "48px",
                                fontSize: "1rem",
                                fontWeight: 600,
                            }}
                        >
                            Xác nhận và đổi mật khẩu
                        </Button>
                    </Form>
                )}

                {step === 3 && (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            margin: "0 auto 24px",
                            background: "linear-gradient(135deg, #10b981, #3b82f6)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <CheckCircleOutlined style={{ fontSize: "36px", color: "#fff" }} />
                        </div>
                        
                        <h3 style={{ color: "#e2e8f0", marginBottom: "8px", fontSize: "1.5rem" }}>
                            Thành công!
                        </h3>
                        
                        <p style={{ color: "#94a3b8", marginBottom: "32px" }}>
                            Mật khẩu đã được đổi thành công. Vui lòng đăng nhập lại
                        </p>
                        
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Button
                                type="primary"
                                block
                                size="large"
                                onClick={() => {
                                    setOpenForgot(false);
                                    setStep(1);
                                    setCountdown(0);
                                }}
                                style={{
                                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                    border: "none",
                                    borderRadius: "12px",
                                    height: "48px",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                }}
                            >
                                Quay lại đăng nhập
                            </Button>
                            
                            <Button
                                type="default"
                                block
                                size="large"
                                onClick={() => navigate('/register')}
                                style={{
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "12px",
                                    height: "48px",
                                    color: "#e2e8f0",
                                }}
                            >
                                Đăng ký tài khoản mới
                            </Button>
                        </Space>
                    </div>
                )}
            </Modal>

            {/* Global Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                .login-container.success-exit {
                    animation: fadeOut 0.8s ease forwards;
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; transform: scale(1); }
                    to { opacity: 0; transform: scale(1.05); }
                }
                
                .forgot-link:hover {
                    color: #a5b4fc !important;
                    transform: translateX(4px);
                }
                
                .register-link:hover {
                    color: #a5b4fc !important;
                    text-decoration: underline !important;
                }
                
                .login-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px rgba(99, 102, 241, 0.4) !important;
                }
                
                .password-input input {
                    color: #fff !important;
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                
                .password-input:hover {
                    border-color: rgba(99, 102, 241, 0.5) !important;
                }
                
                .ant-input-affix-wrapper-focused {
                    border-color: #6366f1 !important;
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1) !important;
                }
                
                .ant-steps-item-process .ant-steps-item-icon {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
                    border-color: transparent !important;
                }
                
                .ant-steps-item-finish .ant-steps-item-icon {
                    border-color: #10b981 !important;
                    color: #10b981 !important;
                }
                
                .forgot-modal .ant-modal-content {
                    background: transparent !important;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    color: "white";
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                @media (max-width: 992px) {
                    .login-container {
                        flex-direction: column;
                    }
                    
                    .login-container > div {
                        flex: none !important;
                        width: 100% !important;
                    }
                    
                    .ant-card {
                        max-width: 100% !important;
                        margin: 20px;
                    }
                }
                
                @media (max-width: 576px) {
                    h1 {
                        font-size: 3rem !important;
                    }
                    
                    .ant-card-body {
                        padding: 30px 20px !important;
                    }
                    
                    .ant-modal {
                        max-width: calc(100vw - 32px);
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;