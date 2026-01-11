import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Form,
    Input,
    Button,
    Card,
    message,
    Modal,
    Steps,
    Alert,
    Typography,
    Space,
    Divider,
    theme
} from "antd";
import {
    MailOutlined,
    UnlockOutlined,
    CheckCircleOutlined,
    UserOutlined,
    LockOutlined,
    ArrowRightOutlined,
    KeyOutlined,
    SafetyCertificateOutlined
} from "@ant-design/icons";
import api from "../utils/axios";
import styled from "styled-components";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { useToken } = theme;

// ================= STYLED COMPONENTS =================
const LoginContainer = styled.div`
    min-height: 100vh;
    display: flex;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
            radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 50%);
        pointer-events: none;
    }

    @media (max-width: 992px) {
        flex-direction: column;
    }
`;

const BrandSection = styled.div`
    flex: 1;
    padding: 80px 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 1;

    @media (max-width: 992px) {
        padding: 40px 20px;
        text-align: center;
        align-items: center;
    }
`;

const LoginSection = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    position: relative;
    z-index: 1;

    @media (max-width: 992px) {
        padding: 20px;
    }
`;

const BrandLogo = styled.h1`
    font-size: 3.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 24px;
    position: relative;
    display: inline-block;

    &::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 60px;
        height: 4px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border-radius: 2px;
    }
`;

const BrandTagline = styled(Paragraph)`
    font-size: 1.125rem;
    color: #cbd5e1;
    max-width: 400px;
    line-height: 1.7;
    margin-bottom: 40px;
`;

const FeatureList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 40px;
`;

const FeatureItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    color: #94a3b8;
    font-size: 0.95rem;
`;

const FeatureIcon = styled.span`
    color: #3b82f6;
    font-size: 1rem;
`;

const LoginCard = styled(Card)`
    width: 100%;
    max-width: 440px;
    border-radius: 20px;
    box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.5),
        0 0 60px rgba(37, 99, 235, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(10px);
    overflow: hidden;

    .ant-card-body {
        padding: 40px;
    }

    @media (max-width: 576px) {
        .ant-card-body {
            padding: 24px;
        }
    }
`;

const GradientButton = styled(Button)`
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    border: none;
    border-radius: 12px;
    height: 48px;
    font-weight: 500;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
        background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
    }

    &:active {
        transform: translateY(0);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
        );
        transition: 0.5s;
    }

    &:hover::before {
        left: 100%;
    }
`;

const FormHeader = styled.div`
    text-align: center;
    margin-bottom: 32px;
`;

const FormTitle = styled(Title)`
    color: #f8fafc !important;
    margin-bottom: 8px !important;
    font-weight: 600 !important;
`;

const FormSubtitle = styled(Text)`
    color: #94a3b8;
    font-size: 0.95rem;
`;

const StyledInput = styled(Input)`
    border-radius: 10px;
    height: 48px;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid #334155;
    color: #f8fafc;
    transition: all 0.3s ease;

    &:hover {
        border-color: #3b82f6;
        background: rgba(30, 41, 59, 0.7);
    }

    &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        background: rgba(30, 41, 59, 0.7);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const StyledPasswordInput = styled(Input.Password)`
    .ant-input {
        border-radius: 10px;
        height: 48px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid #334155;
        color: #f8fafc;
        transition: all 0.3s ease;

        &:hover {
            border-color: #3b82f6;
            background: rgba(30, 41, 59, 0.7);
        }

        &:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            background: rgba(30, 41, 59, 0.7);
        }
    }

    .ant-input-password-icon {
        color: #64748b;
        
        &:hover {
            color: #3b82f6;
        }
    }
`;

const ForgotPasswordLink = styled(Text)`
    color: #60a5fa;
    cursor: pointer;
    font-weight: 500;
    transition: color 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &:hover {
        color: #3b82f6;
    }
`;

const RegisterLink = styled(Link)`
    color: #60a5fa;
    font-weight: 500;
    transition: color 0.3s ease;
    text-decoration: none;

    &:hover {
        color: #3b82f6;
        text-decoration: underline;
    }
`;

