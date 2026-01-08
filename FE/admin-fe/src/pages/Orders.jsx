import {
  Table,
  Tag,
  Button,
  Space,
  message,
  Form,
  Input,
  Select,
  DatePicker,
  Modal,
} from "antd";
import { ReloadOutlined, SaveOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../utils/axios";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

// STATUS: BE number → FE label
const STATUS = {
  0: { label: "Chờ xử lý", color: "orange" }, // Pending
  1: { label: "Đang xử lý", color: "blue" }, // Processing
  2: { label: "Đang giao", color: "cyan" }, // Shipping
  3: { label: "Hoàn tất", color: "green" }, // Completed
  4: { label: "Đã huỷ", color: "red" }, // Cancelled
};

const paymentMethodMap = {
  cash: "Tiền mặt",
  bank: "Chuyển khoản",
};

const orderTypeMap = {
  Offline: "Bán hàng tại quầy",
  Online: "Online",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const canEditAll = (status) => status === 0; // Pending
  const canOnlyEditStatus = (status) =>
    status === 1 || status === 2 || status === 4;
  const isCompleted = (status) => status === 3;

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get("/Orders/GetAll");

      // Normalize đúng kiểu dữ liệu từ backend .NET
      const raw = res.data?.$values || res.data || [];

      // Map dữ liệu + Sort mới nhất lên đầu
      const list = raw
        .map((o) => ({
          ...o,
          status: o.status,
          paymentMethod: o.payments?.[0]?.method?.toLowerCase() ?? "cash",
          orderItems:
            o.orderItems?.map((item) => ({
              orderItemId: item.orderItemId,
              productName: item.productVariant?.productOrder?.name || "—",
              productImage: "/no-img.png",
              quantity: item.quantity,
              price: item.productVariant?.salePrice || 0,
              total: item.quantity * (item.productVariant?.salePrice || 0),
              size: item.productVariant?.size?.name || "—",
              color: item.productVariant?.color?.name || "—",
            })) || [],
        }))
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // 🔥 newest first

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

  const applyFilters = () => {
    let result = [...orders];

    if (searchText.trim()) {
      result = result.filter((o) =>
        o.recipientName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (phoneFilter.trim()) {
      result = result.filter((o) => o.recipientPhone?.includes(phoneFilter));
    }

    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      result = result.filter((o) => {
        const date = dayjs(o.orderDate);
        return (
          date.isAfter(start.startOf("day")) && date.isBefore(end.endOf("day"))
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === Number(statusFilter));
    }

    setFilteredOrders(result);
  };

  useEffect(() => {
    applyFilters();
  }, [searchText, phoneFilter, dateRange, statusFilter, orders]);

  const handleView = async (record) => {
    try {
      const res = await api.get(`/Orders/GetById/${record.orderId}`);
      const data = res.data;

      setSelectedOrder({
        ...data,
        status: data.status,
        paymentMethod: data.payments?.[0]?.method?.toLowerCase() ?? "cash",
        orderItems:
          data.orderItems?.map((item) => ({
            orderItemId: item.orderItemId,
            productName: item.productVariant?.productOrder?.name || "—",
            productImage: "/no-img.png",
            quantity: item.quantity,
            price: item.productVariant?.salePrice || 0,
            total: item.quantity * (item.productVariant?.salePrice || 0),
            size: item.productVariant?.size?.name || "—",
            color: item.productVariant?.color?.name || "—",
          })) || [],
      });

      form.setFieldsValue({
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        shippingAddress: data.shippingAddress,
        orderType: data.orderType,
        paymentMethod: data.payments?.[0]?.method?.toLowerCase(),
        totalAmount: data.totalAmount,
        status: data.status,
      });

      setDetailModal(true);
    } catch (err) {
      message.error("Không thể tải chi tiết đơn hàng");
    }
  };

const handleSaveUpdate = async () => {
  try {
    const values = await form.validateFields();

    // Chỉ gọi API update trạng thái, bỏ payload thừa
    await api.put(`/orders/${selectedOrder.orderId}/status`, {
      status: values.status,
    });

    message.success("Cập nhật trạng thái thành công");
    setDetailModal(false);
    fetchOrders();
  } catch (err) {
    console.error(err);
    message.error("Lỗi khi cập nhật trạng thái đơn hàng");
  }
};


// //  const handleSaveUpdate = async () => {
//     try {
      // const values = await form.validateFields();

      // const payload = {
      //   orderId: selectedOrder.orderId,
      //   status: values.status,
      //   recipientName: values.recipientName,
      //   recipientPhone: values.recipientPhone,
      //   shippingAddress: values.shippingAddress,
      // };

//       await api.put(`/Orders/Update/${selectedOrder.orderId}`, payload);

//       message.success("Cập nhật thành công");
//       setDetailModal(false);
//       fetchOrders();
//     } catch (err) {
//       console.error(err);
//       message.error("Lỗi khi cập nhật đơn hàng");
//     }
//   };


  const columns = [
    { title: "Mã đơn", dataIndex: "orderId", width: 80 },
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
    { title: "Số điện thoại", dataIndex: "recipientPhone", width: 120 },
    {
      title: "Loại đơn",
      dataIndex: "orderType",
      render: (v) => orderTypeMap[v] || v,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      render: (v) => paymentMethodMap[v] || "—",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (v) => `${v.toLocaleString()} ₫`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (v) => <Tag color={STATUS[v]?.color}>{STATUS[v]?.label}</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "orderDate",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div>
      <Space
        style={{
          marginBottom: 16,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <h2>Quản lý đơn hàng</h2>
        <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
          Làm mới
        </Button>
      </Space>

      {/* FILTERS */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên..."
          style={{ width: 200 }}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Input
          placeholder="Tìm theo SĐT..."
          style={{ width: 150 }}
          allowClear
          onChange={(e) => setPhoneFilter(e.target.value)}
        />

        <RangePicker onChange={setDateRange} />

        <Select
          style={{ width: 180 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Tất cả" },
            ...Object.entries(STATUS).map(([key, v]) => ({
              value: key,
              label: v.label,
            })),
          ]}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="orderId"
        loading={loading}
        bordered
      />

      {/* ORDER DETAILS */}
      <Modal
        title={`Chi tiết #${selectedOrder?.orderId}`}
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
              <Form.Item label="Tên người nhận" name="recipientName">
                <Input disabled={!canEditAll(selectedOrder.status)} />
              </Form.Item>

              <Form.Item label="Số điện thoại" name="recipientPhone">
                <Input disabled={!canEditAll(selectedOrder.status)} />
              </Form.Item>

              <Form.Item label="Địa chỉ" name="shippingAddress">
                <Input disabled={!canEditAll(selectedOrder.status)} />
              </Form.Item>

              <Form.Item label="Loại đơn" name="orderType">
                <Input disabled />
              </Form.Item>

              <Form.Item label="Thanh toán" name="paymentMethod">
                <Select disabled={!canEditAll(selectedOrder.status)}>
                  <Select.Option value="cash">Tiền mặt</Select.Option>
                  <Select.Option value="bank">Chuyển khoản</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Tổng tiền" name="totalAmount">
                <Input disabled />
              </Form.Item>

              <Form.Item label="Trạng thái" name="status">
                <Select disabled={isCompleted(selectedOrder.status)}>
                  <Select.Option value={0}>Chờ xử lý</Select.Option>
                  <Select.Option value={1}>Đang xử lý</Select.Option>
                  <Select.Option value={2}>Đang giao</Select.Option>
                  <Select.Option value={3}>Hoàn tất</Select.Option>
                  <Select.Option value={4}>Đã huỷ</Select.Option>
                </Select>
              </Form.Item>
            </Form>

            <h3 style={{ marginTop: 20 }}>Sản phẩm</h3>

            <Table
              dataSource={selectedOrder.orderItems}
              rowKey="orderItemId"
              size="small"
              bordered
              pagination={false}
              columns={[
                {
                  title: "Sản phẩm",
                  dataIndex: "productName",
                },
                {
                  title: "Màu",
                  dataIndex: "color",
                  width: 100,
                },
                {
                  title: "Size",
                  dataIndex: "size",
                  width: 70,
                },
                {
                  title: "SL",
                  dataIndex: "quantity",
                  width: 60,
                },
                {
                  title: "Giá",
                  dataIndex: "price",
                  render: (v) => `${v.toLocaleString()} ₫`,
                },
                {
                  title: "Tổng",
                  dataIndex: "total",
                  render: (v) => `${v.toLocaleString()} ₫`,
                },
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
