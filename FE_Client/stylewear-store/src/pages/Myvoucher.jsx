import { useEffect, useState } from "react";
import { Card, Row, Col, Spin, message, Tag, Empty } from "antd";
import axios from "axios";

const MyVoucher = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); // Giả sử lưu userId ở đây lúc login
  const [messageApi, contextHolder] = message.useMessage();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  const axiosAuth = axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchVouchers = async () => {
    if (!token) {
      messageApi.error("Bạn chưa đăng nhập");
      return;
    }

    if (!userId) {
      messageApi.error("Không lấy được thông tin người dùng");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosAuth.get(
        `http://160.250.5.26:5000/api/khuyenmai/users/${userId}/promotions`
      );
      setVouchers(res.data.data || []);
    } catch (error) {
      messageApi.error("Lấy danh sách voucher thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {contextHolder}
      <h2>🎁 Voucher của tôi</h2>

      <Spin spinning={loading}>
        {vouchers.length === 0 ? (
          <Empty description="Bạn chưa có voucher nào" />
        ) : (
          <Row gutter={[16, 16]}>
            {vouchers.map((v, i) => (
              <Col xs={24} md={12} lg={8} key={i}>
                <Card
                  title={
                    <>
                      <b>{v.code}</b>{" "}
                      {v.status ? (
                        <Tag color="green">Còn hạn</Tag>
                      ) : (
                        <Tag color="red">Hết hạn</Tag>
                      )}
                    </>
                  }
                  bordered
                >
                  <p>
                    <b>Giảm:</b>{" "}
                    {v.discountType === "PERCENT"
                      ? `${v.discountValue}%`
                      : Number(v.discountValue).toLocaleString() + " đ"}
                  </p>

                  {v.condition && (
                    <p>
                      <b>Điều kiện:</b> {Number(v.condition).toLocaleString()} đ
                    </p>
                  )}

                  <p>
                    <b>Thời gian:</b>
                    <br />
                    {new Date(v.startDate).toLocaleDateString()} –{" "}
                    {new Date(v.endDate).toLocaleDateString()}
                  </p>

                  <Tag color="blue">Voucher cá nhân</Tag>
                </Card>
              </Col>    
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default MyVoucher;
