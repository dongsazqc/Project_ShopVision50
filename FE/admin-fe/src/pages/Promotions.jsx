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
} from "antd";
import { PlusOutlined, GiftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import api from "../utils/axios";

const { RangePicker } = DatePicker;

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // ================= Lấy danh sách khuyến mãi =================
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/KhuyenMai/GetAllPromotions");
      const data = res.data?.$values || res.data || [];
      const formatted = data.map((p) => ({
        ...p,
        trangThai: dayjs().isBefore(dayjs(p.endDate)),
      }));
      setPromotions(formatted);
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

  // ================= Thêm / Cập nhật =================
  const handleSave = async (values) => {
    try {
      const [start, end] = values.dateRange;

      // Validate ngày bắt đầu < ngày kết thúc
      if (start.isAfter(end)) {
        message.warning("Ngày bắt đầu không được sau ngày kết thúc!");
        return;
      }

      const payload = {
        promotionId: selectedPromo?.promotionId || 0,
        code: values.code.trim(),
        discountType: "Percent",
        discountValue: values.discountValue,
        condition: values.condition,
        scope: values.scope,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        status: true,
      };

      if (selectedPromo) {
        await api.put(
          `/KhuyenMai/UpdatePromotion/${selectedPromo.promotionId}`,
          payload
        );
        message.success("Cập nhật khuyến mãi thành công");
      } else {
        await api.post("/KhuyenMai/CreatePromotion", payload);
        message.success("Tạo khuyến mãi thành công");
      }

      setOpenModal(false);
      form.resetFields();
      setSelectedPromo(null);
      fetchPromotions();
    } catch (err) {
      console.error("Error saving promotion:", err);
      message.error("Lưu khuyến mãi thất bại");
    }
  };

  // ================= Xem chi tiết / chỉnh sửa =================
  const openDetailModal = async (record) => {
    try {
      const res = await api.get(
        `/KhuyenMai/GetPromotionById/${record.promotionId}`
      );
      const promo = res.data;
      setSelectedPromo(promo);
      form.setFieldsValue({
        code: promo.code,
        discountValue: promo.discountValue,
        condition: promo.condition,
        scope: promo.scope,
        dateRange: [dayjs(promo.startDate), dayjs(promo.endDate)],
      });
      setOpenModal(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải chi tiết khuyến mãi");
    }
  };

  // ================= Cấu hình cột =================
  const columns = [
    {
      title: "ID",
      dataIndex: "promotionId",
      key: "promotionId",
      width: 80,
      align: "center",
    },
    {
      title: "Mã khuyến mãi",
      dataIndex: "code",
      key: "code",
      render: (text, record) => (
        <span
          style={{
            color: "#1677ff",
            cursor: "pointer",
            textDecoration: "none",
          }}
          onClick={() => openDetailModal(record)}
        >
          <GiftOutlined style={{ marginRight: 4 }} />
          {text}
        </span>
      ),
    },
    {
      title: "% Giảm",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (val) => `${val}%`,
    },
    {
      title: "Điều kiện",
      dataIndex: "condition",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      render: (val) => dayjs(val).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      render: (val) => dayjs(val).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (val, record) =>
        dayjs().isBefore(dayjs(record.endDate)) ? (
          <Tag color="green">Đang áp dụng</Tag>
        ) : (
          <Tag color="volcano">Hết hạn</Tag>
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
        <Input.Search
          placeholder="Tìm mã khuyến mãi..."
          onSearch={(value) =>
            setPromotions((prev) =>
              prev.filter((p) =>
                p.code.toLowerCase().includes(value.toLowerCase())
              )
            )
          }
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setSelectedPromo(null);
            setOpenModal(true);
          }}
        >
          Thêm khuyến mãi
        </Button>
      </Space>

      <Table
        dataSource={promotions}
        columns={columns}
        rowKey="promotionId"
        loading={loading}
        bordered
      />

      {/* Modal chi tiết + chỉnh sửa */}
      <Modal
        title={
          selectedPromo
            ? "Chi tiết & chỉnh sửa khuyến mãi"
            : "Thêm khuyến mãi mới"
        }
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          setSelectedPromo(null);
        }}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Mã khuyến mãi"
            name="code"
            rules={[{ required: true, message: "Nhập mã khuyến mãi" }]}
          >
            <Input disabled={!!selectedPromo} />
          </Form.Item>

          <Form.Item
            label="Giá trị giảm (%)"
            name="discountValue"
            rules={[{ required: true, message: "Nhập phần trăm giảm" }]}
          >
            <InputNumber
              min={1}
              max={100}
              addonAfter="%"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="Điều kiện" name="condition">
            <Input placeholder="VD: Đơn hàng từ 500000 VND" />
          </Form.Item>

          <Form.Item label="Phạm vi áp dụng" name="scope">
            <Input placeholder="VD: Tất cả sản phẩm" />
          </Form.Item>

          <Form.Item
            label="Thời gian áp dụng"
            name="dateRange"
            rules={[{ required: true, message: "Chọn thời gian áp dụng" }]}
          >
            <RangePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
