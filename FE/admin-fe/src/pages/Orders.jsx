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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/Orders/GetAll");
      const list = res.data?.$values || res.data || [];
      setOrders(list);
      setFilteredOrders(list);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ======================= HANDLE FILTER =========================
  const applyFilters = () => {
    let result = [...orders];

    // 🔎 Lọc theo tên người nhận
    if (searchText.trim() !== "") {
      result = result.filter((o) =>
        o.recipientName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 🔎 Lọc theo số điện thoại
    if (phoneFilter.trim() !== "") {
      result = result.filter((o) =>
        o.recipientPhone?.includes(phoneFilter)
      );
    }

    // 📅 Lọc theo ngày
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      result = result.filter((o) => {
        const date = dayjs(o.orderDate);
        return date.isAfter(start.startOf("day")) && date.isBefore(end.endOf("day"));
      });
    }

    // 🔖 Lọc theo trạng thái
    if (statusFilter !== "all") {
      const boolStatus = statusFilter === "completed";
      result = result.filter((o) => o.status === boolStatus);
    }

    setFilteredOrders(result);
  };

  useEffect(() => {
    applyFilters();
  }, [searchText, phoneFilter, dateRange, statusFilter, orders]);

  // ================= VIEW + EDIT ORDER =================
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
      });
      setDetailModal(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải chi tiết đơn hàng");
    }
  };

  const handleSaveUpdate = async () => {
    try {
      const values = await form.validateFields();
      await api.put(`/Orders/Update/${selectedOrder.orderId}`, {
        ...selectedOrder,
        ...values,
      });
      message.success("Cập nhật đơn hàng thành công!");
      setDetailModal(false);
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật đơn hàng");
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case true:
        return <Tag color="green">Hoàn tất</Tag>;
      case false:
        return <Tag color="orange">Đang xử lý</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      width: 100,
    },
    {
      title: "Người nhận",
      dataIndex: "recipientName",
      render: (text, record) => (
        <span
          style={{ color: "#1677ff", cursor: "pointer" }}
          onClick={() => handleView(record)}
        >
          {text || "Không rõ"}
        </span>
      ),
    },
    { title: "Số điện thoại", dataIndex: "recipientPhone" },
    { title: "Địa chỉ giao hàng", dataIndex: "shippingAddress", ellipsis: true },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (val) => `${val?.toLocaleString()} ₫`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (val) => renderStatus(val),
    },
    {
      title: "Ngày tạo",
      dataIndex: "orderDate",
      render: (val) =>
        val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "—",
    },
  ];

  return (
    <div>
      {/* HEADER + FILTER */}
      <Space
        style={{
          marginBottom: 16,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
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
          style={{ width: 180 }}
          onChange={(v) => setStatusFilter(v)}
          options={[
            { label: "Tất cả", value: "all" },
            { label: "Đang xử lý", value: "processing" },
            { label: "Hoàn tất", value: "completed" },
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

      {/* Modal Chi tiết + Cập nhật */}
      <Modal
        title={`Chi tiết & Cập nhật đơn hàng #${selectedOrder?.orderId || ""}`}
        open={detailModal}
        onCancel={() => setDetailModal(false)}
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
        width={700}
      >
        {selectedOrder && (
          <>
            <Form form={form} layout="vertical">
              <Form.Item label="Tên người nhận" name="recipientName">
                <Input />
              </Form.Item>
              <Form.Item label="Số điện thoại" name="recipientPhone">
                <Input />
              </Form.Item>
              <Form.Item label="Địa chỉ giao hàng" name="shippingAddress">
                <Input />
              </Form.Item>
              <Form.Item label="Tổng tiền" name="totalAmount">
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Trạng thái" name="status">
                <Select>
                  <Select.Option value={false}>Đang xử lý</Select.Option>
                  <Select.Option value={true}>Hoàn tất</Select.Option>
                </Select>
              </Form.Item>
            </Form>

            <h3 style={{ marginTop: 24 }}>Danh sách sản phẩm</h3>
            <Table
              dataSource={selectedOrder?.orderItems?.$values || []}
              columns={[
                { title: "Sản phẩm ID", dataIndex: "productVariantId" },
                { title: "Số lượng", dataIndex: "quantity" },
                {
                  title: "Đơn giá",
                  dataIndex: "price",
                  render: (v) => `${v?.toLocaleString()} ₫`,
                },
                {
                  title: "Giảm giá",
                  dataIndex: "discountAmount",
                  render: (v) => `${v?.toLocaleString()} ₫`,
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
