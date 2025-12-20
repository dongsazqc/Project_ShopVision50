import { useEffect, useState } from "react";
import { Table, Button, Modal, Spin, message, Tag, Popconfirm } from "antd";
import axios from "axios";

const OrderHistory = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  });

  // ================= STATUS =================
  const renderStatus = (status) => {
    switch (status) {
      case 0:
        return <Tag color="orange">Pending</Tag>;
      case 1:
        return <Tag color="blue">Processing</Tag>;
      case 2:
        return <Tag color="purple">Shipping</Tag>;
      case 3:
        return <Tag color="green">Completed</Tag>;
      case 4:
        return <Tag color="red">Cancelled</Tag>;
      default:
        return <Tag>Không rõ</Tag>;
    }
  };

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    if (!token) return messageApi.error("Bạn chưa đăng nhập");

    setLoading(true);
    try {
      const res = await axiosAuth.get(
        "http://160.250.5.26:5000/api/orders/my-orders"
      );
      const sorted = [...res.data].sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch {
      messageApi.error("Lấy danh sách đơn hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ================= ORDER DETAIL =================
  const fetchOrderDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await axiosAuth.get(
        `http://160.250.5.26:5000/api/Orders/GetById/${orderId}`
      );
      setSelectedOrder(res.data);
      setIsModalVisible(true);
    } catch {
      messageApi.error("Lấy chi tiết đơn hàng thất bại");
    } finally {
      setDetailLoading(false);
    }
  };

  // ================= CANCEL ORDER =================
  const cancelOrder = async (orderId) => {
    try {
      await axiosAuth.put(
        `http://160.250.5.26:5000/api/Orders/Update/${orderId}`,
        { status: 4 } // Cancelled
      );
      messageApi.success("Huỷ đơn hàng thành công");
      fetchOrders();
    } catch {
      messageApi.error("Huỷ đơn hàng thất bại");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= TABLE =================
  const columns = [
    { title: "Mã đơn", dataIndex: "id" },
    { title: "Tên khách hàng", dataIndex: "receiverName" },
    { title: "Số điện thoại", dataIndex: "receiverPhone" },
    {
      title: "Tổng tiền",
      dataIndex: "amountTotal",
      render: (v) => Number(v).toLocaleString() + " đ",
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      render: renderStatus,
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => fetchOrderDetail(record.id)}>
            Xem chi tiết
          </Button>
          {record.orderStatus === 0 && (
            <Popconfirm
              title="Bạn có chắc muốn huỷ đơn này?"
              onConfirm={() => cancelOrder(record.id)}
            >
              <Button danger type="link">
                Huỷ đơn
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {contextHolder}
      <h2>Lịch sử đơn hàng</h2>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Spin>

      {/* ================= MODAL CHI TIẾT ĐƠN HÀNG ================= */}
      <Modal
        title="Chi tiết đơn hàng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={<Button onClick={() => setIsModalVisible(false)}>Đóng</Button>}
        width={800}
      >
        {detailLoading || !selectedOrder ? (
          <Spin />
        ) : (
          <>
            <p>
              <b>Mã đơn:</b> {selectedOrder.orderId}
            </p>
            <p>
              <b>Khách hàng:</b> {selectedOrder.recipientName}
            </p>
            <p>
              <b>SĐT:</b> {selectedOrder.recipientPhone}
            </p>
            <p>
              <b>Địa chỉ:</b> {selectedOrder.shippingAddress || "Chưa có"}
            </p>
            <p>
              <b>Tổng tiền:</b>{" "}
              {Number(selectedOrder.totalAmount).toLocaleString()} đ
            </p>
            <p>
              <b>Trạng thái:</b> {renderStatus(selectedOrder.status)}
            </p>

            <h4>Danh sách sản phẩm:</h4>
            <Table
              dataSource={selectedOrder.orderItems}
              rowKey="orderItemId"
              pagination={false}
              bordered
              columns={[
                {
                  title: "Tên sản phẩm",
                  dataIndex: ["productVariant", "productOrder", "name"],
                  key: "name",
                },
                {
                  title: "Màu",
                  dataIndex: ["productVariant", "color", "name"],
                  key: "color",
                  render: (text) => text || "-",
                },
                {
                  title: "Size",
                  dataIndex: ["productVariant", "size", "name"],
                  key: "size",
                  render: (text) => text || "-",
                },
                {
                  title: "Giá",
                  dataIndex: ["productVariant", "salePrice"],
                  key: "price",
                  render: (v) => Number(v).toLocaleString() + " đ",
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: "Thành tiền",
                  key: "total",
                  render: (_, record) =>
                    Number(
                      record.quantity * record.productVariant.salePrice
                    ).toLocaleString() + " đ",
                },
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default OrderHistory;
