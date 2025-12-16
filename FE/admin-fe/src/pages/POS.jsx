// ===== POS.jsx (Full Optimized Version) =====

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table,
  Button,
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
  Space,
} from "antd";
import {
  ShoppingCartOutlined,
  PlusOutlined,
  DeleteOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import api from "../utils/axios";

// ===== LOCAL STORAGE HELPERS =====
const LS_KEY = (id) => `pendingOrders_${id}`;
const LS = {
  get: (id) => JSON.parse(localStorage.getItem(LS_KEY(id))) || [],
  save: (id, data) => localStorage.setItem(LS_KEY(id), JSON.stringify(data)),
  add: (id, order) => LS.save(id, [...LS.get(id), order]),
  remove: (id, index) => {
    const list = LS.get(id);
    list.splice(index, 1);
    LS.save(id, list);
  },
};

export default function POS() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const staffName = user?.fullName || "Không xác định";

  const [form] = Form.useForm();

  // ===== STATE =====
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [cart, setCart] = useState([]);
  const [pending, setPending] = useState([]);
  const [pendingVisible, setPendingVisible] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [orderType, setOrderType] = useState("Offline");
  const [searchText, setSearchText] = useState("");
  const [discount, setDiscount] = useState({ type: null, value: 0 });
  const [discountCode, setDiscountCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState(null);

  const paymentOptions = [
    { value: "Cash", label: "Tiền mặt" },
    { value: "BankTransfer", label: "Chuyển khoản" },
    { value: "COD", label: "Ship COD" },
  ];

  // ===== INIT =====
  useEffect(() => {
    form.setFieldsValue({ staffName });
    setPending(LS.get(user.id));
    loadProducts();
    loadPromotions();
  }, []);

  // ===== API FETCH =====
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ProductVariant");
      const values = Array.isArray(res.data) ? res.data : [];
      const list = values.map((p) => {
        const product = p.product || {};
        const img =
          (product.productImages?.$values || []).find((i) => i.isMain) || null;
        const url = img?.url?.startsWith("http")
          ? img.url
          : img?.url
          ? `http://160.250.5.26:5000${img.url}`
          : "/default-image.png";
        return {
          ...p,
          tenSanPham: p.tenSanPham,
          price: p.giaBan || 0,
          imageUrl: url,
        };
      });
      setProducts(list);
    } catch (e) {
      console.error(e);
      message.error("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const loadPromotions = async () => {
    try {
      const { data } = await api.get("/KhuyenMai/GetAllPromotions");
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải mã giảm giá");
    }
  };

  // ===== CUSTOMER SEARCH =====
  const searchCustomer = useCallback(async () => {
    const phone = form.getFieldValue("customerPhone");
    if (!phone) return message.warning("Nhập số điện thoại để tìm!");
    try {
      const res = await api.get(`/customer/search?phone=${phone}`);
      const customer = res.data; // BE trả về 1 object
      if (!customer || !customer.userId) {
        setFoundCustomer(null);
        return message.info("Không tìm thấy khách hàng");
      }

      setFoundCustomer(customer);

      // Fill vào form
      form.setFieldsValue({
        customerName: customer.fullName || "",
        customerPhone: customer.phone || "",
        shippingAddress: customer.defaultAddress || "",
        note: "",
      });

      message.success("Tìm thấy khách hàng, đã tự động điền thông tin!");
} catch (err) {
  console.error(err);

  const beMessage =
    err?.response?.data?.message ||
    err?.response?.data ||
    "Không tìm thấy khách hàng";

  setFoundCustomer(null);
  message.warning(beMessage);
}
  }, [form]);

  // ===== CART LOGIC =====
  const addToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.productVariantId === product.productVariantId);
      return exist
        ? prev.map((i) =>
            i.productVariantId === product.productVariantId
              ? { ...i, soLuong: i.soLuong + 1 }
              : i
          )
        : [...prev, { ...product, soLuong: 1 }];
    });
  };

  const updateQty = (id, qty) =>
    setCart((prev) =>
      prev.map((i) => (i.productVariantId === id ? { ...i, soLuong: qty } : i))
    );

  const removeItem = (id) =>
    setCart((prev) => prev.filter((i) => i.productVariantId !== id));

  const total = useMemo(() => cart.reduce((s, i) => s + i.soLuong * i.price, 0), [cart]);

  const discountValue = useMemo(() => {
    if (discount.type === "Percent") return Math.round((total * discount.value) / 100);
    if (discount.type === "Amount") return discount.value;
    return 0;
  }, [total, discount]);

  const totalAfter = Math.max(0, total - discountValue);

  // ===== DISCOUNT =====
  const applyDiscount = (code) => {
    const p = promotions.find((x) => x.code === code);
    if (!p) {
      setDiscount({ type: null, value: 0 });
      setDiscountCode(null);
      return message.error("Mã giảm giá không hợp lệ");
    }
    setDiscount({
      type: p.discountType === "Percent" ? "Percent" : "Amount",
      value: p.discountValue || 0,
    });
    setDiscountCode(code);
  };

  // ===== PENDING ORDERS =====
  const savePending = () => {
    if (!cart.length) return message.warning("Giỏ hàng trống!");
    LS.add(user.id, { items: cart, createdAt: Date.now() });
    setPending(LS.get(user.id));
    setCart([]);
    message.success("Đã lưu hóa đơn chờ!");
  };

  const loadPendingOrder = (o) => {
    setCart(o.items);
    setPendingVisible(false);
  };

  const deletePending = (index) => {
    LS.remove(user.id, index);
    setPending(LS.get(user.id));
  };

  // ===== PRINT INVOICE =====
  const printInvoice = (order, discountAmount = 0) => {
    const win = window.open("", "_blank");
    const code = `HD${Date.now()}`;
    win.document.write(`
      <html>
        <head>
          <title>Hóa đơn bán hàng</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { text-align: center; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table, th, td { border: 1px solid #333; }
            th, td { padding: 8px; text-align: left; }
            .info p { margin: 4px 0; }
            .summary { margin-top: 15px; font-size: 15px; }
          </style>
        </head>
        <body>
          <h2>HÓA ĐƠN BÁN HÀNG</h2>
          <div class="info">
            <p><b>Mã hóa đơn:</b> ${code}</p>
            <p><b>Nhân viên:</b> ${order.staff || "N/A"}</p>
            <p><b>Khách hàng:</b> ${order.customer?.ten || ""}</p>
            <p><b>SĐT:</b> ${order.customer?.sdt || ""}</p>
            <p><b>Ngày:</b> ${order.date || new Date().toLocaleString()}</p>
            <p><b>Phương thức thanh toán:</b> ${order.paymentMethod || ""}</p>
            <p><b>Loại đơn:</b> ${order.orderType || "Bán tại quầy"}</p>
            <p><b>Trạng thái:</b> ${order.status || "Hoàn thành"}</p>
          </div>
          <table>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Size</th>
              <th>Màu</th>
              <th>SL</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
            ${order.items.map(
              (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.size || "-"}</td>
                <td>${item.color || "-"}</td>
                <td>${item.qty}</td>
                <td>${item.price.toLocaleString()} ₫</td>
                <td>${(item.qty * item.price).toLocaleString()} ₫</td>
              </tr>`
            ).join("")}
          </table>
          <div class="summary">
            <p><b>Tổng tiền trước giảm:</b> ${(order.total + discountAmount).toLocaleString()} ₫</p>
            <p><b>Tiền giảm:</b> ${discountAmount.toLocaleString()} ₫</p>
            <p><b>Tổng tiền sau giảm:</b> ${order.total.toLocaleString()} ₫</p>
            ${order.customerPay ? `<p><b>Tiền khách đưa:</b> ${order.customerPay.toLocaleString()} ₫</p>` : ""}
            ${order.changeReturn ? `<p><b>Tiền thối lại:</b> ${order.changeReturn.toLocaleString()} ₫</p>` : ""}
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // ===== SUBMIT ORDER =====
  const submitOrder = async () => {
    try {
      const customerName = form.getFieldValue("customerName");
      const customerPhone = form.getFieldValue("customerPhone");
      const shippingAddress = form.getFieldValue("shippingAddress") || "";
      const cashReceived = form.getFieldValue("cashReceived") || 0;
      const cashChange = form.getFieldValue("cashChange") || 0;

      const statusNumber = shippingAddress ? 0 : 3; // 0 = Pending, 3 = Completed
      const statusText = shippingAddress ? "Chờ xử lý" : "Hoàn tất";

      const payload = {
        orderDate: new Date().toISOString(),
        orderType,
        status: statusNumber,
        recipientName: customerName,
        recipientPhone: customerPhone,
        shippingAddress,
        totalAmount: totalAfter,
        userId: user?.userId,
        orderItems: cart.map((i) => ({
          productVariantId: i.productVariantId,
          quantity: i.soLuong,
          price: i.price,
        })),
        payments: [
          {
            method: paymentMethod,
            amount: totalAfter,
            cashReceived,
            cashChange,
          },
        ],
      };

      await api.post("/Orders/Add", payload);
      message.success("Tạo đơn hàng thành công!");

      // In hóa đơn
printInvoice(
  {
    staff: staffName,
    customer: { ten: customerName, sdt: customerPhone },
    items: cart.map((i) => ({
      name: i.tenSanPham,
      size: i.tenKichCo,
      color: i.tenMau,
      qty: i.soLuong,
      price: i.price,
    })),
    total: totalAfter,
    paymentMethod,
    orderType: shippingAddress ? "Ship COD" : "Bán tại quầy",
    status: statusText,
  },
  discountValue
);

      // RESET
      setCart([]);
      setOpenPayment(false);
      setDiscount({ type: null, value: 0 });
      setDiscountCode(null);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Tạo đơn hàng thất bại!");
    }
  };

  // ===== FILTERED PRODUCTS =====
  const filteredProducts = useMemo(() => {
    const text = searchText.toLowerCase();
    return products.filter(
      (p) =>
        p.tenSanPham?.toLowerCase().includes(text) ||
        p.tenMau?.toLowerCase().includes(text) ||
        p.tenKichCo?.toLowerCase().includes(text)
    );
  }, [products, searchText]);

  // ===== RENDER =====
  return (
    <div>
      <h2>Bán hàng tại quầy (POS)</h2>
      <Divider />
      <Row gutter={16}>
        {/* LEFT: PRODUCTS */}
        <Col span={16}>
          <Card title="Sản phẩm" bordered={false}>
            <Input
              placeholder="Tìm kiếm sản phẩm"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <Table
              dataSource={filteredProducts}
              loading={loading}
              rowKey="productVariantId"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "Tên sản phẩm", dataIndex: "tenSanPham" },
                { title: "Giá bán", dataIndex: "giaBan", render: (v) => `${(v || 0).toLocaleString()} ₫` },
                { title: "Màu", dataIndex: "tenMau" },
                { title: "Size", dataIndex: "tenKichCo" },
                {
                  title: "Thêm",
                  render: (_, r) => (
                    <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => addToCart(r)} disabled={r.soLuongTon <= 0} />
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* RIGHT: CART */}
        <Col span={8}>
          <Card title={<><ShoppingCartOutlined /> Giỏ hàng</>}>
            <Space style={{ marginBottom: 10 }}>
              <Button onClick={savePending}>Lưu hóa đơn chờ</Button>
              <Button type="primary" onClick={() => setPendingVisible(true)}>Hóa đơn chờ ({pending.length})</Button>
            </Space>

            <Table
              size="small"
              pagination={false}
              dataSource={cart}
              rowKey="productVariantId"
              columns={[
                { title: "Tên", render: (_, r) => r.tenSanPham },
                { title: "Màu", render: (_, r) => r.tenMau },
                { title: "Size", render: (_, r) => r.tenKichCo },
                { title: "SL", render: (_, r) => <InputNumber min={1} value={r.soLuong} onChange={(v) => updateQty(r.productVariantId, v)} /> },
                { title: "Thành tiền", render: (_, r) => `${(r.price * r.soLuong).toLocaleString()} ₫` },
                { render: (_, r) => <Button danger icon={<DeleteOutlined />} onClick={() => removeItem(r.productVariantId)} /> },
              ]}
            />

            <Divider />
            <Select
              allowClear
              placeholder="Chọn mã giảm giá"
              value={discountCode}
              onChange={applyDiscount}
              style={{ width: "100%" }}
              options={promotions.map((p) => ({
                value: p.code,
                label: `${p.code} - ${p.discountType === "Percent" ? p.discountValue + "%" : p.discountValue.toLocaleString() + "₫"}`,
              }))}
            />

            <Divider />
            <Statistic title="Tổng tiền" value={totalAfter} suffix="₫" />
            {discountValue > 0 && <Tag color="green" style={{ marginTop: 8 }}>Giảm {discountValue.toLocaleString()}₫</Tag>}

            <Divider />
            <Button type="primary" block icon={<CreditCardOutlined />} disabled={!cart.length} onClick={() => setOpenPayment(true)}>Thanh toán</Button>
          </Card>
        </Col>
      </Row>

      {/* PAYMENT MODAL */}
      <Modal title="Xác nhận thanh toán" open={openPayment} onCancel={() => setOpenPayment(false)} onOk={submitOrder}>
        <Form form={form} layout="vertical">
          <Form.Item label="Số điện thoại" name="customerPhone" rules={[{ required: true }]}>
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Button type="primary" onClick={searchCustomer} style={{ marginBottom: 10 }}>Tìm khách hàng</Button>

          <Form.Item label="Loại đơn hàng">
            <Input value="Bán tại quầy" readOnly disabled />
          </Form.Item>

          <Form.Item label="Tên khách hàng" name="customerName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="shippingAddress">
            <Input />
          </Form.Item>

          <Form.Item label="Phương thức thanh toán">
            <Select value={paymentMethod} onChange={setPaymentMethod} options={paymentOptions} />
          </Form.Item>

          {paymentMethod === "Cash" && (
            <>
              <Form.Item label="Tiền khách đưa" name="cashReceived">
                <InputNumber min={0} style={{ width: "100%" }} onChange={(v) => form.setFieldValue("cashChange", (v || 0) - totalAfter)} />
              </Form.Item>
              <Form.Item label="Tiền trả lại" name="cashChange">
                <InputNumber readOnly style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}

          {paymentMethod === "BankTransfer" && (
            <div style={{ textAlign: "center" }}>
              <img src="/qr-store.png" style={{ width: 220 }} />
            </div>
          )}

          {paymentMethod === "COD" && (
            <p style={{ textAlign: "center", fontWeight: "bold" }}>Khách thanh toán khi nhận hàng (Ship COD)</p>
          )}

          <h3 style={{ marginTop: 20 }}>Tổng tiền: <b>{totalAfter.toLocaleString()} ₫</b></h3>
        </Form>
      </Modal>

      {/* PENDING ORDERS MODAL */}
      <Modal title="Hóa đơn chờ" open={pendingVisible} onCancel={() => setPendingVisible(false)} footer={null}>
        <Table
          pagination={false}
          dataSource={pending}
          rowKey={(r, i) => i}
          columns={[
            { title: "Thời gian", dataIndex: "createdAt", render: (t) => new Date(t).toLocaleString() },
            { title: "Số SP", render: (r) => r.items.length },
            { title: "Thao tác", render: (_, r, index) => (
              <Space>
                <Button type="primary" onClick={() => loadPendingOrder(r)}>Tiếp tục</Button>
                <Button danger onClick={() => deletePending(index)}>Xóa</Button>
              </Space>
            )},
          ]}
        />
      </Modal>
    </div>
  );
}
