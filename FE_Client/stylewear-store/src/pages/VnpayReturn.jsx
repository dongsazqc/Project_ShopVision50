import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Spin, Result, Button } from "antd";
import api from "../utils/axios";

const VnpayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);

    const vnp_Params = {};
    query.forEach((value, key) => {
      vnp_Params[key] = value;
    });

    const checkPayment = async () => {
      try {
        // Gửi toàn bộ query lên BE để verify checksum & update đơn hàng
        const res = await api.post("/Payment/VnpayReturn", vnp_Params);

        if (res.data?.success) {
          setPaymentStatus("success");

          // Sau 5 giây chuyển về trang lịch sử đơn hàng
          setTimeout(() => navigate("/orders"), 5000);
        } else {
          setPaymentStatus("failed");
        }
      } catch (err) {
        console.error(err);
        setPaymentStatus("failed");
      } finally {
        setLoading(false);
      }
    };

    checkPayment();
  }, [location.search, navigate]);

  if (loading) {
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 15 }}>Đang xác thực thanh toán...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <Card>
        {paymentStatus === "success" ? (
          <Result
            status="success"
            title="Thanh toán thành công!"
            subTitle="Đơn hàng đã được xác nhận. Cảm ơn bạn đã mua hàng!"
            extra={[
              <Button type="primary" onClick={() => navigate("/orders")} key="orders">
                Xem đơn hàng
              </Button>
            ]}
          />
        ) : (
          <Result
            status="error"
            title="Thanh toán thất bại!"
            subTitle="Có lỗi xảy ra trong quá trình xử lý thanh toán."
            extra={[
              <Button type="primary" onClick={() => navigate("/")}>Về trang chủ</Button>,
              <Button onClick={() => navigate("/cart")}>Thử lại</Button>
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default VnpayReturn;
