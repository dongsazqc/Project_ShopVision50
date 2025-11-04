// src/pages/Categories.jsx
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    message,
    Tabs,
    Tag,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    EyeOutlined,
    FolderOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import api from "../utils/axios";

const { TabPane } = Tabs;

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [detailModal, setDetailModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
    const [idDelete, setIdDelete] = useState(null);

    const [form] = Form.useForm();

    // 📦 Lấy danh sách danh mục
    const fetchCategories = async () => {
        try {
            setLoading(true);
            // TODO: ⚙️ API thật: GET /api/danhmuc (include SanPham nếu cần)
            const res = await api.get("/Category/GetAll");
            const dataBuilder = (res?.data?.$values || []).map((item) => ({
                ...item,
                productTotal: item?.products?.$values?.length || 0,
            }));
            setCategories(dataBuilder);
        } catch (err) {
            console.error(err);
            message.error("Không thể tải danh sách danh mục");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 💾 Thêm / Sửa danh mục
    const handleSave = async (values) => {
        try {
            console.log("Form values:", values);
            if (editingCategory) {
                // TODO: ⚙️ API thật: PUT /api/danhmuc/:id
                await api.put(
                    `/Category/Update/${editingCategory.categoryId}`,
                    {
                        ...values,
                        categoryId: editingCategory.categoryId,
                    }
                );
                message.success("Cập nhật danh mục thành công");
            } else {
                // TODO: ⚙️ API thật: POST /api/danhmuc
                await api.post("/Category", values);
                message.success("Thêm danh mục thành công");
            }
            fetchCategories();
            setOpenModal(false);
            form.resetFields();
        } catch (err) {
            console.error(err);
            message.error("Lưu danh mục thất bại");
        }
    };

    // 👁️ Xem chi tiết danh mục (và danh sách sản phẩm)
    const handleView = async (record) => {
        console.log(record);
        try {
            // TODO: ⚙️ API thật: GET /api/danhmuc/:id (include SanPham)
            // const res = await api.get(`/danhmuc/${record.danhMucId}`);
            setSelectedCategory(record);
            setDetailModal(true);
        } catch (err) {
            console.error(err);
            message.error("Không thể tải chi tiết danh mục");
        }
    };

    const handleDelete = useCallback(async () => {
        if (!idDelete) return;
        try {
            await api.delete(`/Category/${idDelete}`);
            message.success("Xóa danh mục thành công");
            setIsModalConfirmOpen(false);
            setIdDelete(null);
            fetchCategories();
        } catch (err) {
            console.error(err);
            message.error("Xóa danh mục thất bại");
        }
    }, [idDelete]);

    const columns = [
        {
            title: "Tên danh mục",
            dataIndex: "name",
            key: "name",
            render: (text) => (
                <Space>
                    <FolderOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            render: (text) => text || "—",
        },
        {
            title: "Số lượng sản phẩm",
            dataIndex: "productTotal",
            key: "productTotal",
            render: (value) => <Tag color="blue">{value}</Tag>,
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
                            setEditingCategory(record);
                            form.setFieldsValue(record);
                            setOpenModal(true);
                        }}
                        type="primary"
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            setIdDelete(record.categoryId);
                            setIsModalConfirmOpen(true);
                        }}
                        type="default"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Thanh chức năng */}
            <Space
                style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Input.Search
                    placeholder="Tìm danh mục..."
                    onSearch={(value) =>
                        setCategories((prev) =>
                            prev.filter((c) =>
                                c.tenDanhMuc
                                    .toLowerCase()
                                    .includes(value.toLowerCase())
                            )
                        )
                    }
                    style={{ width: 300 }}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingCategory(null);
                        setOpenModal(true);
                    }}
                >
                    Thêm danh mục
                </Button>
            </Space>

            {/* Bảng danh mục */}
            <Table
                dataSource={categories}
                columns={columns}
                loading={loading}
                rowKey="danhMucId"
                bordered
            />

            {/* Modal thêm / sửa */}
            <Modal
                title={
                    editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"
                }
                open={openModal}
                onCancel={() => setOpenModal(false)}
                onOk={() => form.submit()}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form layout="vertical" form={form} onFinish={handleSave}>
                    <Form.Item
                        label="Tên danh mục"
                        name="name"
                        rules={[
                            { required: true, message: "Nhập tên danh mục" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chi tiết danh mục */}
            <Modal
                open={detailModal}
                title="Chi tiết danh mục"
                onCancel={() => setDetailModal(false)}
                footer={null}
                width={800}
            >
                {selectedCategory && (
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Thông tin" key="1">
                            <p>
                                <b>Tên danh mục:</b> {selectedCategory.name}
                            </p>
                            <p>
                                <b>Mô tả:</b>{" "}
                                {selectedCategory.description || "Không có"}
                            </p>
                            <p>
                                <b>Số lượng sản phẩm:</b>{" "}
                                {selectedCategory.productTotal || 0}
                            </p>
                        </TabPane>

                        <TabPane tab="Danh sách sản phẩm" key="2">
                            <Table
                                dataSource={
                                    selectedCategory?.products?.$values || []
                                }
                                columns={[
                                    {
                                        title: "Tên sản phẩm",
                                        dataIndex: "name",
                                        render: (text) => (
                                            <Space>
                                                <FolderOutlined />
                                                {text}
                                            </Space>
                                        ),
                                    },
                                    {
                                        title: "Giá gốc",
                                        dataIndex: "price",
                                        render: (val) =>
                                            `${val?.toLocaleString()} ₫`,
                                    },
                                    {
                                        title: "Thương hiệu",
                                        dataIndex: "brand",
                                    },
                                    {
                                        title: "Trạng thái",
                                        dataIndex: "status",
                                        render: (val) => (
                                            <Tag
                                                color={
                                                    val ? "green" : "volcano"
                                                }
                                            >
                                                {val ? "Đang bán" : "Ngừng bán"}
                                            </Tag>
                                        ),
                                    },
                                ]}
                                pagination={false}
                                rowKey="sanPhamId"
                            />
                        </TabPane>
                    </Tabs>
                )}
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal
                title="Basic Modal"
                open={isModalConfirmOpen}
                onOk={handleDelete}
                onCancel={() => setIsModalConfirmOpen(false)}
            >
                <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
            </Modal>
        </div>
    );
}
