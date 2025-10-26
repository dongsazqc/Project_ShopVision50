// src/pages/Promotions.jsx
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Tag,
  message,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import api from "../utils/axios";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [form] = Form.useForm();
  const [detailModal, setDetailModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // 📦 Lấy danh sách khuyến mãi
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      // TODO: ⚙️ API thật: GET /api/khuyenmai (include SanPham nếu cần)
      const res = await api.get("/khuyenmai");
      const data = (res.data || []).map((km) => ({
        ...km,
        trangThai: dayjs().isBefore(dayjs(km.ngayKetThuc)), // true nếu chưa hết hạn
      }));
      setPromotions(data);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // 💾 Thêm / Sửa khuyến mãi
  const handleSave = async (values) => {
    try {
      const [start, end] = values.dateRange;
      const body = {
        tenChuongTrinh: values.tenChuongTrinh,
        moTa: values.moTa,
        phanTramGiam: values.phanTramGiam,
        ngayBatDau: start,
        ngayKetThuc: end,
      };

      if (editingPromo) {
        // TODO: ⚙️ API thật: PUT /api/khuyenmai/:id
        await api.put(`/khuyenmai/${editingPromo.khuyenMaiId}`, body);
        message.success("Cập nhật khuyến mãi thành công");
      } else {
        // TODO: ⚙️ API thật: POST /api/khuyenmai
        await api.post("/khuyenmai", body);
        message.success("Thêm khuyến mãi thành công");
      }

      setOpenModal(false);
      form.resetFields();
      fetchPromotions();
    } catch (err) {
      console.error(err);
      message.error("Lưu khuyến mãi thất bại");
    }
  };

  // 👁️ Xem chi tiết khuyến mãi
  const handleView = async (record) => {
    try {
      // TODO: ⚙️ API thật: GET /api/khuyenmai/:id (include SanPham)
      const res = await api.get(`/khuyenmai/${record.khuyenMaiId}`);
      setSelectedPromo(res.data);
      setDetailModal(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải chi tiết khuyến mãi");
    }
  };

  const columns = [
    {
      title: "Tên chương trình",
      dataIndex: "tenChuongTrinh",
      key: "tenChuongTrinh",
      render: (text) => (
        <Space>
          <GiftOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "% Giảm",
      dataIndex: "phanTramGiam",
      key: "phanTramGiam",
      render: (val) => `${val}%`,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "ngayBatDau",
      render: (val) => dayjs(val).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "ngayKetThuc",
      render: (val) => dayjs(val).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      key: "trangThai",
      render: (_, record) =>
        dayjs().isBefore(dayjs(record.ngayKetThuc)) ? (
          <Tag color="green">Đang áp dụng</Tag>
        ) : (
          <Tag color="volcano">Hết hạn</Tag>
        ),
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
              setEditingPromo(record);
              form.setFieldsValue({
                tenChuongTrinh: record.tenChuongTrinh,
                moTa: record.moTa,
                phanTramGiam: record.phanTramGiam,
                dateRange: [
                  dayjs(record.ngayBatDau),
                  dayjs(record.ngayKetThuc),
                ],
              });
              setOpenModal(true);
            }}
            type="primary"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Thanh công cụ */}
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input.Search
          placeholder="Tìm khuyến mãi..."
          onSearch={(value) =>
            setPromotions((prev) =>
              prev.filter((p) =>
                p.tenChuongTrinh.toLowerCase().includes(value.toLowerCase())
              )
            )
          }
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingPromo(null);
            form.resetFields();
            setOpenModal(true);
          }}
        >
          Thêm khuyến mãi
        </Button>
      </Space>

      {/* Bảng khuyến mãi */}
      <Table
        dataSource={promotions}
        columns={columns}
        rowKey="khuyenMaiId"
        loading={loading}
        bordered
      />

      {/* Modal thêm/sửa */}
      <Modal
        title={editingPromo ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Tên chương trình"
            name="tenChuongTrinh"
            rules={[{ required: true, message: "Nhập tên chương trình" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả" name="moTa">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Phần trăm giảm"
            name="phanTramGiam"
            rules={[{ required: true, message: "Nhập phần trăm giảm giá" }]}
          >
            <InputNumber min={1} max={100} addonAfter="%" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Thời gian áp dụng"
            name="dateRange"
            rules={[{ required: true, message: "Chọn thời gian khuyến mãi" }]}
          >
            <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết */}
      <Modal
        open={detailModal}
        title="Chi tiết khuyến mãi"
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={800}
      >
        {selectedPromo && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin" key="1">
              <p><b>Tên:</b> {selectedPromo.tenChuongTrinh}</p>
              <p><b>Mô tả:</b> {selectedPromo.moTa || "Không có"}</p>
              <p><b>Giảm giá:</b> {selectedPromo.phanTramGiam}%</p>
              <p><b>Thời gian:</b> {dayjs(selectedPromo.ngayBatDau).format("DD/MM/YYYY")} → {dayjs(selectedPromo.ngayKetThuc).format("DD/MM/YYYY")}</p>
              <p>
                <b>Trạng thái:</b>{" "}
                {dayjs().isBefore(dayjs(selectedPromo.ngayKetThuc)) ? (
                  <Tag color="green">Đang áp dụng</Tag>
                ) : (
                  <Tag color="volcano">Hết hạn</Tag>
                )}
              </p>
            </TabPane>

            <TabPane tab="Sản phẩm áp dụng" key="2">
              <Table
                dataSource={selectedPromo.sanPham || []}
                columns={[
                  { title: "Tên sản phẩm", dataIndex: "tenSanPham" },
                  {
                    title: "Giá gốc",
                    dataIndex: "giaGoc",
                    render: (val) => `${val?.toLocaleString()} ₫`,
                  },
                  { title: "Danh mục", dataIndex: "tenDanhMuc" },
                ]}
                pagination={false}
                rowKey="sanPhamId"
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
}
