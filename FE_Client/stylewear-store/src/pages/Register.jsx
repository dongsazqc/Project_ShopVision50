import { useState } from "react";
import { Form, Input, Button, Card, Row, Col, message, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/axios";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [formData, setFormData] = useState(null); // lưu form tạm

  const navigate = useNavigate();

  // ===== Gửi OTP để đăng ký =====
  const onFinish = async (values) => {
    try {
      setLoading(true);
      setFormData(values);
      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        defaultAddress: values.address,
      };

      const res = await api.post("/Users/send-register-otp", payload);

      if (res.data.success) {
        setTempToken(res.data.tempToken);
        setUserEmail(values.email);
        setOtpModalVisible(true);
        message.success("OTP đã được gửi tới email của bạn. Vui lòng xác thực để hoàn tất đăng ký.");
      } else {
        message.error(res.data.message || "Email đã tồn tại");
      }
    } catch {
      message.error("Gửi OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ===== Xác thực OTP =====
  const handleVerifyOtp = async (values) => {
    try {
      setOtpLoading(true);
      const payload = { otp: values.otp, tempToken };
      const res = await api.post("/Users/verify-register-otp", payload);

      if (res.data.success) {
        message.success("Đăng ký thành công! Vui lòng đăng nhập");
        setOtpModalVisible(false);
        navigate("/login");
      } else {
        message.error(res.data.message || "OTP không đúng hoặc hết hạn");
      }
    } catch {
      message.error("Xác thực OTP thất bại");
    } finally {
      setOtpLoading(false);
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
            <h1 style={{ fontSize: 32, marginBottom: 10 }}>StyleWear</h1>
            <p style={{ fontSize: 16, opacity: 0.9 }}>
              Tạo tài khoản để bắt đầu mua sắm phong cách thời trang hiện đại cùng chúng tôi.
            </p>
          </Col>

          <Col span={12} style={{ padding: 40 }}>
            <h2 style={{ marginBottom: 20 }}>Đăng ký</h2>

            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: "Nhập họ tên" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input placeholder="abc@gmail.com" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: "Nhập số điện thoại" }]}
              >
                <Input placeholder="0123456789" />
              </Form.Item>

              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: "Nhập địa chỉ" }]}
              >
                <Input placeholder="123 Lê Lợi, Quận 1" />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Nhập mật khẩu" }]}
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
                  { required: true, message: "Xác nhận lại mật khẩu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Mật khẩu không khớp");
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
                style={{ height: 42, borderRadius: 8, fontWeight: 600 }}
              >
                Tạo tài khoản
              </Button>

              <div style={{ marginTop: 16, textAlign: "center" }}>
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
              </div>
            </Form>
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
