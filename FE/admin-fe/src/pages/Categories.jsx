import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    FolderOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../utils/axios";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [formAdd] = Form.useForm();
    const [formEdit] = Form.useForm();

    // ================= LẤY DANH MỤC =================
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get("/Category/GetAll");
            const list = (res.data?.$values || res.data || []).sort(
                (a, b) => b.categoryId - a.categoryId
            );
            setCategories(list);
            setAllCategories(list);
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể tải danh sách danh mục");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ================= TÌM KIẾM =================
    const handleSearch = (value) => {
        if (!value.trim()) {
            setCategories(allCategories);
        } else {
            setCategories(
                allCategories.filter((c) =>
                    (c.name || "").toLowerCase().includes(value.toLowerCase())
                )
            );
        }
    };

    // ================= THÊM DANH MỤC =================
    const handleAdd = async (values) => {
        try {
            setSaving(true);
            const name = values.name.trim();

            const exists = allCategories.some(
                (c) =>
                    (c.name || "").trim().toLowerCase() === name.toLowerCase()
            );
            if (exists) {
                messageApi.warning("Tên danh mục đã tồn tại!");
                return;
            }

            await api.post("/Category", {
                name,
                description: values.description,
            });
            messageApi.success("Thêm danh mục thành công!");
            setAddModalOpen(false);
            formAdd.resetFields();
            fetchCategories();
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể thêm danh mục");
        } finally {
            setSaving(false);
        }
    };

    // ================= MỞ MODAL CHỈNH SỬA =================
    const openEditModal = async (record) => {
        try {
            const res = await api.get(`/Category/${record.categoryId}`);
            const cat = res.data;
            setSelectedCategory(cat);
            console.log("check", cat);
            formEdit.setFieldsValue({
                name: cat.name,
                description: cat.description,
            });
            setEditModalOpen(true);
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể tải chi tiết danh mục");
        }
    };
    console.log(formEdit.getFieldsValue());

    // ================= CẬP NHẬT DANH MỤC =================
    const handleUpdate = async (values) => {
        try {
            setSaving(true);
            const name = values.name.trim();

            const exists = allCategories.some(
                (c) =>
                    (c.name || "").trim().toLowerCase() ===
                        name.toLowerCase() &&
                    c.categoryId !== selectedCategory.categoryId
            );
            if (exists) {
                messageApi.warning("Tên danh mục đã tồn tại!");
                return;
            }

            const payload = {
                categoryId: selectedCategory.categoryId,
                name,
                description: values.description,
            };

            await api.put(
                `/Category/Update/${selectedCategory.categoryId}`,
                payload
            );
            messageApi.success("Cập nhật danh mục thành công!");
            setEditModalOpen(false);
            setSelectedCategory(null);
            fetchCategories();
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể cập nhật danh mục");
        } finally {
            setSaving(false);
        }
    };

    // ================= XÓA DANH MỤC =================
    const handleDelete = async (id) => {
        try {
            // Kiểm tra danh mục có sản phẩm không
            const res = await api.get(`/Category/${id}`);
            const hasProducts = res.data?.products?.$values?.length > 0;
            if (hasProducts) {
                messageApi.warning(
                    "Không thể xóa vì danh mục này vẫn còn sản phẩm."
                );
                return;
            }

            await api.delete(`/Category/${id}`);
            messageApi.success("Xóa danh mục thành công!");
            fetchCategories();
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể xóa danh mục");
        }
    };

    // ================= CỘT TRONG BẢNG =================
    const columns = [
        {
            title: "ID",
            dataIndex: "categoryId",
            key: "categoryId",
            width: 80,
        },
        {
            title: "Tên danh mục",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <span
                    style={{
                        color: "#1677ff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                    }}
                    onClick={() => openEditModal(record)}
                >
                    <FolderOutlined style={{ marginRight: 6 }} />
                    {text}
                </span>
            ),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            render: (text, record) => (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>{text || "—"}</span>
                    <Popconfirm
                        title={`Xóa danh mục "${record.name}"?`}
                        onConfirm={() => handleDelete(record.categoryId)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            style={{ marginLeft: 8 }}
                        />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            {contextHolder}
            <Space
                style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Input.Search
                    placeholder="Tìm theo tên danh mục"
                    onSearch={handleSearch}
                    allowClear
                    style={{ width: 300 }}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        formAdd.resetFields();
                        setAddModalOpen(true);
                    }}
                >
                    Thêm danh mục
                </Button>
            </Space>

            <Table
                dataSource={categories}
                columns={columns}
                loading={loading}
                rowKey="categoryId"
                bordered
                pagination={{ pageSize: 15 }}
            />

            {/* Modal thêm mới */}
            <Modal
                title="Thêm danh mục mới"
                open={addModalOpen}
                onCancel={() => setAddModalOpen(false)}
                onOk={() => formAdd.submit()}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={saving}
            >
                <Form
                    layout="vertical"
                    form={formAdd}
                    onFinish={handleAdd}
                    preserve={false}
                >
                    <Form.Item
                        label="Tên danh mục"
                        name="name"
                        rules={[
                            { required: true, message: "Nhập tên danh mục" },
                            {
                                validator: (_, value) => {
                                    if (!value || !value.trim()) {
                                        return Promise.reject(
                                            "Tên danh mục không được chỉ chứa khoảng trắng"
                                        );
                                    }
                                    const name = value.trim().toLowerCase();
                                    const exists = allCategories.some(
                                        (c) =>
                                            (c.name || "")
                                                .trim()
                                                .toLowerCase() === name
                                    );
                                    if (exists) {
                                        return Promise.reject(
                                            "Tên danh mục đã tồn tại"
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input placeholder="VD: Áo phông, Unisex..." />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea
                            rows={3}
                            placeholder="Mô tả danh mục (tùy chọn)"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal cập nhật */}
            <Modal
                title="Cập nhật danh mục"
                open={editModalOpen}
                onCancel={() => setEditModalOpen(false)}
                onOk={() => formEdit.submit()}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={saving}
            >
                <Form
                    layout="vertical"
                    form={formEdit}
                    onFinish={handleUpdate}
                    // preserve={false}
                >
                    <Form.Item
                        label="Tên danh mục"
                        name="name"
                        rules={[
                            { required: true, message: "Nhập tên danh mục" },
                            {
                                validator: (_, value) => {
                                    if (!value || !value.trim()) {
                                        return Promise.reject(
                                            "Tên danh mục không được chỉ chứa khoảng trắng"
                                        );
                                    }
                                    const name = value.trim().toLowerCase();
                                    const exists = allCategories.some(
                                        (c) =>
                                            (c.name || "")
                                                .trim()
                                                .toLowerCase() === name &&
                                            c.categoryId !==
                                                selectedCategory?.categoryId
                                    );
                                    if (exists) {
                                        return Promise.reject(
                                            "Tên danh mục đã tồn tại"
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}