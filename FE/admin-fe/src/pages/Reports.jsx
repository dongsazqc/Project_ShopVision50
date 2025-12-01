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
import api from "../utils/axios";

const { RangePicker } = DatePicker;

export default function Reports() {
  const [range, setRange] = useState([dayjs().startOf("month"), dayjs()]);

  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  // ======================================================
  // GET DOANH THU - API THẬT
  // ======================================================
  const fetchRevenue = async () => {
    try {
      const res = await api.get("/revenue/summary", {
        params: {
          from: range[0].format("YYYY-MM-DD"),
          to: range[1].format("YYYY-MM-DD"),
        },
      });

      const data = res.data;

      // Tổng quan
      setSummary({
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        totalCustomers: data.totalCustomers || 0,
      });

      // Biểu đồ doanh thu theo tháng
      const chart =
        data?.monthlyRevenue?.$values?.map((item) => ({
          label: `${item.month}/${item.year}`,
          doanhThu: item.revenue,
        })) || [];

      setRevenueData(chart);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải dữ liệu doanh thu");
    }
  };

  // ======================================================
  // GET TOP SẢN PHẨM BÁN CHẠY
  // ======================================================
  const fetchTopProducts = async () => {
    try {
      const res = await api.get("/TopSanPham");

      const list =
        res.data?.$values?.map((item) => ({
          tenSanPham: item.productName,
          soLuongBan: item.totalSold,
        })) || [];

      setTopProducts(list);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải top sản phẩm");
    }
  };

  // ======================================================
  // GET TOP KHÁCH HÀNG
  // ======================================================
  const fetchTopCustomers = async () => {
    try {
      const res = await api.get("/TopCustomers");

      const list =
        res.data?.$values?.map((item) => ({
          nguoiDungId: item.userId,
          hoTen: item.fullName,
          tongChiTieu: item.totalSpent,
          soDonHang: item.orderCount,
        })) || [];

      setTopCustomers(list);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách khách hàng thân thiết");
    }
  };

  // ======================================================
  // LOAD TẤT CẢ API KHI ĐỔI NGÀY
  // ======================================================
  useEffect(() => {
    fetchRevenue();
    fetchTopProducts();
    fetchTopCustomers();
  }, [range]);

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
      </Space>

      {/* Tổng hợp */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={summary.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="₫"
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
              title="Tổng khách hàng"
              value={summary.totalCustomers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ doanh thu */}
      <Card title="Biểu đồ doanh thu" style={{ marginTop: 24 }} bodyStyle={{ height: 320 }}>
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

      {/* Top sản phẩm & khách hàng */}
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Sản phẩm bán chạy nhất">
            <BarChart width={500} height={300} data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="tenSanPham" width={150} />
              <Tooltip />
              <Bar dataKey="soLuongBan" fill="#82ca9d" />
            </BarChart>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Khách hàng thân thiết">
            <Table
              dataSource={topCustomers}
              rowKey="nguoiDungId"
              pagination={false}
              size="small"
              columns={[
                { title: "Khách hàng", dataIndex: "hoTen" },
                {
                  title: "Tổng chi tiêu",
                  dataIndex: "tongChiTieu",
                  render: (v) => `${v?.toLocaleString()} ₫`,
                },
                { title: "Số đơn hàng", dataIndex: "soDonHang" },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
