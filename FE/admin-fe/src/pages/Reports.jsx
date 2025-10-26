// src/pages/Reports.jsx
import {
  Card,
  DatePicker,
  Select,
  Row,
  Col,
  Statistic,
  Table,
  Space,
  message,
} from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import dayjs from "dayjs";
import api from "../utils/axios"; // TODO: gắn API thật sau

const { RangePicker } = DatePicker;

export default function Reports() {
  const [range, setRange] = useState([dayjs().startOf("month"), dayjs()]);
  const [period, setPeriod] = useState("month");
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  // 📊 Lấy báo cáo doanh thu
  const fetchRevenue = async () => {
    try {
      // TODO: ⚙️ API thật: GET /api/baocao/doanhthu?from=...&to=...
      const res = await api.get("/baocao/doanhthu", {
        params: {
          from: range[0].toISOString(),
          to: range[1].toISOString(),
          period,
        },
      });
      setRevenueData(res.data?.chart || []);
      setSummary({
        totalRevenue: res.data?.totalRevenue || 0,
        totalOrders: res.data?.totalOrders || 0,
        totalCustomers: res.data?.totalCustomers || 0,
      });
    } catch (err) {
      console.error(err);
      message.error("Không thể tải dữ liệu doanh thu");
    }
  };

  // 🔝 Lấy sản phẩm bán chạy
  const fetchTopProducts = async () => {
    try {
      // TODO: ⚙️ API thật: GET /api/baocao/top-sanpham
      const res = await api.get("/baocao/top-sanpham");
      setTopProducts(res.data || []);
    } catch {
      message.error("Không thể tải top sản phẩm");
    }
  };

  // 👥 Lấy khách hàng thân thiết
  const fetchTopCustomers = async () => {
    try {
      // TODO: ⚙️ API thật: GET /api/baocao/top-khachhang
      const res = await api.get("/baocao/top-khachhang");
      setTopCustomers(res.data || []);
    } catch {
      message.error("Không thể tải danh sách khách hàng thân thiết");
    }
  };

  useEffect(() => {
    fetchRevenue();
    fetchTopProducts();
    fetchTopCustomers();
  }, [range, period]);

  return (
    <div>
      <h2>Báo cáo & Thống kê</h2>

      {/* Bộ lọc */}
      <Space style={{ marginBottom: 20 }}>
        <RangePicker
          value={range}
          onChange={setRange}
          format="DD/MM/YYYY"
          allowClear={false}
        />
        <Select
          value={period}
          onChange={setPeriod}
          options={[
            { value: "day", label: "Theo ngày" },
            { value: "month", label: "Theo tháng" },
            { value: "year", label: "Theo năm" },
          ]}
        />
      </Space>

      {/* Tóm tắt */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={summary.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="₫"
              precision={0}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={summary.totalOrders}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Số khách hàng"
              value={summary.totalCustomers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ doanh thu */}
      <Card
        title="Biểu đồ doanh thu"
        style={{ marginTop: 24 }}
        bodyStyle={{ height: 320 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="doanhThu" stroke="#1890ff" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top sản phẩm */}
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Sản phẩm bán chạy">
            <BarChart
              width={500}
              height={300}
              data={topProducts}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="tenSanPham" width={150} />
              <Tooltip />
              <Bar dataKey="soLuongBan" fill="#82ca9d" />
            </BarChart>
          </Card>
        </Col>

        {/* Khách hàng thân thiết */}
        <Col span={12}>
          <Card title="Khách hàng thân thiết">
            <Table
              dataSource={topCustomers}
              rowKey="nguoiDungId"
              pagination={false}
              columns={[
                { title: "Khách hàng", dataIndex: "hoTen" },
                {
                  title: "Tổng chi tiêu",
                  dataIndex: "tongChiTieu",
                  render: (v) => `${v?.toLocaleString()} ₫`,
                },
                { title: "Số đơn hàng", dataIndex: "soDonHang" },
              ]}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
