import {
    Table,
    Tag,
    Button,
    Modal,
    Space,
    message,
    Form,
    Input,
    Select,
    DatePicker,
} from "antd";
import { ReloadOutlined, SaveOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import api from "../utils/axios";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function Orders() {
    const [messageApi, contextHolder] = message.useMessage();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [detailModal, setDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [form] = Form.useForm();

    // --- Filter States ---
    const [searchText, setSearchText] = useState("");
    const [phoneFilter, setPhoneFilter] = useState("");
    const [dateRange, setDateRange] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");

    // ===================== STATUS MAPPING =====================
    const statusLabels = {
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        shipping: "Đang giao hàng",
        delivered: "Đã giao",
        completed: "Hoàn tất",
        cancelled: "Đã hủy",
    };

    const statusColors = {
        pending: "default",
        confirmed: "processing",
        shipping: "blue",
        delivered: "cyan",
        completed: "green",
        cancelled: "red",
    };

    const paymentMethodMap = {
        cash: "Tiền mặt",
        bank: "Chuyển khoản",
    };

    const orderTypeMap = {
        delivery: "Giao hàng",
        pickup: "Nhận tại cửa hàng",
    };

    // ===================== FETCH ORDERS =====================
    const fetchOrders = async () => {
        try {
            setLoading(true);
            let res = await api.get("/Orders/GetAll");
            let list = res.data?.$values || res.data || [];

            // Sort newest first
            list = list.sort(
                (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
            );

            setOrders(list);
            setFilteredOrders(list);
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // ===================== FILTERING =====================
    const applyFilters = () => {
        let result = [...orders];

        if (searchText.trim()) {
            result = result.filter((o) =>
                o.recipientName
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase())
            );
        }

        if (phoneFilter.trim()) {
            result = result.filter((o) =>
                o.recipientPhone?.includes(phoneFilter)
            );
        }

        if (dateRange && dateRange.length === 2) {
            const [start, end] = dateRange;
            result = result.filter((o) => {
                const date = dayjs(o.orderDate);
                return (
                    date.isAfter(start.startOf("day")) &&
                    date.isBefore(end.endOf("day"))
                );
            });
        }

        if (statusFilter !== "all") {
            result = result.filter((o) => o.status === statusFilter);
        }

        setFilteredOrders(result);
    };

    useEffect(() => {
        applyFilters();
    }, [searchText, phoneFilter, dateRange, statusFilter, orders]);

    // ===================== VIEW ORDER =====================
    const handleView = async (record) => {
        try {
            const res = await api.get(`/Orders/GetById/${record.orderId}`);
            setSelectedOrder(res.data);

            form.setFieldsValue({
                recipientName: res.data.recipientName,
                recipientPhone: res.data.recipientPhone,
                shippingAddress: res.data.shippingAddress,
                totalAmount: res.data.totalAmount,
                status: res.data.status,
                paymentMethod: res.data.paymentMethod,
                orderType: res.data.orderType,
            });

            setDetailModal(true);
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể tải chi tiết đơn hàng");
        }
    };

    // ===================== SAVE UPDATED ORDER =====================
    const handleSaveUpdate = async () => {
        try {
            const values = await form.validateFields();

            await api.put(`/Orders/Update/${selectedOrder.orderId}`, {
                ...selectedOrder,
                ...values,
            });

            messageApi.success("Cập nhật đơn hàng thành công!");
            setDetailModal(false);
            fetchOrders();
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể cập nhật đơn hàng");
        }
    };

    // ===================== COLUMNS =====================
    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "orderId",
            width: 90,
        },
        {
            title: "Người nhận",
            dataIndex: "recipientName",
            render: (text, record) => (
                <span
                    style={{ color: "#1677ff", cursor: "pointer" }}
                    onClick={() => handleView(record)}
                >
                    {text}
                </span>
            ),
        },
        { title: "Số điện thoại", dataIndex: "recipientPhone" },
        {
            title: "Loại đơn",
            dataIndex: "orderType",
            render: (v) => orderTypeMap[v] || "—",
        },
        {
            title: "Thanh toán",
            dataIndex: "paymentMethod",
            render: (v) => paymentMethodMap[v] || "—",
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            render: (v) => `${v?.toLocaleString()} ₫`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (v) => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag>,
        },
        {
            title: "Ngày tạo",
            dataIndex: "orderDate",
            render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
        },
    ];

    return (
        <div>
            {contextHolder}
            {/* HEADER */}
            <Space
                style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <h2>Quản lý đơn hàng</h2>
                <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
                    Làm mới
                </Button>
            </Space>

            {/* FILTER BAR */}
            <Space style={{ marginBottom: 16 }} wrap>
                <Input
                    placeholder="Tìm theo tên người nhận..."
                    style={{ width: 220 }}
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <Input
                    placeholder="Tìm theo số điện thoại..."
                    style={{ width: 180 }}
                    allowClear
                    onChange={(e) => setPhoneFilter(e.target.value)}
                />

                <RangePicker
                    style={{ width: 260 }}
                    onChange={(values) => setDateRange(values)}
                />

                <Select
                    value={statusFilter}
                    style={{ width: 200 }}
                    onChange={(v) => setStatusFilter(v)}
                    options={[
                        { label: "Tất cả", value: "all" },
                        ...Object.keys(statusLabels).map((key) => ({
                            label: statusLabels[key],
                            value: key,
                        })),
                    ]}
                />
            </Space>

            {/* TABLE */}
            <Table
                columns={columns}
                dataSource={filteredOrders}
                rowKey="orderId"
                loading={loading}
                bordered
            />

            {/* MODAL */}
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?.orderId}`}
                open={detailModal}
                onCancel={() => setDetailModal(false)}
                width={700}
                footer={[
                    <Button onClick={() => setDetailModal(false)}>Đóng</Button>,
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSaveUpdate}
                    >
                        Lưu thay đổi
                    </Button>,
                ]}
            >
                {selectedOrder && (
                    <>
                        <Form form={form} layout="vertical">
                            <Form.Item
                                label="Tên người nhận"
                                name="recipientName"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Số điện thoại"
                                name="recipientPhone"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Địa chỉ giao hàng"
                                name="shippingAddress"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item label="Loại đơn" name="orderType">
                                <Select>
                                    <Select.Option value="delivery">
                                        Giao hàng
                                    </Select.Option>
                                    <Select.Option value="pickup">
                                        Nhận tại cửa hàng
                                    </Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item label="Thanh toán" name="paymentMethod">
                                <Select>
                                    <Select.Option value="cash">
                                        Tiền mặt
                                    </Select.Option>
                                    <Select.Option value="bank">
                                        Chuyển khoản
                                    </Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item label="Tổng tiền" name="totalAmount">
                                <Input type="number" />
                            </Form.Item>

                            <Form.Item label="Trạng thái" name="status">
                                <Select>
                                    {Object.keys(statusLabels).map((key) => (
                                        <Select.Option key={key} value={key}>
                                            {statusLabels[key]}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Form>

                        <h3 style={{ marginTop: 24 }}>Danh sách sản phẩm</h3>

                        <Table
                            dataSource={
                                selectedOrder?.orderItems?.$values ||
                                selectedOrder?.orderItems ||
                                []
                            }
                            columns={[
                                {
                                    title: "Sản phẩm",
                                    dataIndex: "productName",
                                    render: (_, record) => (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <img
                                                src={record.productImage}
                                                alt=""
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    objectFit: "cover",
                                                    borderRadius: 4,
                                                }}
                                            />
                                            <span>{record.productName}</span>
                                        </div>
                                    ),
                                },
                                {
                                    title: "Màu",
                                    dataIndex: ["variant", "color"],
                                    render: (_, r) =>
                                        r.color || r.variant?.color || "—",
                                    width: 90,
                                },
                                {
                                    title: "Size",
                                    dataIndex: ["variant", "size"],
                                    render: (_, r) =>
                                        r.size || r.variant?.size || "—",
                                    width: 70,
                                },
                                {
                                    title: "Số lượng",
                                    dataIndex: "quantity",
                                    width: 80,
                                },
                                {
                                    title: "Đơn giá",
                                    dataIndex: "price",
                                    render: (v) =>
                                        `${(v || 0).toLocaleString()} ₫`,
                                    width: 120,
                                },
                                {
                                    title: "Thành tiền",
                                    dataIndex: "total",
                                    render: (_, row) =>
                                        `${(
                                            (row.total ??
                                                row.quantity * row.price) ||
                                            0
                                        ).toLocaleString()} ₫`,
                                    width: 140,
                                },
                            ]}
                            pagination={false}
                            rowKey="orderItemId"
                            size="small"
                            bordered
                        />
                    </>
                )}
            </Modal>
        </div>
    );
}
