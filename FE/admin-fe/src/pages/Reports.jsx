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
    const [messageApi, contextHolder] = message.useMessage();
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
    // GET DOANH THU.
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

            setSummary({
                totalRevenue: data.totalRevenue || 0,
                totalOrders: data.totalOrders || 0,
                totalCustomers: data.totalCustomers || 0,
            });

            const chart =
                data?.monthlyRevenue?.$values?.map((item) => ({
                    label: `${item.month}/${item.year}`,
                    doanhThu: item.revenue,
                })) || [];

            setRevenueData(chart);
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể tải dữ liệu doanh thu");
        }
    };

    // ======================================================
    // GET TOP SẢN PHẨM
    // ======================================================
    const fetchTopProducts = async () => {
        try {
            const res = await api.get("/TopSanPham");

           const list =
    (res.data?.$values || res.data)?.map((item) => ({
        tenSanPham: item.tenSanPham,          // ✔ ĐÚNG
        soLuongBan: item.tongSoLuongBan,      // ✔ ĐÚNG
    })) || [];


            setTopProducts(list);
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể tải top sản phẩm");
        }
    };

    // ======================================================
    // GET TOP KHÁCH HÀNG
    // ======================================================
    const fetchTopCustomers = async () => {
        try {
            const res = await api.get("/TopCustomers");

            // ⚠ API của bạn trả về ARRAY thường → KHÔNG có $values
            const raw = Array.isArray(res.data) ? res.data : res.data?.$values;

            const list =
                raw?.map((item) => ({
                    nguoiDungId: item.userId,
                    hoTen: item.fullName,
                    tongChiTieu: item.totalSpent,
                    soDonHang: item.orderCount,
                })) || [];

            console.log("TopCustomers FE nhận được:", list);

            setTopCustomers(list);
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể tải danh sách khách hàng thân thiết");
        }
    };

    // ======================================================
    // LOAD API
    // ======================================================
    useEffect(() => {
        fetchRevenue();
        fetchTopProducts();
        fetchTopCustomers();
    }, [range]);

    return (
        <div>
            {contextHolder}
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
            <Card title="Biểu đồ doanh thu" style={{ marginTop: 24 }}>
                <ResponsiveContainer width="100%" height={320}>
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
    <Card
        title="Sản phẩm bán chạy nhất"
        styles={{ body: { height: 330, padding: 0 } }}
    >
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                    type="category"
                    dataKey="tenSanPham"
                    width={140}
                    tick={{ fontSize: 12 }}
                />
                <Tooltip
                    formatter={(value) => [`${value} sản phẩm`, "Số lượng bán"]}
                />
                <Bar
                    dataKey="soLuongBan"
                    fill="#4a90e2"
                    radius={[6, 6, 6, 6]}
                    barSize={30}
                />
            </BarChart>
        </ResponsiveContainer>
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
                                {
                                    title: "Số đơn hàng",
                                    dataIndex: "soDonHang",
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
