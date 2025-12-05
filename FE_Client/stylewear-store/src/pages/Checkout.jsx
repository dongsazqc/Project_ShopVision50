import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Divider,
  Radio,
  message,
  Spin,
} from "antd";
import api from "../utils/axios";

const Checkout = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [checkoutItems, setCheckoutItems] = useState([]); // danh sách sản phẩm để thanh toán

  // =======================================================
  // 🔥 1) LẤY DỮ LIỆU BUY NOW HOẶC CART
  // =======================================================
  useEffect(() => {
    // Nếu từ Buy Now
    const buyNow = JSON.parse(sessionStorage.getItem("buyNow"));
    if (buyNow) {
      setCheckoutItems([buyNow]);
      return;
    }

    // Nếu từ Cart localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length > 0) {
      setCheckoutItems(cart);
      return;
    }

    // Nếu cart local trống → lấy cart server
    if (token) {
      fetchCartFromServer();
    } else {
      message.warning("Không có sản phẩm để thanh toán");
      navigate("/");
    }
  }, []);

  // =======================================================
  // 🔥 2) FETCH CART TỪ SERVER CHO USER LOGIN
  // =======================================================
  const fetchCartFromServer = async () => {
    try {
      setLoading(true);
      const res = await api.get("/Cart/GetMyCart");

      const serverCart = res.data?.$values || [];

      if (serverCart.length === 0) {
        message.warning("Giỏ hàng của bạn đang trống");
        return navigate("/");
      }

      const normalized = serverCart.map((item) => ({
        variantId: item.productVariantId,
        productId: item.productId,
        name: item.productName,
        quantity: item.quantity,
        giaBan: item.price,
        color: item.color,
        size: item.size,
        image: item.image,
      }));

      setCheckoutItems(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // 🔥 3) FETCH USER PROFILE → AUTOFILL
  // =======================================================
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        setUserLoading(true);
        const res = await api.get(`/Users/getById/${userId}`);

        form.setFieldsValue({
          recipientName: res.data.fullName || "",
          recipientPhone: res.data.phone || "",
          shippingAddress: res.data.defaultAddress || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (checkoutItems.length === 0)
    return <Spin style={{ marginTop: 100 }} size="large" />;

  // =======================================================
  // 🔥 4) TÍNH TỔNG TIỀN
  // =======================================================
  const totalAmount = checkoutItems.reduce(
    (sum, item) => sum + item.giaBan * item.quantity,
    0
  );

  // =======================================================
  // 🔥 5) SUBMIT ĐẶT HÀNG
  // =======================================================
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const orderItems = checkoutItems.map((item) => ({
        productVariantId: item.variantId,
        quantity: item.quantity,
        discountAmount: 0,
        promotionId: null,
      }));

      const orderPayload = {
        orderDate: new Date().toISOString(),
        orderType: "Online",
        status: "Pending",
        totalAmount: totalAmount,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        shippingAddress: values.shippingAddress,
        paymentMethod: values.paymentMethod,
        userId: Number(userId),
        orderItems: orderItems,
      };

      const orderRes = await api.post("/Orders/Add", orderPayload);
      const orderId = orderRes.data.orderId;

      // ========== COD ==========
      if (values.paymentMethod === "COD") {
        await api.put(`/Orders/UpdateStatus/${orderId}`, {
          status: "Success",
          paymentStatus: "PAID",
          paymentMethod: "COD",
        });

        message.success("Đặt hàng thành công!");
        sessionStorage.removeItem("buyNow");
        localStorage.removeItem("cart");
        navigate("/ordersuccess");
        return;
      }

      // ========== VNPAY ==========
      if (values.paymentMethod === "VNPAY") {
        const vnpayRes = await api.post("/Payment/CreateVnpayUrl", {
          orderId,
          amount: totalAmount,
        });

        if (vnpayRes.data.paymentUrl) {
          localStorage.removeItem("cart");
          window.location.href = vnpayRes.data.paymentUrl;
        } else {
          message.error("Không tạo được URL thanh toán VNPAY");
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Card bordered={false} style={{ borderRadius: 16 }}>
        <h2 style={{ marginBottom: 20 }}>Thanh toán đơn hàng</h2>

        {userLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {/* FORM THANH TOÁN */}
            <Col xs={24} md={14}>
              <Card title="Thông tin giao hàng" bordered={false}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{ paymentMethod: "COD" }}
                >
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
                      { pattern: /^0\d{9,10}$/, message: "Số điện thoại không hợp lệ" },
                    ]}
                  >
                    <Input placeholder="0123456789" />
                  </Form.Item>

                  <Form.Item
                    label="Địa chỉ giao hàng"
                    name="shippingAddress"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>

                  <Form.Item
                    label="Phương thức thanh toán"
                    name="paymentMethod"
                    rules={[{ required: true }]}
                  >
                    <Radio.Group>
                      <Radio value="COD">COD</Radio>
                      <Radio value="VNPAY">Thanh toán VNPAY</Radio>
                    </Radio.Group>
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

            {/* TÓM TẮT ĐƠN HÀNG */}
            <Col xs={24} md={10}>
              <Card title="Tóm tắt đơn hàng" bordered={false}>
                {checkoutItems.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: 15 }}>
                    <strong>{item.name}</strong>
                    <div style={{ color: "#666" }}>
                      Màu: {item.color} | Size: {item.size}
                    </div>
                    <div>Số lượng: {item.quantity}</div>
                    <div>Đơn giá: {item.giaBan.toLocaleString()} ₫</div>
                    <Divider />
                  </div>
                ))}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 18,
                  }}
                >
                  <strong>Tổng tiền</strong>
                  <strong style={{ color: "#ee4d2d" }}>
                    {totalAmount.toLocaleString()} ₫
                  </strong>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  );
};

export default Checkout;
