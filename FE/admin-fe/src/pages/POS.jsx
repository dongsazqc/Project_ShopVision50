import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  Input,
  message,
  Card,
  Row,
  Col,
  Divider,
  Tag,
  Statistic,
} from "antd";
import {
  ShoppingCartOutlined,
  PlusOutlined,
  DeleteOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import api from "../utils/axios";
// Giải mã JWT không cần thư viện
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Token decode failed:", e);
    return null;
  }
}
export default function POS() {
  // Lấy token từ localStorage
const token = localStorage.getItem("token");

// Decode token để lấy thông tin nhân viên
const user = token ? parseJwt(token) : null;

// Lấy tên nhân viên từ token (tùy backend trả trường gì)
  const staffName =
  user?.fullName ||
  user?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
  "Không xác định";
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [openPayment, setOpenPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("TienMat");
  const [promotions, setPromotions] = useState([]);
  const [discount, setDiscount] = useState(null);
  const [discountCode, setDiscountCode] = useState(null);
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({ staffName });
  }, [staffName]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ProductVariant");
      const data = res.data?.$values || [];

      const formatted = data.map((p) => ({
        ...p,
        price: p.price || 0,
        imageUrl:
          p.productImages && p.productImages.length > 0
            ? p.productImages[0].url
            : "/default-image.png",
      }));

      setProducts(formatted);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await api.get("/KhuyenMai/GetAllPromotions");
      const data = res.data?.$values || [];
      setPromotions(data);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải mã giảm giá");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPromotions();
  }, []);

  const addToCart = (product) => {
    const exist = cart.find((x) => x.productVariantId === product.productVariantId);
    if (exist) {
      setCart(
        cart.map((x) =>
          x.productVariantId === product.productVariantId
            ? { ...x, soLuong: x.soLuong + 1 }
            : x
        )
      );
    } else {
      setCart([...cart, { ...product, soLuong: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((x) => x.productVariantId !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.soLuong * (item.giaBan || item.price || 0),
    0
  );

  const applyDiscount = (code) => {
    const selected = promotions.find((p) => p.code === code);

    if (!selected) {
      setDiscount(null);
      return message.error("Mã giảm giá không hợp lệ");
    }

    setDiscount({ type: selected.discountType, value: selected.discountValue });
    setDiscountCode(code);

    if (selected.discountType === "percent") {
      message.success(`Giảm ${selected.discountValue}%`);
    } else {
      message.success(`Giảm ${selected.discountValue.toLocaleString()}₫`);
    }
  };

  const totalAfterDiscount =
    discount?.type === "percent"
      ? total - (total * discount.value) / 100
      : discount?.type === "amount"
      ? total - discount.value
      : total;
  const printInvoice = (order) => {
  const printWindow = window.open("", "_blank", "width=600,height=800");

  const html = `
    <html>
    <head>
      <title>Hóa đơn bán hàng</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table, td, th { border: 1px solid #333; }
        th, td { padding: 8px; text-align: left; }
        .info { margin-top: 10px; }
      </style>
    </head>
    <body>
      <h2>HÓA ĐƠN BÁN HÀNG</h2>

      <div class="info">
        <p><b>Nhân viên bán hàng:</b> ${order.nhanVienBanHang}</p>
        <p><b>Khách hàng:</b> ${order.khachHang.ten}</p>
        <p><b>SĐT:</b> ${order.khachHang.soDienThoai}</p>
        <p><b>Ngày:</b> ${order.ngayThanhToan}</p>
        <p><b>Phương thức thanh toán:</b> ${order.phuongThucThanhToan}</p>
      </div>

      <table>
        <tr>
          <th>Sản phẩm</th>
          <th>SL</th>
          <th>Đơn giá</th>
          <th>Thành tiền</th>
        </tr>
        ${order.chiTietDonHang
          .map(
            (item) => `
        <tr>
          <td>${item.sanPhamId}</td>
          <td>${item.soLuong}</td>
          <td>${item.donGia.toLocaleString()} ₫</td>
          <td>${(item.soLuong * item.donGia).toLocaleString()} ₫</td>
        </tr>`
          )
          .join("")}
      </table>

      <h3 style="margin-top: 20px;">
        Tổng tiền: <b>${order.tongTien.toLocaleString()} ₫</b>
      </h3>

      ${
        order.tienKhachDua
          ? `<p><b>Tiền khách đưa:</b> ${order.tienKhachDua.toLocaleString()} ₫</p>`
          : ""
      }

      ${
        order.tienThoiLai
          ? `<p><b>Tiền thối lại:</b> ${order.tienThoiLai.toLocaleString()} ₫</p>`
          : ""
      }

      <script>
        window.onload = () => window.print();
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};



  const handleSubmitOrder = async () => {
    const orderData = {
  orderDate: new Date().toISOString(),
  orderType: "Offline",  // backend trả "Offline"
  status: true,

  // --- khách hàng ---
  recipientName: form.getFieldValue("customerName"),
  recipientPhone: form.getFieldValue("customerPhone"),
  shippingAddress: "Tại quầy", // FE không có -> gán mặc định

  // --- tổng tiền ---
  totalAmount: totalAfterDiscount,

  // --- nhân viên bán hàng ---
  userId: user?.userId,         // LẤY TỪ TOKEN
  nhanVienBanHang: staffName,   // bạn muốn lưu tên

  // --- chi tiết đơn hàng ---
  orderItems: cart.map(item => ({
    productId: item.productId,
    quantity: item.soLuong,
    price: item.giaBan || item.price,
  })),

  // --- giảm giá ---
  promotionCode: discountCode || null,

  // --- thanh toán ---
  payments: [
    {
      method: paymentMethod, // "TienMat" / "ChuyenKhoan"
      amount: totalAfterDiscount,
      cashReceived: form.getFieldValue("cashReceived") || 0,
      cashChange: form.getFieldValue("cashChange") || 0
    }
  ]
};

    try {
      await api.post("/Orders/Add", orderData);
      message.success("Tạo đơn hàng thành công!");
      printInvoice(orderData);
      setCart([]);
      setOpenPayment(false);
      setDiscount(null);
      setDiscountCode(null);
    } catch (err) {
      console.error(err);
      message.error("Tạo đơn hàng thất bại!");
    }
  };

  return (
    <div>
      <h2>Bán hàng tại quầy (POS)</h2>
      <Divider />

      <Row gutter={16}>
        {/* PRODUCTS */}
        <Col span={16}>
          <Card title="Sản phẩm" bordered={false}>
            <Table
              dataSource={products}
              loading={loading}
              rowKey="productVariantId"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "Tên sản phẩm", dataIndex: "tenSanPham" },
                {
                  title: "Giá bán",
                  dataIndex: "giaBan",
                  render: (v) => `${v.toLocaleString()} ₫`,
                },
                {
                  title: "Ảnh",
                  render: (_, r) => (
                    <img src={r.imageUrl} style={{ width: 50, height: 50 }} />
                  ),
                },
                { title: "Màu", dataIndex: "tenMau" },
                { title: "Size", dataIndex: "tenKichCo" },
                {
                  title: "Thêm",
                  render: (_, r) => (
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => addToCart(r)}
                      disabled={r.soLuongTon <= 0}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* CART */}
        <Col span={8}>
          <Card title={<><ShoppingCartOutlined /> Giỏ hàng</>}>
            <Table
              dataSource={cart}
              rowKey="productVariantId"
              pagination={false}
              size="small"
              columns={[
                { title: "Tên", render: (_, r) => r.tenSanPham },
                { title: "Màu", render: (_, r) => r.tenMau },
                { title: "Size", render: (_, r) => r.tenKichCo },
                {
                  title: "SL",
                  render: (_, r) => (
                    <InputNumber
                      min={1}
                      value={r.soLuong}
                      onChange={(v) =>
                        setCart(
                          cart.map((x) =>
                            x.productVariantId === r.productVariantId
                              ? { ...x, soLuong: v }
                              : x
                          )
                        )
                      }
                    />
                  ),
                },
                {
                  title: "Thành tiền",
                  render: (_, r) =>
                    `${((r.giaBan || r.price) * r.soLuong).toLocaleString()} ₫`,
                },
                {
                  render: (_, r) => (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeFromCart(r.productVariantId)}
                    />
                  ),
                },
              ]}
            />

            <Divider />

            {/* PROMOTION DROPDOWN */}
            <Select
              placeholder="Chọn mã khuyến mãi"
              style={{ width: "100%" }}
              value={discountCode}
              onChange={applyDiscount}
              options={promotions.map((p) => ({
                value: p.code,
                label: `${p.code} - ${
                  p.discountType === "percent"
                    ? p.discountValue + "%"
                    : p.discountValue.toLocaleString() + "₫"
                }`,
              }))}
            />

            <Divider />

            <Statistic title="Tổng tiền" value={totalAfterDiscount} suffix="₫" />

            {discount && (
              <Tag color="green" style={{ marginTop: 8 }}>
                {discount.type === "percent"
                  ? `Giảm ${discount.value}%`
                  : `Giảm ${discount.value.toLocaleString()}₫`}
              </Tag>
            )}

            <Divider />

            <Button
              type="primary"
              block
              icon={<CreditCardOutlined />}
              disabled={cart.length === 0}
              onClick={() => setOpenPayment(true)}
            >
              Thanh toán
            </Button>
          </Card>
        </Col>
      </Row>

      <Modal
  title="Xác nhận thanh toán"
  open={openPayment}
  onCancel={() => setOpenPayment(false)}
  onOk={handleSubmitOrder}
  okText="Xác nhận"
  cancelText="Hủy"
>
  <Form form={form} layout="vertical">

    {/* TÊN KHÁCH HÀNG */}
    <Form.Item
      label="Tên khách hàng"
      name="customerName"
      rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
    >
      <Input placeholder="Nhập tên khách hàng" />
    </Form.Item>

    {/* SĐT KHÁCH HÀNG */}
    <Form.Item
      label="Số điện thoại"
      name="customerPhone"
      rules={[
        { required: true, message: "Vui lòng nhập số điện thoại" },
        { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ" }
      ]}
    >
      <Input placeholder="Nhập số điện thoại" />
    </Form.Item>

    {/* NGÀY THANH TOÁN */}
    <Form.Item
      label="Ngày thanh toán"
      name="paymentDate"
      initialValue={new Date().toLocaleDateString()}
    >
      <Input readOnly />
    </Form.Item>

    {/* NHÂN VIÊN BÁN HÀNG */}
    <Form.Item label="Nhân viên bán hàng" name="staffName">
      <Input readOnly />
    </Form.Item>  

    {/* PHƯƠNG THỨC THANH TOÁN */}
    <Form.Item label="Phương thức thanh toán">
      <Select
        value={paymentMethod}
        onChange={setPaymentMethod}
        options={[
          { value: "TienMat", label: "Tiền mặt" },
          { value: "ChuyenKhoan", label: "Chuyển khoản" },
        ]}
      />
    </Form.Item>

    {paymentMethod === "ChuyenKhoan" && (
      <div style={{ textAlign: "center", margin: "15px 0" }}>
        <p>Quét mã QR để thanh toán</p>
        <img
          src="/qr-store.png"
          style={{ width: 200, border: "1px solid #ccc", padding: 8 }}
        />
      </div>
    )}

    {paymentMethod === "TienMat" && (
      <>
        <Form.Item
          label="Tiền khách đưa"
          name="cashReceived"
          rules={[{ required: true, message: "Nhập số tiền khách đưa" }]}
        >
          <InputNumber
            min={totalAfterDiscount}
            style={{ width: "100%" }}
            placeholder="Nhập tiền khách đưa"
            onChange={(value) =>
              form.setFieldValue("cashChange", value - totalAfterDiscount)
            }
          />
        </Form.Item>

        <Form.Item label="Tiền trả lại" name="cashChange">
          <InputNumber
            readOnly
            style={{ width: "100%" }}
            value={form.getFieldValue("cashReceived") - totalAfterDiscount}
          />
        </Form.Item>
      </>
    )}

    <h3 style={{ marginTop: 20 }}>
      Tổng tiền: <b>{totalAfterDiscount.toLocaleString()} ₫</b>
    </h3>

  </Form>
</Modal>

    </div>
  );
}