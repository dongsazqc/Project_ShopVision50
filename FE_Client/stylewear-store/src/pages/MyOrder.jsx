import { useEffect, useState, useMemo, useCallback } from "react";
import { 
  Table, 
  Button, 
  Modal, 
  Spin, 
  message, 
  Tag, 
  Popconfirm, 
  Card, 
  Descriptions, 
  Space, 
  Typography, 
  Divider,
  Row,
  Col,
  Statistic
} from "antd";
import {
  EyeOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckSquareOutlined,
  StopOutlined
} from "@ant-design/icons";
import axios from "axios";
import styled from "styled-components";

const { Title, Text, Paragraph } = Typography;

const OrderContainer = styled.div`
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const OrderCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
`;

const StatusBadge = styled(Tag)`
  border-radius: 16px;
  padding: 4px 12px;
  font-weight: 500;
  border: none;
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const DetailModalContent = styled.div`
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 3px;
    
    &:hover {
      background: #bfbfbf;
    }
  }
`;

const OrderStatusSteps = ({ status }) => {
  const steps = [
    { key: 0, title: "Chờ xác nhận", icon: <ClockCircleOutlined />, color: "#fa8c16" },
    { key: 1, title: "Đang xử lý", icon: <CheckSquareOutlined />, color: "#1890ff" },
    { key: 2, title: "Đang giao hàng", icon: <CarOutlined />, color: "#722ed1" },
    { key: 3, title: "Hoàn thành", icon: <CheckCircleOutlined />, color: "#52c41a" },
    { key: 4, title: "Đã huỷ", icon: <StopOutlined />, color: "#ff4d4f" },
  ];

  const currentStep = steps.findIndex(step => step.key === status);

  return (
    <div style={{ margin: "20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
        {steps.map((step, index) => (
          <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: index <= currentStep ? step.color : "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: index <= currentStep ? "white" : "#bfbfbf",
                fontSize: 18,
                marginBottom: 8,
                border: `3px solid ${index <= currentStep ? step.color : "#f0f0f0"}`,
                transition: "all 0.3s ease"
              }}
            >
              {step.icon}
            </div>
            <Text style={{ 
              fontSize: 12, 
              fontWeight: 500,
              color: index <= currentStep ? step.color : "#bfbfbf" 
            }}>
              {step.title}
            </Text>
            {index === currentStep && (
              <div style={{
                position: "absolute",
                top: -30,
                left: "50%",
                transform: "translateX(-50%)",
                background: step.color,
                color: "white",
                padding: "4px 12px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 500
              }}>
                Trạng thái hiện tại
              </div>
            )}
          </div>
        ))}
        <div style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          height: 3,
          background: "#f0f0f0",
          zIndex: 0
        }}>
          <div style={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
            height: "100%",
            background: steps[currentStep]?.color,
            transition: "all 0.3s ease"
          }} />
        </div>
      </div>
    </div>
  );
};

const MyOrder = () => {
  const token = localStorage.getItem("token");
  const [messageApi, contextHolder] = message.useMessage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const axiosAuth = useMemo(() => axios.create({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  const statusConfig = {
    0: { text: "Chờ xác nhận", color: "#fa8c16", icon: <ClockCircleOutlined /> },
    1: { text: "Đang xử lý", color: "#1890ff", icon: <CheckSquareOutlined /> },
    2: { text: "Đang giao hàng", color: "#722ed1", icon: <CarOutlined /> },
    3: { text: "Hoàn thành", color: "#52c41a", icon: <CheckCircleOutlined /> },
    4: { text: "Đã huỷ", color: "#ff4d4f", icon: <StopOutlined /> },
  };

  const renderStatus = useCallback((status) => {
    const config = statusConfig[status];
    return (
      <StatusBadge 
        color={config.color} 
        icon={config.icon}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 4,
          borderRadius: 16,
          padding: "4px 12px"
        }}
      >
        {config.text}
      </StatusBadge>
    );
  }, [statusConfig]);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      messageApi.error("Bạn chưa đăng nhập");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosAuth.get("http://160.250.5.26:5000/api/orders/my-orders");
      const sorted = [...res.data].sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (error) {
      console.error("Fetch orders error:", error);
      messageApi.error("Lấy danh sách đơn hàng thất bại");
    } finally {
      setLoading(false);
    }
  }, [axiosAuth, token, messageApi]);

  const fetchOrderDetail = useCallback(async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await axiosAuth.get(`http://160.250.5.26:5000/api/Orders/GetById/${orderId}`);
      setSelectedOrder(res.data);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Fetch order detail error:", error);
      messageApi.error("Lấy chi tiết đơn hàng thất bại");
    } finally {
      setDetailLoading(false);
    }
  }, [axiosAuth, messageApi]);

  const cancelOrder = useCallback(async (orderId) => {
    try {
      await axiosAuth.put(`http://160.250.5.26:5000/api/orders/${orderId}/status`, { status: 4 });
      messageApi.success("Huỷ đơn hàng thành công");
      fetchOrders();
    } catch (error) {
      console.error("Cancel order error:", error);
      messageApi.error("Huỷ đơn hàng thất bại");
    }
  }, [axiosAuth, fetchOrders, messageApi]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns = [
    {
      title: "MÃ ĐƠN",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text strong style={{ color: "#1890ff" }}>#{id}</Text>,
    },
    {
      title: "KHÁCH HÀNG",
      dataIndex: "receiverName",
      key: "receiverName",
      render: (name) => <Text>{name}</Text>,
    },
    {
      title: "SỐ ĐIỆN THOẠI",
      dataIndex: "receiverPhone",
      key: "receiverPhone",
      render: (phone) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <PhoneOutlined style={{ color: "#1890ff" }} />
          <Text>{phone}</Text>
        </div>
      ),
    },
    {
      title: "TỔNG TIỀN",
      dataIndex: "amountTotal",
      key: "amountTotal",
      render: (v) => (
        <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
          {Number(v).toLocaleString()} đ
        </Text>
      ),
      align: "right",
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: renderStatus,
    },
    {
      title: "HÀNH ĐỘNG",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <ActionButton
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => fetchOrderDetail(record.id)}
            style={{ borderRadius: 8 }}
          >
            Chi tiết
          </ActionButton>
          {record.orderStatus === 0 && (
            <Popconfirm
              title="Xác nhận huỷ đơn hàng"
              description="Bạn có chắc chắn muốn huỷ đơn hàng này?"
              okText="Đồng ý"
              cancelText="Không"
              onConfirm={() => cancelOrder(record.id)}
              okButtonProps={{ danger: true }}
              icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
            >
              <ActionButton
                danger
                icon={<CloseCircleOutlined />}
                style={{ borderRadius: 8 }}
              >
                Huỷ đơn
              </ActionButton>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const orderSummary = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.orderStatus === 0).length;
    const completed = orders.filter(o => o.orderStatus === 3).length;
    const cancelled = orders.filter(o => o.orderStatus === 4).length;
    
    return { total, pending, completed, cancelled };
  }, [orders]);

  return (
    <OrderContainer>
      {contextHolder}
      
      <OrderHeader>
        <div>
          <Title level={2} style={{ margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
            <ShoppingOutlined style={{ color: "#1890ff", fontSize: 32 }} />
            Đơn Hàng Của Tôi
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Quản lý và theo dõi đơn hàng của bạn
          </Text>
        </div>
        
        <Card
          style={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: 12
          }}
          bodyStyle={{ padding: "16px 24px" }}
        >
          <Statistic
            title="Tổng số đơn hàng"
            value={orderSummary.total}
            valueStyle={{ color: "white", fontSize: 32 }}
            prefix={<ShoppingOutlined />}
          />
        </Card>
      </OrderHeader>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <OrderCard>
            <Statistic
              title="Đang chờ xác nhận"
              value={orderSummary.pending}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<ClockCircleOutlined />}
            />
          </OrderCard>
        </Col>
        <Col span={6}>
          <OrderCard>
            <Statistic
              title="Đã hoàn thành"
              value={orderSummary.completed}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </OrderCard>
        </Col>
        <Col span={6}>
          <OrderCard>
            <Statistic
              title="Đã huỷ"
              value={orderSummary.cancelled}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<StopOutlined />}
            />
          </OrderCard>
        </Col>
        <Col span={6}>
          <OrderCard>
            <Statistic
              title="Tổng tiền đã mua"
              value={orders.reduce((sum, order) => sum + Number(order.amountTotal), 0)}
              valueStyle={{ color: "#1890ff" }}
              formatter={(value) => `${Number(value).toLocaleString()} đ`}
              prefix="₫"
            />
          </OrderCard>
        </Col>
      </Row>

      <OrderCard
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IdcardOutlined />
            <span>Danh sách đơn hàng</span>
            <Tag color="blue" style={{ marginLeft: 8 }}>{orders.length} đơn</Tag>
          </div>
        }
        extra={
          <Button 
            type="primary" 
            ghost 
            onClick={fetchOrders}
            loading={loading}
            icon={<CheckCircleOutlined />}
          >
            Làm mới
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
              style: { marginTop: 16 },
            }}
            locale={{ emptyText: "Bạn chưa có đơn hàng nào" }}
            rowClassName={(record) => 
              record.orderStatus === 3 ? "row-completed" : 
              record.orderStatus === 4 ? "row-cancelled" : ""
            }
          />
        </Spin>
      </OrderCard>

      <Modal
        title={
          <Title level={3} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingOutlined />
            Chi Tiết Đơn Hàng
          </Title>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
        bodyStyle={{ padding: 0 }}
      >
        {detailLoading || !selectedOrder ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <DetailModalContent>
            <div style={{ padding: 24 }}>
              <OrderStatusSteps status={selectedOrder.status} />
              
              <Divider />
              
              <Descriptions 
                title="Thông tin đơn hàng" 
                bordered 
                column={2}
                size="middle"
                labelStyle={{ fontWeight: 500, background: "#fafafa" }}
              >
                <Descriptions.Item label="Mã đơn hàng">
                  <Tag color="blue" icon={<IdcardOutlined />}>
                    #{selectedOrder.orderId}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {renderStatus(selectedOrder.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Khách hàng" span={2}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <IdcardOutlined style={{ color: "#1890ff" }} />
                    <Text strong>{selectedOrder.recipientName}</Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PhoneOutlined style={{ color: "#52c41a" }} />
                    <Text>{selectedOrder.recipientPhone}</Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  <Text strong style={{ color: "#ff4d4f", fontSize: 18 }}>
                    {Number(selectedOrder.totalAmount).toLocaleString()} đ
                  </Text>
                </Descriptions.Item>
                {selectedOrder.shippingAddress && (
                  <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <EnvironmentOutlined style={{ color: "#fa8c16" }} />
                      <Paragraph style={{ margin: 0 }}>{selectedOrder.shippingAddress}</Paragraph>
                    </div>
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Divider>Danh sách sản phẩm</Divider>

              <Table
                dataSource={selectedOrder.orderItems}
                rowKey="orderItemId"
                pagination={false}
                bordered
                size="middle"
                summary={(pageData) => {
                  const totalQuantity = pageData.reduce((sum, item) => sum + item.quantity, 0);
                  const totalAmount = pageData.reduce(
                    (sum, item) => sum + item.quantity * item.productVariant.salePrice,
                    0
                  );

                  return (
                    <Table.Summary.Row style={{ background: "#fafafa" }}>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Text strong>Tổng cộng:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <Text strong>{totalQuantity} sản phẩm</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <Text strong type="danger" style={{ fontSize: 16 }}>
                          {Number(totalAmount).toLocaleString()} đ
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
                columns={[
                  {
                    title: "Sản phẩm",
                    key: "product",
                    render: (_, record) => (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <ProductImage>
                          {record.productVariant?.productOrder?.name?.charAt(0) || "P"}
                        </ProductImage>
                        <div>
                          <Text strong>{record.productVariant?.productOrder?.name || "N/A"}</Text>
                          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            {record.productVariant?.color?.name && (
                              <Tag color="blue" style={{ margin: 0, borderRadius: 4 }}>
                                {record.productVariant.color.name}
                              </Tag>
                            )}
                            {record.productVariant?.size?.name && (
                              <Tag color="green" style={{ margin: 0, borderRadius: 4 }}>
                                {record.productVariant.size.name}
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Giá",
                    dataIndex: ["productVariant", "salePrice"],
                    key: "price",
                    align: "right",
                    render: (v) => (
                      <Text strong style={{ color: "#1890ff" }}>
                        {Number(v).toLocaleString()} đ
                      </Text>
                    ),
                  },
                  {
                    title: "Số lượng",
                    dataIndex: "quantity",
                    key: "quantity",
                    align: "center",
                    render: (v) => <Tag color="blue">{v}</Tag>,
                  },
                  {
                    title: "Thành tiền",
                    key: "total",
                    align: "right",
                    render: (_, record) => (
                      <Text strong style={{ color: "#ff4d4f", fontSize: 15 }}>
                        {Number(record.quantity * record.productVariant.salePrice).toLocaleString()} đ
                      </Text>
                    ),
                  },
                ]}
              />

              <div style={{ 
                marginTop: 24, 
                padding: 16, 
                background: "#f6ffed", 
                border: "1px solid #b7eb8f",
                borderRadius: 8
              }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong style={{ fontSize: 16 }}>
                      Tổng thanh toán:
                    </Text>
                  </Col>
                  <Col>
                    <Title level={3} style={{ margin: 0, color: "#ff4d4f" }}>
                      {Number(selectedOrder.totalAmount).toLocaleString()} đ
                    </Title>
                  </Col>
                </Row>
              </div>

              <div style={{ 
                marginTop: 24, 
                textAlign: "center",
                padding: "16px 0",
                borderTop: "1px solid #f0f0f0"
              }}>
                {selectedOrder.status === 0 && (
                  <Space>
                    <Popconfirm
                      title="Xác nhận huỷ đơn hàng"
                      description="Bạn có chắc chắn muốn huỷ đơn hàng này?"
                      onConfirm={() => {
                        cancelOrder(selectedOrder.orderId);
                        setIsModalVisible(false);
                      }}
                      okText="Đồng ý"
                      cancelText="Không"
                      okButtonProps={{ danger: true }}
                    >
                      <Button danger size="large" icon={<CloseCircleOutlined />}>
                        Huỷ đơn hàng
                      </Button>
                    </Popconfirm>
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={() => setIsModalVisible(false)}
                    >
                      Đóng
                    </Button>
                  </Space>
                )}
                {selectedOrder.status !== 0 && (
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => setIsModalVisible(false)}
                  >
                    Đóng
                  </Button>
                )}
              </div>
            </div>
          </DetailModalContent>
        )}
      </Modal>

      <style jsx="true">{`
        .ant-table-row.row-completed {
          background-color: #f6ffed !important;
        }
        
        .ant-table-row.row-cancelled {
          background-color: #fff1f0 !important;
        }
        
        .ant-table-row:hover {
          background-color: #fafafa !important;
        }
        
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600 !important;
          color: #333 !important;
        }
      `}</style>
    </OrderContainer>
  );
};

export default MyOrder;