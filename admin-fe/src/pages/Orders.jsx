// src/pages/Orders.jsx
import {
  Table,
  Tag,
  Button,
  Modal,
  Space,
  message,
  Descriptions,
  Steps,
  Select,
} from "antd";
import { EyeOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import api from "../utils/axios"; // TODO: Cấu hình baseURL + token interceptor ở đây
import dayjs from "dayjs";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // 📦 Lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // TODO: ⚙️ API thật: GET /api/donhang (include KhachHang + ChiTietDonHang)
      const res = await api.get("/donhang");
      setOrders(res.data || []);
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

  // 👁️ Xem chi tiết đơn hàng
  const handleView = async (record) => {
    try {
      // TODO: ⚙️ API thật: GET /api/donhang/:id (bao gồm chi tiết và khách hàng)
      const res = await api.get(`/donhang/${record.donHangId}`);
      setSelectedOrder(res.data);
      setDetailModal(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải chi tiết đơn hàng");
    }
  };

  // 🔁 Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async () => {
    if (!selectedStatus) return message.warning("Vui lòng chọn trạng thái mới");
    try {
      // TODO: ⚙️ API thật: PUT /api/donhang/:id/trangthai
      await api.put(`/donhang/${selectedOrder.donHangId}/trangthai`, {
        trangThai: selectedStatus,
      });
      message.success("Cập nhật trạng thái đơn hàng thành công");
      setUpdateModal(false);
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case "ChoXuLy":
        return <Tag color="orange">Chờ xử lý</Tag>;
      case "DangGiao":
        return <Tag color="blue">Đang giao</Tag>;
      case "HoanTat":
        return <Tag color="green">Hoàn tất</Tag>;
      case "Huy":
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "maDonHang",
      key: "maDonHang",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Khách hàng",
      dataIndex: ["khachHang", "tenDangNhap"],
      key: "khachHang",
      render: (val, record) =>
        record.khachHang?.hoTen || record.khachHang?.email || "—",
    },
    {
      title: "Tổng tiền",
      dataIndex: "tongTien",
      key: "tongTien",
      render: (val) => `${val?.toLocaleString()} ₫`,
    },
    {
      title: "Ngày tạo",
      dataIndex: "ngayDat",
      key: "ngayDat",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (val) => renderStatus(val),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            type="default"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setSelectedStatus(record.trangThai);
              setUpdateModal(true);
            }}
            type="primary"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h2>Quản lý đơn hàng</h2>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchOrders}
          type="default"
        >
          Làm mới
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="donHangId"
        loading={loading}
        bordered
      />

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title="Chi tiết đơn hàng"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={850}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã đơn hàng">
                {selectedOrder.maDonHang}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {dayjs(selectedOrder.ngayDat).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.khachHang?.hoTen}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.khachHang?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={2}>
                {selectedOrder.khachHang?.soDienThoai}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {selectedOrder.diaChiGiaoHang}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {selectedOrder.tongTien?.toLocaleString()} ₫
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {renderStatus(selectedOrder.trangThai)}
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: 20 }}>Danh sách sản phẩm</h3>
            <Table
              dataSource={selectedOrder.chiTietDonHang || []}
              columns={[
                { title: "Sản phẩm", dataIndex: ["sanPham", "tenSanPham"] },
                { title: "Số lượng", dataIndex: "soLuong" },
                {
                  title: "Đơn giá",
                  dataIndex: "donGia",
                  render: (val) => `${val.toLocaleString()} ₫`,
                },
                {
                  title: "Thành tiền",
                  render: (_, r) =>
                    `${(r.soLuong * r.donGia).toLocaleString()} ₫`,
                },
              ]}
              pagination={false}
              rowKey="chiTietDonHangId"
              size="small"
              bordered
            />
          </>
        )}
      </Modal>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={updateModal}
        onCancel={() => setUpdateModal(false)}
        onOk={handleUpdateStatus}
        okText="Lưu"
        cancelText="Hủy"
      >
        <p>Mã đơn hàng: <b>{selectedOrder?.maDonHang}</b></p>
        <Select
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ width: "100%" }}
        >
          <Select.Option value="ChoXuLy">Chờ xử lý</Select.Option>
          <Select.Option value="DangGiao">Đang giao</Select.Option>
          <Select.Option value="HoanTat">Hoàn tất</Select.Option>
          <Select.Option value="Huy">Hủy</Select.Option>
        </Select>

        <Steps
          size="small"
          current={
            ["ChoXuLy", "DangGiao", "HoanTat", "Huy"].indexOf(selectedStatus)
          }
          style={{ marginTop: 20 }}
          items={[
            { title: "Chờ xử lý" },
            { title: "Đang giao" },
            { title: "Hoàn tất" },
            { title: "Hủy" },
          ]}
        />
      </Modal>
    </div>
  );
}
