import { useEffect, useState } from "react";
import { Table, Button, Modal, Spin, message } from "antd";
import axios from "axios";

const OrderHistory = () => {
    const [messageApi, contextHolder] = message.useMessage();

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

    // Lấy tất cả đơn hàng của user hiện tại
    const fetchOrders = async () => {
        if (!token) {
            messageApi.error("Bạn chưa đăng nhập");
            return;
        }

        setLoading(true);
        try {
            const res = await axiosAuth.get(
                "http://160.250.5.26:5000/api/orders/my-orders"
            );
            const data = res.data?.$values || [];
            setOrders(data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                messageApi.error(
                    "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
                );
            } else {
                messageApi.error("Lấy danh sách đơn hàng thất bại");
            }
        } finally {
            setLoading(false);
        }
    };

    // Lấy chi tiết đơn hàng (dữ liệu hiện tại từ list, giữ nguyên logic)
    const fetchOrderDetail = async (orderId) => {
        if (!token) {
            messageApi.error("Bạn chưa đăng nhập");
            return;
        }

        setDetailLoading(true);
        try {
            // Nếu backend không có chi tiết riêng, dùng chính dữ liệu trong orders
            const order = orders.find((o) => o.id === orderId);
            if (order) {
                setSelectedOrder(order);
                setIsModalVisible(true);
            } else {
                messageApi.error("Không tìm thấy đơn hàng");
            }
        } catch (err) {
            console.error(err);
            messageApi.error("Lấy chi tiết đơn hàng thất bại");
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
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Tên khách hàng",
            dataIndex: "receiverName",
            key: "receiverName",
        },
        {
            title: "Số điện thoại",
            dataIndex: "receiverPhone",
            key: "receiverPhone",
        },
        {
            title: "Tổng tiền",
            dataIndex: "amountTotal",
            key: "amountTotal",
            render: (text) => Number(text)?.toLocaleString() + " đ",
        },
        {
            title: "Trạng thái",
            dataIndex: "orderStatus",
            key: "orderStatus",
            render: (text) => (text === 1 ? "Hoàn thành" : "Chưa xử lý"),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Button type="link" onClick={() => fetchOrderDetail(record.id)}>
                    Xem chi tiết
                </Button>
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

            <Modal
                title="Chi tiết đơn hàng"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setIsModalVisible(false)}
                    >
                        Đóng
                    </Button>,
                ]}
            >
                {detailLoading || !selectedOrder ? (
                    <Spin />
                ) : (
                    <div>
                        <p>
                            <strong>Mã đơn:</strong> {selectedOrder.id}
                        </p>
                        <p>
                            <strong>Tên khách hàng:</strong>{" "}
                            {selectedOrder.receiverName}
                        </p>
                        <p>
                            <strong>Số điện thoại:</strong>{" "}
                            {selectedOrder.receiverPhone}
                        </p>
                        <p>
                            <strong>Địa chỉ:</strong>{" "}
                            {selectedOrder.deliveryAddress}
                        </p>
                        <p>
                            <strong>Tổng tiền:</strong>{" "}
                            {Number(
                                selectedOrder.amountTotal
                            )?.toLocaleString()}{" "}
                            đ
                        </p>
                        <p>
                            <strong>Trạng thái:</strong>{" "}
                            {selectedOrder.orderStatus === 1
                                ? "Hoàn thành"
                                : "Chưa xử lý"}
                        </p>

                        <h4>Sản phẩm</h4>
                        {/* Nếu API /my-orders không có orderItems thì bỏ hiển thị */}
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
