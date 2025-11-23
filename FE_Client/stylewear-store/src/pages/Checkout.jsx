import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Form, Input, Button, Divider, message } from "antd";
import api from "../utils/axios";

const Checkout = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [buyNowData, setBuyNowData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("buyNow"));
    if (!data) {
      message.warning("Không có sản phẩm để thanh toán");
      navigate("/");
      return;
    }
    setBuyNowData(data);
  }, [navigate]);

  if (!buyNowData) return null;

  const totalAmount = buyNowData.giaBan * buyNowData.quantity;

  const handleSubmit = async values => {
    try {
      setLoading(true);

      const orderPayload = {
        orderDate: new Date().toISOString(),
        orderType: "Online",
        status: true,
        totalAmount: totalAmount,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        shippingAddress: values.shippingAddress,
        userId: 1, // TODO: thay bằng user đang đăng nhập
        orderItems: [
          {
            productVariantId: buyNowData.variantId,
            quantity: buyNowData.quantity,
            discountAmount: 0,
            promotionId: null
          }
        ]
      };

      await api.post("/Orders/Add", orderPayload);

      message.success("Đặt hàng thành công!");
      sessionStorage.removeItem("buyNow");
      navigate("/ordersuccess");
    } catch (error) {
      console.error(error);
      message.error("Đặt hàng thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Card bordered={false} style={{ borderRadius: 16 }}>
        <h2 style={{ marginBottom: 20 }}>Thanh toán đơn hàng</h2>

        <Row gutter={[24, 24]}>
          {/* Thông tin người nhận */}
          <Col xs={24} md={14}>
            <Card title="Thông tin giao hàng" bordered={false}>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  label="Họ và tên"
                  name="recipientName"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="recipientPhone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                    { pattern: /^0\d{9,10}$/, message: "SĐT không hợp lệ" }
                  ]}
                >
                  <Input placeholder="0123456789" />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ giao hàng"
                  name="shippingAddress"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                  <Input.TextArea rows={3} placeholder="123 Đường ABC, Quận XYZ" />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ background: "#ee4d2d", borderColor: "#ee4d2d" }}
                  block
                  size="large"
                >
                  Xác nhận đặt hàng
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Tóm tắt đơn hàng */}
          <Col xs={24} md={10}>
            <Card title="Tóm tắt đơn hàng" bordered={false}>
              <div style={{ marginBottom: 12 }}>
                <strong>{buyNowData.name}</strong>
                <div style={{ color: "#666" }}>
                  Màu: {buyNowData.color} | Size: {buyNowData.size}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Số lượng</span>
                <span>{buyNowData.quantity}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Đơn giá</span>
                <span>{buyNowData.giaBan.toLocaleString("vi-VN")} ₫</span>
              </div>

              <Divider />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
                <strong>Tổng tiền</strong>
                <strong style={{ color: "#ee4d2d" }}>
                  {totalAmount.toLocaleString("vi-VN")} ₫
                </strong>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Checkout;