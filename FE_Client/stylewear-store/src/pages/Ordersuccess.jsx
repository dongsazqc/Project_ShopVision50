import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const OrderSuccess = () => {
  const navigate = useNavigate();

  // Khởi tạo state trực tiếp từ sessionStorage
  const [orderInfo] = useState(() => {
    const data = sessionStorage.getItem("orderSuccess");
    return data ? JSON.parse(data) : null;
  });

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <CheckCircleOutlined style={styles.icon} />
        <h1 style={styles.title}>Đặt hàng thành công!</h1>
        <p style={styles.desc}>
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được ghi nhận và đang
          được xử lý.
        </p>

        {orderInfo && (
          <div style={styles.infoBox}>
            <h3>Thông tin đơn hàng</h3>
            <p><strong>Mã đơn:</strong> {orderInfo.orderCode}</p>
            <p><strong>Tên khách hàng:</strong> {orderInfo.fullName}</p>
            <p><strong>Số điện thoại:</strong> {orderInfo.phone}</p>
            <p><strong>Địa chỉ:</strong> {orderInfo.address}</p>
            <p><strong>Tổng tiền:</strong> {orderInfo.total?.toLocaleString()} đ</p>
          </div>
        )}

        <div style={styles.actions}>
          <Button
            type="primary"
            size="large"
            style={{ marginRight: 10 }}
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </Button>
        <Button size="large" onClick={() => navigate("/myorder")}>
          Xem đơn hàng
        </Button>

        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },
  card: {
    background: "#fff",
    padding: 40,
    borderRadius: 12,
    width: "100%",
    maxWidth: 600,
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  icon: {
    fontSize: 80,
    color: "#52c41a",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    marginBottom: 10,
  },
  desc: {
    color: "#666",
    marginBottom: 25,
  },
  infoBox: {
    background: "#fafafa",
    padding: 20,
    borderRadius: 8,
    textAlign: "left",
    marginBottom: 25,
  },
  actions: {
    display: "flex",
    justifyContent: "center",
  },
};

export default OrderSuccess;
