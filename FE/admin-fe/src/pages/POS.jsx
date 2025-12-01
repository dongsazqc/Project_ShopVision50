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

export default function POS() {
  //const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const staffName = user?.fullName || "Không xác định";
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [openPayment, setOpenPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("TienMat");
  const [promotions, setPromotions] = useState([]);
  const [discount, setDiscount] = useState({ type: null, value: 0 });
  const [discountCode, setDiscountCode] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    form.setFieldsValue({ staffName });
  }, [staffName]);

  const filteredProducts = products.filter(
    (p) =>
      p.tenSanPham?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.tenMau?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.tenKichCo?.toLowerCase().includes(searchText.toLowerCase())
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ProductVariant");
      const data = res.data?.$values || [];

      const formatted = data.map((p) => {
        // Lấy product từ variant (theo JSON bạn gửi)
        const product = p.product || {};

        // Chuẩn hóa mảng ảnh (có $values)
        const imgs = product.productImages?.$values || [];

        // Tìm cover image: ưu tiên isMain = true, không có thì lấy ảnh đầu
        const cover =
          imgs.find((img) => img.isMain === true) || imgs[0] || null;

        // Lấy url gốc
        const rawUrl = cover?.url || null;

        // Nếu BE trả về path tương đối thì thêm domain BE vào
        const fullUrl = rawUrl
          ? rawUrl.startsWith("http")
            ? rawUrl
            : `http://160.250.5.26:5000${rawUrl}` // sửa domain nếu BE khác
          : "/default-image.png";

        return {
          ...p,
          price: p.price || p.giaBan || 0,
          imageUrl: fullUrl,
        };
      });

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
    const exist = cart.find(
      (x) => x.productVariantId === product.productVariantId
    );
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
  const discountAmount =
    discount?.type === "Percent"
      ? Math.round((total * discount.value) / 100)
      : discount?.type === "amount"
      ? discount.value
      : 0;

  const applyDiscount = (code) => {
    const selected = promotions.find((p) => p.code === code);

    if (!selected) {
      setDiscount(null);
      return message.error("Mã giảm giá không hợp lệ");
    }

    setDiscount({ type: selected.discountType, value: selected.discountValue });
    setDiscountCode(code);

    if (selected.discountType === "Percent") {
      message.success(`Giảm ${selected.discountValue}%`);
    } else {
      message.success(`Giảm ${selected.discountValue.toLocaleString()}₫`);
    }
  };

  const totalAfterDiscount =
    discount?.type === "Percent"
      ? total - (total * discount.value) / 100
      : discount?.type === "amount"
      ? total - discount.value
      : total;
  const printInvoice = (order) => {
    const printWindow = window.open("", "_blank", "width=600,height=800");
    const orderCode = `HD${new Date().getTime()}`; // Ví dụ: HD1700000000000

    const html = `
    <html>
    <head>
      <title>Hóa đơn bán hàng</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table, th, td { border: 1px solid #333; }
        th, td { padding: 8px; text-align: left; }
        .info { margin-top: 10px; }
        .summary { margin-top: 15px; }
      </style>
    </head>
    <body>
      <h2>HÓA ĐƠN BÁN HÀNG</h2>

      <div class="info">
        <p><b>Mã hóa đơn:</b> ${orderCode}</p>
        <p><b>Nhân viên bán hàng:</b> ${order.nhanVienBanHang}</p>
        <p><b>Khách hàng:</b> ${order.khachHang.ten}</p>
        <p><b>SĐT:</b> ${order.khachHang.soDienThoai}</p>
        <p><b>Ngày:</b> ${order.ngayThanhToan}</p>
        <p><b>Phương thức thanh toán:</b> ${order.phuongThucThanhToan}</p>
      </div>

      <table>
        <tr>
          <th>STT</th>
          <th>Tên sản phẩm</th>
          <th>Số lượng</th>
          <th>Đơn giá</th>
          <th>Thành tiền</th>
        </tr>
        ${order.chiTietDonHang
          .map(
            (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.tenSanPham}</td>
              <td>${item.soLuong}</td>
              <td>${item.donGia.toLocaleString()} ₫</td>
              <td>${(item.soLuong * item.donGia).toLocaleString()} ₫</td>
            </tr>
          `
          )
          .join("")}
      </table>

      <div class="summary">
        <p><b>Tiền giảm:</b> ${discountAmount.toLocaleString() || 0} ₫</p>
        <p><b>Tổng tiền sau giảm:</b> ${order.tongTien.toLocaleString()} ₫</p>
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
      </div>

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
    try {
      // Lấy dữ liệu từ form
      const customerName = form.getFieldValue("customerName");
      const customerPhone = form.getFieldValue("customerPhone");
      const shippingAddress = form.getFieldValue("shippingAddress") || "";
      const cashReceived = form.getFieldValue("cashReceived") || 0;
      const cashChange = form.getFieldValue("cashChange") || 0;

      // Tạo payload gửi lên BE
      const orderData = {
        orderDate: new Date().toISOString(),
        orderType: "Online", // nếu BE sau này hỗ trợ Offline thì đổi lại
        status: true,

        recipientName: customerName,
        recipientPhone: customerPhone,
        shippingAddress: shippingAddress,
        totalAmount: totalAfterDiscount,
        userId: user?.userId, // userId từ localStorage

        // MẢNG THUẦN, KHÔNG DÙNG $values
        orderItems: cart.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.soLuong,
          price: item.giaBan || item.price,
        })),

        // Có thể bỏ hẳn orderPromotions nếu BE không yêu cầu
        // orderPromotions: [],

        payments: [
          {
            method: paymentMethod, // "TienMat" | "ChuyenKhoan"
            amount: totalAfterDiscount,
            cashReceived: cashReceived,
            cashChange: cashChange,
          },
        ],
      };

      console.log("ORDER DATA:", JSON.stringify(orderData, null, 2));

      // Gửi lên API
      await api.post("/Orders/Add", orderData);

      message.success("Tạo đơn hàng thành công!");

      // In hóa đơn (nếu bạn muốn hiển thị tên nhân viên)
      printInvoice({
        ...orderData,
        nhanVienBanHang: staffName, // lấy từ token/localStorage
        khachHang: {
          ten: customerName,
          soDienThoai: customerPhone,
          diaChi: shippingAddress,
        },
        ngayThanhToan: new Date().toLocaleString(),
        phuongThucThanhToan: paymentMethod,
        chiTietDonHang: orderData.orderItems.map((item) => ({
          sanPhamId: item.productVariantId,
          soLuong: item.quantity,
          donGia: item.price,
        })),
        tongTien: totalAfterDiscount,
        tienKhachDua: cashReceived,
        tienThoiLai: cashChange,
      });

      // Reset lại UI
      setCart([]);
      setOpenPayment(false);
      setDiscount(null);
      setDiscountCode(null);
      form.resetFields([
        "customerName",
        "customerPhone",
        "shippingAddress",
        "cashReceived",
        "cashChange",
      ]);
    } catch (err) {
      console.error("Lỗi tạo đơn hàng:", err);
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
            {/* Input tìm kiếm */}
            <Input
              placeholder="Tìm kiếm sản phẩm theo tên, màu, size..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ marginBottom: 10 }}
            />

            <Table
              dataSource={filteredProducts}
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
          <Card
            title={
              <>
                <ShoppingCartOutlined /> Giỏ hàng
              </>
            }
          >
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
                  p.discountType === "Percent"
                    ? p.discountValue + "%"
                    : p.discountValue.toLocaleString() + "₫"
                }`,
              }))}
            />

            <Divider />

            <Statistic
              title="Tổng tiền"
              value={totalAfterDiscount}
              suffix="₫"
            />

            <Tag color="green" style={{ marginTop: 8 }}>
              Giảm {discountAmount.toLocaleString()}₫
              {discount.type === "percent" && ` (${discount.value}%)`}
              {discount.type === "amount" &&
                ` (${discount.value.toLocaleString()}₫)`}
            </Tag>

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
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng" },
            ]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>

          {/* SĐT KHÁCH HÀNG */}
          <Form.Item
            label="Số điện thoại"
            name="customerPhone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^[0-9]{9,11}$/,
                message: "Số điện thoại không hợp lệ",
              },
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
          <Form.Item
            label="Địa chỉ nhận hàng (tùy chọn)"
            name="shippingAddress"
          >
            <Input placeholder="Nhập địa chỉ nhận hàng" />
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
                  value={
                    form.getFieldValue("cashReceived") - totalAfterDiscount
                  }
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
