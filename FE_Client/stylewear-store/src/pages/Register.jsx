import { useState } from "react";
import { Form, Input, Button, Card, Row, Col, message, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/axios";

const Register = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [tempToken, setTempToken] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [emailForm] = Form.useForm();
    const [registerForm] = Form.useForm();

    const navigate = useNavigate();

    // ===== Gửi OTP với email =====
    const handleSendOtp = async (values) => {
        try {
            setLoading(true);
            const payload = { email: values.email };

            // Gọi API để gửi OTP (có thể dùng API hiện tại hoặc API mới chỉ nhận email)
            const res = await api.post("/Users/send-otp", payload);

            if (res.data.success && res.data.tempToken) {
                setTempToken(res.data.tempToken);
                setUserEmail(values.email);
                setOtpModalVisible(true);
                messageApi.success(
                    "OTP đã được gửi tới email của bạn. Vui lòng xác thực để tiếp tục."
                );
            } else {
                messageApi.error(res.data.message || "Gửi OTP thất bại");
            }
        } catch (err) {
            console.error(err);
            const errorMsg =
                err.response?.data?.message || "Gửi OTP thất bại, thử lại sau";
            messageApi.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // ===== Xác thực OTP =====
    const handleVerifyOtp = async (values) => {
        try {
            setOtpLoading(true);
            const payload = { otp: values.otp, tempToken };
            const res = await api.post("/users/verify-register-otp", payload);

            if (res.data.success) {
                messageApi.success("Xác thực OTP thành công!");
                setOtpModalVisible(false);
                setIsOtpVerified(true);
            } else {
                messageApi.error(
                    res.data.message || "OTP không đúng hoặc hết hạn"
                );
            }
        } catch (err) {
            console.error(err);
            const errorMsg =
                err.response?.data?.message || "Xác thực OTP thất bại";
            messageApi.error(errorMsg);
        } finally {
            setOtpLoading(false);
        }
    };

    // ===== Hoàn tất đăng ký =====
    const handleCompleteRegister = async (values) => {
        try {
            setLoading(true);
            const payload = {
                email: userEmail,
                fullName: values.fullName,
                password: values.password,
                phone: values.phone,
                defaultAddress: values.address,
                tempToken: tempToken, // Gửi kèm tempToken để xác nhận đã verify OTP
            };

            await api.post("/Users/register-with-otp", payload);

            messageApi.success("Đăng ký thành công! Vui lòng đăng nhập");
            navigate("/login");
        } catch (err) {
            console.error(err);
            const errorMsg =
                err.response?.data || "Đăng ký thất bại, thử lại sau";
            messageApi.error(errorMsg);
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
                background: "linear-gradient(135deg, #111 0%, #333 100%)",
            }}
        >
            {contextHolder}
            <Card
                style={{
                    width: 900,
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                }}
                bodyStyle={{ padding: 0 }}
            >
                <Row>
                    {/* Bên trái hình nền */}
                    <Col
                        span={12}
                        style={{
                            background:
                                "url(https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80) center/cover no-repeat",
                            color: "white",
                            padding: 40,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <h1 style={{ fontSize: 32, marginBottom: 10 }}>
                            StyleWear
                        </h1>
                        <p style={{ fontSize: 16, opacity: 0.9 }}>
                            Tạo tài khoản để bắt đầu mua sắm phong cách thời
                            trang hiện đại cùng chúng tôi.
                        </p>
                    </Col>

                    {/* Bên phải form đăng ký */}
                    <Col span={12} style={{ padding: 40 }}>
                        <h2 style={{ marginBottom: 20 }}>Đăng ký</h2>

                        {!isOtpVerified ? (
                            // Form nhập email để gửi OTP
                            <Form
                                form={emailForm}
                                layout="vertical"
                                onFinish={handleSendOtp}
                            >
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Nhập email",
                                        },
                                        {
                                            type: "email",
                                            message: "Email không hợp lệ",
                                        },
                                    ]}
                                >
                                    <Input placeholder="abc@gmail.com" />
                                </Form.Item>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    style={{
                                        height: 42,
                                        borderRadius: 8,
                                        fontWeight: 600,
                                    }}
                                >
                                    Gửi mã OTP
                                </Button>

                                <div
                                    style={{
                                        marginTop: 16,
                                        textAlign: "center",
                                    }}
                                >
                                    Đã có tài khoản?{" "}
                                    <Link to="/login">Đăng nhập</Link>
                                </div>
                            </Form>
                        ) : (
                            // Form đăng ký sau khi verify OTP
                            <>
                                <div
                                    style={{
                                        marginBottom: 16,
                                        padding: 12,
                                        background: "#f0f9ff",
                                        borderRadius: 8,
                                        border: "1px solid #bae6fd",
                                        color: "#0369a1",
                                    }}
                                >
                                    ✓ Email {userEmail} đã được xác thực
                                </div>
                                <Form
                                    form={registerForm}
                                    layout="vertical"
                                    onFinish={handleCompleteRegister}
                                >
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        initialValue={userEmail}
                                    >
                                        <Input
                                            disabled
                                            placeholder={userEmail}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Họ và tên"
                                        name="fullName"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Nhập họ tên",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Nguyễn Văn A" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Số điện thoại"
                                        name="phone"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Nhập số điện thoại",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="0123456789" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Địa chỉ"
                                        name="address"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Nhập địa chỉ",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="123 Lê Lợi, Quận 1" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Mật khẩu"
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Nhập mật khẩu",
                                            },
                                        ]}
                                        hasFeedback
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item
                                        label="Xác nhận mật khẩu"
                                        name="confirmPassword"
                                        dependencies={["password"]}
                                        hasFeedback
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Xác nhận lại mật khẩu",
                                            },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (
                                                        !value ||
                                                        getFieldValue(
                                                            "password"
                                                        ) === value
                                                    ) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(
                                                        "Mật khẩu không khớp"
                                                    );
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        block
                                        style={{
                                            height: 42,
                                            borderRadius: 8,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Tạo tài khoản
                                    </Button>

                                    <div
                                        style={{
                                            marginTop: 16,
                                            textAlign: "center",
                                        }}
                                    >
                                        Đã có tài khoản?{" "}
                                        <Link to="/login">Đăng nhập</Link>
                                    </div>
                                </Form>
                            </>
                        )}
                    </Col>
                </Row>
            </Card>

            {/* Modal OTP */}
            <Modal
                open={otpModalVisible}
                footer={null}
                onCancel={() => setOtpModalVisible(false)}
                title="Xác thực OTP"
                centered
            >
                <Form layout="vertical" onFinish={handleVerifyOtp}>
                    <Form.Item
                        label={`Nhập mã OTP gửi đến ${userEmail}`}
                        name="otp"
                        rules={[{ required: true, message: "Nhập OTP" }]}
                    >
                        <Input placeholder="123456" />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={otpLoading}
                        style={{ borderRadius: 8 }}
                    >
                        Xác thực
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default Register;