const SuccessIconWrapper = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
`;

const SuccessIcon = styled(CheckCircleOutlined)`
    font-size: 64px;
    color: #10b981;
`;

const ModalSteps = styled(Steps)`
    .ant-steps-item {
        .ant-steps-item-icon {
            background: rgba(30, 41, 59, 0.5);
            border-color: #475569;
            
            .ant-steps-icon {
                color: #cbd5e1;
            }
        }
        
        &.ant-steps-item-active {
            .ant-steps-item-icon {
                background: #3b82f6;
                border-color: #3b82f6;
            }
        }
        
        &.ant-steps-item-finish {
            .ant-steps-item-icon {
                background: #10b981;
                border-color: #10b981;
                
                .ant-steps-icon {
                    color: white;
                }
            }
        }
    }
    
    .ant-steps-item-title {
        color: #cbd5e1;
    }
    
    .ant-steps-item-description {
        color: #94a3b8;
    }
`;

const StepContent = styled.div`
    padding: 24px 0;
`;

// ================= MAIN COMPONENT =================
const Login = () => {
    const { token } = useToken();
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [forgotForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [openForgot, setOpenForgot] = useState(false);
    const [step, setStep] = useState(1);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [loginForm] = Form.useForm();

    // ================= LOGIN HANDLER =================
    const handleLogin = useCallback(async (values) => {
        try {
            setLoading(true);
            const res = await api.post("/Login/login", {
                Email: values.email,
                Password: values.password,
                isClientLogin: true
            });

            if (res.data?.token && res.data?.user) {
                // Store user data
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userId", res.data.user.userId);
                localStorage.setItem("email", res.data.user.email);
                localStorage.setItem("fullName", res.data.user.fullName);
                localStorage.setItem("role", res.data.user.roleId);

                messageApi.success({
                    content: "Đăng nhập thành công!",
                    duration: 2,
                    style: {
                        marginTop: '10vh',
                    },
                });

                // Redirect
                const redirect = new URLSearchParams(window.location.search).get("redirect") || "/";
                setTimeout(() => {
                    navigate(redirect, { replace: true });
                }, 1000);
            } else {
                messageApi.error("Sai tài khoản hoặc mật khẩu");
            }
        } catch (err) {
            console.error("Login error:", err);
            messageApi.error(err?.response?.data || "Đăng nhập thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [messageApi, navigate]);

    // ================= FORGOT PASSWORD HANDLERS =================
    const handleSendOTP = useCallback(async (values) => {
        try {
            setForgotLoading(true);
            setUserEmail(values.email);

            await api.post("/Users/send-otp", {
                email: values.email,
            });

            messageApi.success({
                content: "OTP đã được gửi đến email của bạn",
                duration: 3,
            });
            setStep(2);
        } catch (error) {
            console.error("Send OTP error:", error);
            messageApi.error("Không thể gửi OTP. Vui lòng kiểm tra email và thử lại.");
        } finally {
            setForgotLoading(false);
        }
    }, [messageApi]);

    const handleResetPassword = useCallback(async (values) => {
        try {
            setForgotLoading(true);

            await api.post("/Users/forgot-password", {
                email: userEmail,
                otp: values.otp,
            });

            messageApi.success({
                content: "Đổi mật khẩu thành công!",
                duration: 3,
            });
            setStep(3);
        } catch (error) {
            console.error("Reset password error:", error);
            messageApi.error("OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại.");
        } finally {
            setForgotLoading(false);
        }
    }, [userEmail, messageApi]);

    const handleModalClose = useCallback(() => {
        setOpenForgot(false);
        setTimeout(() => {
            setStep(1);
            forgotForm.resetFields();
        }, 300);
    }, [forgotForm]);

    // ================= RENDER FORGOT PASSWORD MODAL =================
    const renderForgotPasswordModal = () => (
        <Modal
            open={openForgot}
            onCancel={handleModalClose}
            footer={null}
            centered
            width={500}
            styles={{
                body: {
                    padding: "32px 24px",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                    borderRadius: "16px",
                },
                header: {
                    borderBottom: "none",
                    padding: "24px 24px 0",
                    background: "transparent",
                },
                content: {
                    backgroundColor: "transparent",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    borderRadius: "20px",
                    overflow: "hidden",
                }
            }}
            title={
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Title level={3} style={{ margin: 0, color: token.colorTextLightSolid }}>
                        Khôi phục mật khẩu
                    </Title>
                    <Text type="secondary" style={{ color: token.colorTextDescription }}>
                        Làm theo các bước để lấy lại mật khẩu của bạn
                    </Text>
                </Space>
            }
        >
            <ModalSteps
                current={step - 1}
                size="small"
                items={[
                    {
                        title: 'Email',
                        description: 'Nhập email',
                        icon: <MailOutlined />,
                    },
                    {
                        title: 'Xác thực',
                        description: 'Nhập OTP',
                        icon: <SafetyCertificateOutlined />,
                    },
                    {
                        title: 'Hoàn tất',
                        description: 'Thành công',
                        icon: <CheckCircleOutlined />,
                    },
                ]}
            />

            <StepContent>
                {step === 1 && (
                    <Form
                        form={forgotForm}
                        layout="vertical"
                        onFinish={handleSendOTP}
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            label={<Text strong style={{ color: token.colorTextLightSolid }}>Email đăng ký</Text>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}
                        >
                            <StyledInput
                                prefix={<MailOutlined style={{ color: token.colorTextDescription }} />}
                                placeholder="Nhập email của bạn"
                                autoFocus
                            />
                        </Form.Item>
                        <GradientButton
                            type="primary"
                            htmlType="submit"
                            loading={forgotLoading}
                            block
                            icon={<KeyOutlined />}
                        >
                            Gửi mã OTP
                        </GradientButton>
                    </Form>
                )}

                {step === 2 && (
                    <Form
                        form={forgotForm}
                        layout="vertical"
                        onFinish={handleResetPassword}
                        size="large"
                    >
                        <Alert
                            message="Mã OTP đã được gửi"
                            description={
                                <Text type="secondary">
                                    Chúng tôi đã gửi mã OTP đến <Text strong>{userEmail}</Text>. 
                                    Vui lòng kiểm tra hộp thư đến và nhập mã bên dưới.
                                </Text>
                            }
                            type="info"
                            showIcon
                            style={{ marginBottom: 24, background: 'rgba(59, 130, 246, 0.1)', border: 'none' }}
                        />
                        <Form.Item
                            name="otp"
                            label={<Text strong style={{ color: token.colorTextLightSolid }}>Mã OTP</Text>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã OTP' },
                                { len: 6, message: 'Mã OTP phải có 6 chữ số' },
                            ]}
                        >
                            <StyledInput
                                prefix={<SafetyCertificateOutlined style={{ color: token.colorTextDescription }} />}
                                placeholder="Nhập 6 chữ số OTP"
                                maxLength={6}
                                autoFocus
                            />
                        </Form.Item>
                        <Space size={12} style={{ width: '100%' }}>
                            <Button
                                onClick={() => setStep(1)}
                                block
                                size="large"
                                style={{ borderRadius: 12 }}
                            >
                                Quay lại
                            </Button>
                            <GradientButton
                                type="primary"
                                htmlType="submit"
                                loading={forgotLoading}
                                block
                                icon={<UnlockOutlined />}
                            >
                                Xác nhận OTP
                            </GradientButton>
                        </Space>
                    </Form>
                )}

                {step === 3 && (
                    <Space direction="vertical" size={24} style={{ width: '100%', textAlign: 'center' }}>
                        <SuccessIconWrapper>
                            <SuccessIcon />
                        </SuccessIconWrapper>
                        <Space direction="vertical" size={8}>
                            <Title level={4} style={{ margin: 0, color: token.colorTextLightSolid }}>
                                Thành công!
                            </Title>
                            <Text type="secondary" style={{ fontSize: '0.95rem' }}>
                                Mật khẩu của bạn đã được đổi thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                            </Text>
                        </Space>
                        <GradientButton
                            type="primary"
                            onClick={handleModalClose}
                            block
                            size="large"
                            icon={<ArrowRightOutlined />}
                        >
                            Quay lại đăng nhập
                        </GradientButton>
                    </Space>
                )}
            </StepContent>
        </Modal>
    );

    return (
        <LoginContainer>
            {contextHolder}
            
            <BrandSection>
                <Space direction="vertical" size={32}>
                    <div>
                        <BrandLogo>STYLEWEAR</BrandLogo>
                        <BrandTagline>
                            Khám phá thế giới thời trang hiện đại với trải nghiệm đăng nhập an toàn, 
                            nhanh chóng và tiện lợi. Tham gia cùng cộng đồng yêu thích thời trang lớn nhất.
                        </BrandTagline>
                    </div>
                    
                    <FeatureList>
                        <FeatureItem>
                            <FeatureIcon>✓</FeatureIcon>
                            <span>Đăng nhập nhanh chóng với một cú click</span>
                        </FeatureItem>
                        <FeatureItem>
                            <FeatureIcon>✓</FeatureIcon>
                            <span>Bảo mật tối đa với mã hóa end-to-end</span>
                        </FeatureItem>
                        <FeatureItem>
                            <FeatureIcon>✓</FeatureIcon>
                            <span>Truy cập vào hàng ngàn sản phẩm độc quyền</span>
                        </FeatureItem>
                        <FeatureItem>
                            <FeatureIcon>✓</FeatureIcon>
                            <span>Quản lý đơn hàng và ưu đãi dễ dàng</span>
                        </FeatureItem>
                    </FeatureList>
                    
                    <Divider style={{ borderColor: 'rgba(148, 163, 184, 0.2)' }} />
                    
                    <Text type="secondary" style={{ fontSize: '0.875rem' }}>
                        © 2024 Stylewear. Tất cả các quyền được bảo lưu.
                    </Text>
                </Space>
            </BrandSection>

            <LoginSection>
                <LoginCard>
                    <FormHeader>
                        <FormTitle level={2}>Đăng nhập</FormTitle>
                        <FormSubtitle>
                            Nhập thông tin để truy cập vào tài khoản của bạn
                        </FormSubtitle>
                    </FormHeader>

                    <Form
                        form={loginForm}
                        layout="vertical"
                        onFinish={handleLogin}
                        size="large"
                        requiredMark="optional"
                    >
                        <Form.Item
                            name="email"
                            label={<Text strong style={{ color: token.colorTextLightSolid }}>Email</Text>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}
                        >
                            <StyledInput
                                prefix={<UserOutlined style={{ color: token.colorTextDescription }} />}
                                placeholder="you@example.com"
                                autoComplete="username"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<Text strong style={{ color: token.colorTextLightSolid }}>Mật khẩu</Text>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                            ]}
                        >
                            <StyledPasswordInput
                                prefix={<LockOutlined style={{ color: token.colorTextDescription }} />}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </Form.Item>

                        <Space direction="vertical" size={24} style={{ width: '100%' }}>
                            <div style={{ textAlign: 'right' }}>
                                <ForgotPasswordLink onClick={() => setOpenForgot(true)}>
                                    <KeyOutlined />
                                    Quên mật khẩu?
                                </ForgotPasswordLink>
                            </div>

                            <GradientButton
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                icon={<ArrowRightOutlined />}
                            >
                                Đăng nhập
                            </GradientButton>

                            <div style={{ textAlign: 'center', marginTop: 8 }}>
                                <Text type="secondary" style={{ marginRight: 8 }}>
                                    Chưa có tài khoản?
                                </Text>
                                <RegisterLink to="/register">
                                    Tạo tài khoản mới
                                </RegisterLink>
                            </div>
                        </Space>
                    </Form>
                </LoginCard>
            </LoginSection>

            {renderForgotPasswordModal()}
        </LoginContainer>
    );
};

export default Login;