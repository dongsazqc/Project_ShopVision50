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
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [checkoutItems, setCheckoutItems] = useState([]); // danh sách sản phẩm để thanh toán

  // =========================================
  // 1) LẤY DỮ LIỆU BUY NOW HOẶC CART
  // =========================================
  useEffect(() => {
    const buyNow = JSON.parse(sessionStorage.getItem("buyNow"));
    if (buyNow) {
      setCheckoutItems([buyNow]);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length > 0) {
      setCheckoutItems(cart);
      return;
    }

    if (token) {
      fetchCartFromServer();
    } else {  
      messageApi.warning("Không có sản phẩm để thanh toán");
      navigate("/");
    }
  }, []);

  // =========================================
  // 2) FETCH CART SERVER
  // =========================================
const fetchCartFromServer = async () => {
  if (!userId) {
    messageApi.warning("Bạn chưa đăng nhập");
    navigate("/");
    return;
  }

  try {
    setLoading(true);
    const res = await api.get(`/Cart/GetCartByUser/${userId}`);
    const data = res.data;

    const serverCart = data.cartItems || [];

    if (serverCart.length === 0) {
      messageApi.warning("Giỏ hàng của bạn đang trống");
      return navigate("/");
    }

    const normalized = serverCart.map((item) => ({
      variantId: item.productVariantId,
      cartItemId: item.cartItemId,
      quantity: item.quantity,
      giaBan: item.productVariant?.salePrice || item.price || 0,
      name: item.productVariant?.product?.name || `Sản phẩm #${item.productVariantId}`,
      color: item.productVariant?.color?.name || null,
      size: item.productVariant?.size?.name || null,
      image: item.productVariant?.product?.productImages?.[0]?.url
        ? "http://160.250.5.26:5000" + item.productVariant.product.productImages[0].url
        : "https://via.placeholder.com/150",
      stock: item.productVariant?.stock || 9999,
    }));

    setCheckoutItems(normalized);
  } catch (err) {
    console.error(err);
    messageApi.error("Không thể tải giỏ hàng từ server");
  } finally {
    setLoading(false);
  }
};


  // =========================================
  // 3) FETCH USER PROFILE → AUTOFILL
  // =========================================
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

  // =========================================
  // 4) TÍNH TỔNG TIỀN
  // =========================================
  const totalAmount = checkoutItems.reduce(
    (sum, item) => sum + item.giaBan * item.quantity,
    0
  );

  // =========================================
  // 5) SUBMIT ĐẶT HÀNG
  // =========================================
const handleSubmit = async (values) => {
  try {
    setLoading(true);

    // Mảng orderItems theo chuẩn JSON 2 có price
    const orderItems = checkoutItems.map((item) => ({
      productVariantId: item.variantId,
      quantity: item.quantity,
      price: item.giaBan,
    }));

    // Thanh toán kiểu COD theo chuẩn JSON 2
    const payments = [
      {
        method: "Cash",
        amount: totalAmount,
        cashReceived: totalAmount, // hoặc mày có input nhập tiền khách đưa thì set lại
        cashChange: 0, // tiền thối = cashReceived - amount, tạm để 0
      },
    ];

    const orderPayload = {
      orderDate: new Date().toISOString(),
      orderType: "Online",
      status: 0, // Pending
      totalAmount: totalAmount,
      recipientName: values.recipientName,
      recipientPhone: values.recipientPhone,
      shippingAddress: values.shippingAddress,
      userId: Number(userId),
      orderItems: orderItems,
      payments: payments,
    };

    await api.post("/Orders/Add", orderPayload);

    messageApi.success("Đơn hàng đã được tạo, chờ xử lý");
    sessionStorage.removeItem("buyNow");
    localStorage.removeItem("cart");
    navigate("/ordersuccess");
  } catch (error) {
    console.error(error);
    messageApi.error("Đặt hàng thất bại");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      {contextHolder}
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
                  initialValues={{ paymentMethod: "COD" }} // mặc định COD
                >
                  <Form.Item
                    label="Họ và tên"
                    name="recipientName"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ tên" },
                    ]}
                  >
                    <Input placeholder="Nguyễn Văn A" />
                  </Form.Item>

                  <Form.Item
                    label="Số điện thoại"
                    name="recipientPhone"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      {
                        pattern: /^0\d{9,10}$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    ]}
                  >
                    <Input placeholder="0123456789" />
                  </Form.Item>

                  <Form.Item
                    label="Địa chỉ giao hàng"
                    name="shippingAddress"
                    rules={[
                      { required: true, message: "Vui lòng nhập địa chỉ" },
                    ]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>

                  <Form.Item
    label="Phương thức thanh toán"
    name="paymentMethod"
    initialValue="COD"
>
    <Radio.Group disabled>
        <Radio value="COD">Ship COD</Radio>
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
