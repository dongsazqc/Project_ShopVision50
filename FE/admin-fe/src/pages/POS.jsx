import React, { useEffect, useState } from "react";
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
} from "antd";
import {
    ShoppingCartOutlined,
    PlusOutlined,
    DeleteOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import api from "../utils/axios";

/**
 * POS.jsx
 * - PaymentMethod values sent to BE: "Cash" | "BankTransfer"
 * - orderType values sent to BE: "Offline" | "Online"
 * - orderStatus (string) sent to BE: one of ["Pending","Confirmed","Shipping","Delivered","Completed","Cancelled"]
 * - Auto rule for Offline orders: if shippingAddress is empty -> orderStatus = "Completed" (BE should also implement this rule)
 *
 * Giữ nguyên logic tính toán, in hóa đơn, tìm kiếm, v.v.
 */

export default function POS() {
    const [messageApi, contextHolder] = message.useMessage();

    // Lấy user từ localStorage (nếu có)
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const staffName = user?.fullName || "Không xác định";

    // State
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [openPayment, setOpenPayment] = useState(false);
    const [loading, setLoading] = useState(false);
    // paymentMethod must be one of: "Cash", "BankTransfer"
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    // orderType must be one of: "Offline", "Online" — default POS là Offline
    const [orderType, setOrderType] = useState("Offline");
    const [promotions, setPromotions] = useState([]);
    // discount: { type: "Percent" | "Amount", value: number }
    const [discount, setDiscount] = useState({ type: null, value: 0 });
    const [discountCode, setDiscountCode] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        form.setFieldsValue({ staffName });
    }, [staffName, form]);

    const filteredProducts = products.filter(
        (p) =>
            p.tenSanPham?.toLowerCase().includes(searchText.toLowerCase()) ||
            p.tenMau?.toLowerCase().includes(searchText.toLowerCase()) ||
            p.tenKichCo?.toLowerCase().includes(searchText.toLowerCase())
    );

    // --- Fetch products ---
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/ProductVariant");
            const data = res.data?.$values || [];

            const formatted = data.map((p) => {
                const product = p.product || {};
                const imgs = product.productImages?.$values || [];
                const cover =
                    imgs.find((img) => img.isMain === true) || imgs[0] || null;
                const rawUrl = cover?.url || null;
                const fullUrl = rawUrl
                    ? rawUrl.startsWith("http")
                        ? rawUrl
                        : `http://160.250.5.26:5000${rawUrl}`
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
            messageApi.error("Không thể tải sản phẩm");
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
            messageApi.error("Không thể tải mã giảm giá");
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
            : discount?.type === "Amount"
            ? discount.value
            : 0;

    const applyDiscount = (code) => {
        const selected = promotions.find((p) => p.code === code);

        if (!selected) {
            setDiscount({ type: null, value: 0 });
            setDiscountCode(null);
            return messageApi.error("Mã giảm giá không hợp lệ");
        }

        // Chuẩn hoá loại discount từ BE cho phù hợp
        const type = selected.discountType === "Percent" ? "Percent" : "Amount";
        const value = selected.discountValue || 0;

        setDiscount({ type, value });
        setDiscountCode(code);

        if (type === "Percent") {
            messageApi.success(`Giảm ${value}%`);
        } else {
            messageApi.success(`Giảm ${value.toLocaleString()}₫`);
        }
    };

    const totalAfterDiscount =
        discount?.type === "Percent"
            ? Math.max(0, Math.round(total - (total * discount.value) / 100))
            : discount?.type === "Amount"
            ? Math.max(0, total - discount.value)
            : total;

    // --- In hóa đơn (giữ nguyên logic nhưng đảm bảo structure) ---
    const printInvoice = (order) => {
        const printWindow = window.open("", "_blank", "width=600,height=800");
        const orderCode = `HD${new Date().getTime()}`;

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
        <p><b>Loại đơn:</b> ${order.loaiDon}</p>
        <p><b>Trạng thái:</b> ${order.trangThai}</p>
      </div>

      <table>
        <tr>
          <th>STT</th>
          <th>Tên sản phẩm</th>
          <th>Size</th>
          <th>Màu</th>
          <th>Số lượng</th>
          <th>Đơn giá</th>
          <th>Thành tiền</th>
        </tr>
        ${order.chiTietDonHang
            .map(
                (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.tenSanPham || item.sanPhamId || ""}</td>
              <td>${item.tenKichCo || "-"}</td>
              <td>${item.tenMau || "-"}</td>
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

    // --- Build and submit order ---
    const handleSubmitOrder = async () => {
        try {
            const customerName = form.getFieldValue("customerName");
            const customerPhone = form.getFieldValue("customerPhone");
            const shippingAddress = form.getFieldValue("shippingAddress") || "";
            const cashReceived = form.getFieldValue("cashReceived") || 0;
            const cashChange = form.getFieldValue("cashChange") || 0;

            // Determine orderStatus according to rules
            // If Offline and no shippingAddress => Completed
            // Otherwise default to Pending (Online orders typically start Pending)
            let orderStatus = "Pending";
            if (orderType === "Offline") {
                if (!shippingAddress || shippingAddress.trim() === "") {
                    orderStatus = "Completed"; // immediate complete for in-store pickup / no shipping
                } else {
                    orderStatus = "Pending"; // has shipping -> staff will confirm and ship
                }
            } else {
                // Online orders default to Pending
                orderStatus = "Pending";
            }

            const orderData = {
                orderDate: new Date().toISOString(),
                orderType: orderType, // "Offline" | "Online"
                orderStatus: orderStatus, // send string status to BE

                recipientName: customerName,
                recipientPhone: customerPhone,
                shippingAddress: shippingAddress,
                totalAmount: totalAfterDiscount,
                userId: user?.userId,

                orderItems: cart.map((item) => ({
                    productVariantId: item.productVariantId,
                    quantity: item.soLuong,
                    price: item.giaBan || item.price,
                })),

                payments: [
                    {
                        method: paymentMethod, // "Cash" | "BankTransfer"
                        amount: totalAfterDiscount,
                        cashReceived: cashReceived,
                        cashChange: cashChange,
                    },
                ],
            };

            console.log("ORDER DATA:", JSON.stringify(orderData, null, 2));

            // Gửi lên API
            await api.post("/Orders/Add", orderData);

            messageApi.success("Tạo đơn hàng thành công!");

            // In hóa đơn với các thông tin mô tả trạng thái/loại đơn
            printInvoice({
                ...orderData,
                nhanVienBanHang: staffName,
                khachHang: {
                    ten: customerName,
                    soDienThoai: customerPhone,
                    diaChi: shippingAddress,
                },
                ngayThanhToan: new Date().toLocaleString(),
                phuongThucThanhToan:
                    paymentMethod === "Cash" ? "Tiền mặt" : "Chuyển khoản",
                loaiDon:
                    orderType === "Offline" ? "Bán tại quầy" : "Bán online",
                trangThai: mapStatusToLabel(orderStatus),
                chiTietDonHang: orderData.orderItems.map((item) => ({
                    sanPhamId: item.productVariantId,
                    tenSanPham:
                        products.find(
                            (p) => p.productVariantId === item.productVariantId
                        )?.tenSanPham || "",
                    soLuong: item.quantity,
                    donGia: item.price,
                })),
                tongTien: totalAfterDiscount,
                tienKhachDua: cashReceived,
                tienThoiLai: cashChange,
            });

            // Reset UI
            setCart([]);
            setOpenPayment(false);
            setDiscount({ type: null, value: 0 });
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
            messageApi.error("Tạo đơn hàng thất bại!");
        }
    };

    const mapStatusToLabel = (status) => {
        switch (status) {
            case "Pending":
                return "Chờ xác nhận";
            case "Confirmed":
                return "Đã xác nhận";
            case "Shipping":
                return "Đang giao";
            case "Delivered":
                return "Đã giao";
            case "Completed":
                return "Hoàn tất";
            case "Cancelled":
                return "Đã hủy";
            default:
                return status;
        }
    };

    return (
        <div>
            {contextHolder}
            <h2>Bán hàng tại quầy (POS)</h2>
            <Divider />

            <Row gutter={16}>
                <Col span={16}>
                    <Card title="Sản phẩm" bordered={false}>
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
                                {
                                    title: "Tên sản phẩm",
                                    dataIndex: "tenSanPham",
                                },
                                {
                                    title: "Giá bán",
                                    dataIndex: "giaBan",
                                    render: (v) =>
                                        `${(v || 0).toLocaleString()} ₫`,
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
                                {
                                    title: "Tên",
                                    render: (_, r) => r.tenSanPham,
                                },
                                { title: "Màu", render: (_, r) => r.tenMau },
                                {
                                    title: "Size",
                                    render: (_, r) => r.tenKichCo,
                                },
                                {
                                    title: "SL",
                                    render: (_, r) => (
                                        <InputNumber
                                            min={1}
                                            value={r.soLuong}
                                            onChange={(v) =>
                                                setCart(
                                                    cart.map((x) =>
                                                        x.productVariantId ===
                                                        r.productVariantId
                                                            ? {
                                                                  ...x,
                                                                  soLuong: v,
                                                              }
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
                                        `${(
                                            (r.giaBan || r.price) * r.soLuong
                                        ).toLocaleString()} ₫`,
                                },
                                {
                                    render: (_, r) => (
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() =>
                                                removeFromCart(
                                                    r.productVariantId
                                                )
                                            }
                                        />
                                    ),
                                },
                            ]}
                        />

                        <Divider />

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
                            {discount?.type === "Percent" &&
                                ` (${discount.value}%)`}
                            {discount?.type === "Amount" &&
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
                    <Form.Item label="Loại đơn hàng" name="orderType">
                        <Select
                            value={orderType}
                            onChange={(v) => setOrderType(v)}
                            options={[
                                { value: "Offline", label: "Bán tại quầy" },
                                { value: "Online", label: "Bán online" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Tên khách hàng"
                        name="customerName"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên khách hàng",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên khách hàng" />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="customerPhone"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập số điện thoại",
                            },
                            {
                                pattern: /^[0-9]{9,11}$/,
                                message: "Số điện thoại không hợp lệ",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item
                        label="Ngày thanh toán"
                        name="paymentDate"
                        initialValue={new Date().toLocaleDateString()}
                    >
                        <Input readOnly />
                    </Form.Item>

                    <Form.Item label="Nhân viên bán hàng" name="staffName">
                        <Input readOnly />
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ nhận hàng (tùy chọn)"
                        name="shippingAddress"
                    >
                        <Input placeholder="Nhập địa chỉ nhận hàng" />
                    </Form.Item>

                    <Form.Item label="Phương thức thanh toán">
                        <Select
                            value={paymentMethod}
                            onChange={setPaymentMethod}
                            options={[
                                { value: "Cash", label: "Tiền mặt" },
                                {
                                    value: "BankTransfer",
                                    label: "Chuyển khoản",
                                },
                            ]}
                        />
                    </Form.Item>

                    {paymentMethod === "BankTransfer" && (
                        <div style={{ textAlign: "center", margin: "15px 0" }}>
                            <p>Quét mã QR để thanh toán</p>
                            <img
                                src="/qr-store.png"
                                style={{
                                    width: 200,
                                    border: "1px solid #ccc",
                                    padding: 8,
                                }}
                            />
                        </div>
                    )}

                    {paymentMethod === "Cash" && (
                        <>
                            <Form.Item
                                label="Tiền khách đưa"
                                name="cashReceived"
                                rules={[
                                    {
                                        required: true,
                                        message: "Nhập số tiền khách đưa",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    placeholder="Nhập tiền khách đưa"
                                    onChange={(value) =>
                                        form.setFieldValue(
                                            "cashChange",
                                            (value || 0) - totalAfterDiscount
                                        )
                                    }
                                />
                            </Form.Item>

                            <Form.Item label="Tiền trả lại" name="cashChange">
                                <InputNumber
                                    readOnly
                                    style={{ width: "100%" }}
                                    value={
                                        (form.getFieldValue("cashReceived") ||
                                            0) - totalAfterDiscount
                                    }
                                />
                            </Form.Item>
                        </>
                    )}

                    <h3 style={{ marginTop: 20 }}>
                        Tổng tiền:{" "}
                        <b>{totalAfterDiscount.toLocaleString()} ₫</b>
                    </h3>
                </Form>
            </Modal>
        </div>
    );
}
