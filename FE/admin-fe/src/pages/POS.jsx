// src/pages/POS.jsx
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
  DollarOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import api from "../utils/axios"; // TODO: cấu hình baseURL + token interceptor

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [openPayment, setOpenPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("TienMat");
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [form] = Form.useForm();

  // 📦 Lấy danh sách sản phẩm để chọn
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // TODO: API thật: GET /api/sanpham?include=BienTheSanPham
      const res = await api.get("/sanpham");
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ➕ Thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    const exist = cart.find((item) => item.sanPhamId === product.sanPhamId);
    if (exist) {
      setCart(
        cart.map((item) =>
          item.sanPhamId === product.sanPhamId
            ? { ...item, soLuong: item.soLuong + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, soLuong: 1 }]);
    }
  };

  // ➖ Xóa khỏi giỏ
  const removeFromCart = (id) => {
    setCart(cart.filter((p) => p.sanPhamId !== id));
  };

  // 🧮 Tổng tiền
  const total = cart.reduce(
    (sum, item) => sum + item.soLuong * (item.giaBan || item.giaGoc || 0),
    0
  );

  // 💸 Áp dụng mã khuyến mãi
  const applyDiscount = async () => {
    if (!discountCode) return message.warning("Nhập mã giảm giá");
    try {
      // TODO: ⚙️ API thật: GET /api/khuyenmai/check?code=...
      const res = await api.get(`/khuyenmai/check?code=${discountCode}`);
      if (res.data?.phanTramGiam) {
        setDiscount(res.data.phanTramGiam);
        message.success(`Áp dụng mã giảm ${res.data.phanTramGiam}%`);
      } else {
        message.error("Mã giảm giá không hợp lệ");
      }
    } catch {
      message.error("Không thể kiểm tra mã giảm giá");
    }
  };

  // 🧾 Gửi đơn hàng
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return message.warning("Giỏ hàng trống!");

    const orderData = {
      khachHangId: null, // TODO: Lấy từ user đăng nhập hoặc chọn khách tại quầy
      tongTien: total - (total * discount) / 100,
      phuongThucThanhToan: paymentMethod,
      chiTietDonHang: cart.map((item) => ({
        sanPhamId: item.sanPhamId,
        soLuong: item.soLuong,
        donGia: item.giaBan || item.giaGoc,
      })),
    };

    try {
      // TODO: ⚙️ API thật: POST /api/donhang
      await api.post("/donhang", orderData);
      message.success("Tạo đơn hàng thành công!");
      setCart([]);
      setOpenPayment(false);
      setDiscount(0);
      setDiscountCode("");
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
        {/* Danh sách sản phẩm */}
        <Col span={16}>
          <Card title="Sản phẩm có sẵn" bordered={false}>
            <Table
              dataSource={products}
              loading={loading}
              rowKey="sanPhamId"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "Tên sản phẩm", dataIndex: "tenSanPham" },
                {
                  title: "Giá bán",
                  dataIndex: "giaBan",
                  render: (v, r) =>
                    `${(r.giaBan || r.giaGoc)?.toLocaleString()} ₫`,
                },
                {
                  title: "Tồn kho",
                  dataIndex: "soLuongTon",
                  render: (v) => v || 0,
                },
                {
                  title: "Thao tác",
                  render: (_, record) => (
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => addToCart(record)}
                      disabled={(record.soLuongTon || 0) <= 0}
                    >
                      Thêm
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* Giỏ hàng */}
        <Col span={8}>
          <Card
            title={<><ShoppingCartOutlined /> Giỏ hàng</>}
            bordered={false}
          >
            <Table
              dataSource={cart}
              size="small"
              pagination={false}
              rowKey="sanPhamId"
              columns={[
                { title: "Tên", dataIndex: "tenSanPham" },
                {
                  title: "SL",
                  dataIndex: "soLuong",
                  render: (val, record) => (
                    <InputNumber
                      min={1}
                      value={val}
                      onChange={(value) =>
                        setCart(
                          cart.map((item) =>
                            item.sanPhamId === record.sanPhamId
                              ? { ...item, soLuong: value }
                              : item
                          )
                        )
                      }
                    />
                  ),
                },
                {
                  title: "Thành tiền",
                  render: (_, r) =>
                    `${((r.giaBan || r.giaGoc) * r.soLuong).toLocaleString()} ₫`,
                },
                {
                  render: (_, record) => (
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => removeFromCart(record.sanPhamId)}
                    />
                  ),
                },
              ]}
            />

            <Divider />

            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Input
                placeholder="Mã giảm giá"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                style={{ width: "65%" }}
              />
              <Button onClick={applyDiscount}>Áp dụng</Button>
            </Space>

            <Divider />

            <Statistic
              title="Tổng tiền"
              value={total - (total * discount) / 100}
              suffix="₫"
              precision={0}
            />
            {discount > 0 && (
              <Tag color="green" style={{ marginTop: 8 }}>
                Giảm {discount}% khuyến mãi
              </Tag>
            )}

            <Divider />

            <Button
              type="primary"
              block
              icon={<CreditCardOutlined />}
              onClick={() => setOpenPayment(true)}
              disabled={cart.length === 0}
            >
              Thanh toán
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Modal thanh toán */}
      <Modal
        title="Xác nhận thanh toán"
        open={openPayment}
        onCancel={() => setOpenPayment(false)}
        onOk={handleSubmitOrder}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Tổng tiền: <b>{(total - (total * discount) / 100).toLocaleString()} ₫</b></p>
        <Form form={form} layout="vertical">
          <Form.Item label="Phương thức thanh toán">
            <Select
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={[
                { value: "TienMat", label: "Tiền mặt" },
                { value: "The", label: "Thẻ" },
                { value: "ViDienTu", label: "Ví điện tử" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
