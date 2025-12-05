import { useEffect, useState } from "react";
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import api from "../utils/axios";

const { TabPane } = Tabs;

const UserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formInfo] = Form.useForm();
  const [formPassword] = Form.useForm();

  const userId = localStorage.getItem("userId"); // lưu userId sau khi login

  // ================= GET USER INFO =================
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/Users/getById/${userId}`);
      setUser(res.data);

      // map data từ BE sang form
      formInfo.setFieldsValue({
        fullName: res.data.fullName || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.defaultAddress || "",
      });
    } catch (err) {
      console.error(err);
      message.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // ================= UPDATE PROFILE =================
  const onUpdateProfile = async (values) => {
    try {
      setLoading(true);
      await api.put(`/Users/update/${userId}`, {
        fullName: values.fullName,
        phone: values.phone,
        defaultAddress: values.address, // gửi đúng key BE
      });
      message.success("Cập nhật thông tin thành công");
      fetchUserInfo(); // reload info
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ================= CHANGE PASSWORD =================
  const onChangePassword = async (values) => {
    try {
      setLoading(true);
      // Placeholder, BE cung cấp API /Users/changePassword/{id} là dùng
      // await api.put(`/Users/changePassword/${userId}`, values);
      message.success("Đổi mật khẩu thành công (chưa gọi BE)");
      formPassword.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row justify="center" style={{ marginTop: 30 }}>
      <Col xs={24} sm={22} md={18} lg={14}>
        <Card title="Quản lý tài khoản cá nhân" bordered={false}>
          <Tabs defaultActiveKey="1">
            {/* ================= TAB THÔNG TIN CÁ NHÂN ================= */}
            <TabPane tab="Thông tin cá nhân" key="1">
              <Form
                form={formInfo}
                layout="vertical"
                onFinish={onUpdateProfile}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                    >
                      <Input placeholder="Nhập họ và tên" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                    >
                      <Input disabled />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Số điện thoại" name="phone">
                      <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Địa chỉ" name="address">
                      <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>
                  </Col>
                </Row>

                <Button type="primary" htmlType="submit" loading={loading}>
                  Lưu thay đổi
                </Button>
              </Form>
            </TabPane>

            {/* ================= TAB ĐỔI MẬT KHẨU ================= */}
            <TabPane tab="Đổi mật khẩu" key="2">
              <Form
                form={formPassword}
                layout="vertical"
                onFinish={onChangePassword}
              >
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  rules={[{ required: true, message: "Nhập mật khẩu cũ" }]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[{ required: true, min: 6, message: "Ít nhất 6 ký tự" }]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  label="Xác nhận mật khẩu mới"
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "Xác nhận mật khẩu" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject("Mật khẩu xác nhận không khớp");
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={loading}>
                  Đổi mật khẩu
                </Button>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </Col>
    </Row>
  );
};

export default UserProfile;
