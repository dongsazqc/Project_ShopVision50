import { useEffect, useState } from "react";
import { Table, Button, Modal, Spin, message } from "antd";
import axios from "axios";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  // Hàm gọi API với token
  const axiosAuth = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  });

  // Lấy tất cả đơn hàng
  const fetchOrders = async () => {
    if (!token) {
      message.error("Bạn chưa đăng nhập");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosAuth.get(
        "http://160.250.5.26:5000/api/Orders/GetAll"
      );
      const data = res.data?.$values || [];
      setOrders(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else {
        message.error("Lấy danh sách đơn hàng thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  // Lấy chi tiết đơn hàng
  const fetchOrderDetail = async (orderId) => {
    if (!token) {
      message.error("Bạn chưa đăng nhập");
      return;
    }

    setDetailLoading(true);
    try {
      const res = await axiosAuth.get(
        `http://160.250.5.26:5000/api/Orders/GetById/${orderId}`
      );
      setSelectedOrder(res.data);
      setIsModalVisible(true);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else {
        message.error("Lấy chi tiết đơn hàng thất bại");
      }
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Tên khách hàng",
      dataIndex: "recipientName",
      key: "recipientName",
    },
    {
      title: "Số điện thoại",
      dataIndex: "recipientPhone",
      key: "recipientPhone",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (text) => Number(text)?.toLocaleString() + " đ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text) => (text ? "Hoàn thành" : "Chưa xử lý"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => fetchOrderDetail(record.orderId)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Lịch sử đơn hàng</h2>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="orderId"
          pagination={{ pageSize: 5 }}
        />
      </Spin>

      <Modal
        title="Chi tiết đơn hàng"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {detailLoading || !selectedOrder ? (
          <Spin />
        ) : (
          <div>
            <p>
              <strong>Mã đơn:</strong> {selectedOrder.orderId}
            </p>
            <p>
              <strong>Tên khách hàng:</strong> {selectedOrder.recipientName}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {selectedOrder.recipientPhone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}
            </p>
            <p>
              <strong>Tổng tiền:</strong>{" "}
              {Number(selectedOrder.totalAmount)?.toLocaleString()} đ
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {selectedOrder.status ? "Hoàn thành" : "Chưa xử lý"}
            </p>

            <h4>Sản phẩm</h4>
            {selectedOrder.orderItems?.length > 0 ? (
              <ul>
                {selectedOrder.orderItems.map((item) => (
                  <li key={item.id}>
                    {item.productName} - {item.quantity} x{" "}
                    {Number(item.price)?.toLocaleString()} đ
                  </li>
                ))}
              </ul>
            ) : (
              <p>Không có sản phẩm</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderHistory;
