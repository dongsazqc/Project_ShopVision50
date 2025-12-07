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

export default function Origin() {
    const [messageApi, contextHolder] = message.useMessage();
    const [origins, setOrigins] = useState([]);
    const [allOrigins, setAllOrigins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedOrigin, setSelectedOrigin] = useState(null);

    const [formAdd] = Form.useForm();
    const [formEdit] = Form.useForm();

    // ================= LẤY TẤT CẢ ORIGIN =================
    const fetchOrigins = async () => {
        try {
            setLoading(true);
            const res = await api.get("/Origin/GetAll");
            const list = res.data?.$values || res.data || [];
            setOrigins(list);
            setAllOrigins(list);
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể tải danh sách xuất xứ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrigins();
    }, []);

    // ================= TÌM KIẾM ORIGIN =================
    const handleSearch = (value) => {
        if (!value.trim()) {
            setOrigins(allOrigins);
        } else {
            setOrigins(
                allOrigins.filter((o) =>
                    (o.country || "")
                        .toLowerCase()
                        .includes(value.toLowerCase())
                )
            );
        }
    };

    // ================= THÊM ORIGIN =================
    const handleAdd = async (values) => {
        try {
            setSaving(true);
            const country = values.country.trim();
            const exists = allOrigins.some(
                (o) =>
                    (o.country || "").trim().toLowerCase() ===
                    country.toLowerCase()
            );
            if (exists) {
                messageApi.warning("Tên nước đã tồn tại!");
                return;
            }

            await api.post("/Origin", { country });
            messageApi.success("Thêm xuất xứ thành công!");
            setAddModalOpen(false);
            formAdd.resetFields();
            fetchOrigins();
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể thêm xuất xứ");
        } finally {
            setSaving(false);
        }
    };

    // ================= MỞ MODAL CHỈNH SỬA =================
    const openEditModal = async (record) => {
        try {
            const res = await api.get(`/Origin/${record.originId}`);
            const origin = res.data;
            setSelectedOrigin(origin);
            formEdit.setFieldsValue({ country: origin.country });
            setEditModalOpen(true);
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể tải thông tin xuất xứ");
        }
    };

    // ================= CẬP NHẬT ORIGIN =================
    const handleUpdate = async (values) => {
        try {
            setSaving(true);
            const country = values.country.trim();
            const exists = allOrigins.some(
                (o) =>
                    (o.country || "").trim().toLowerCase() ===
                        country.toLowerCase() &&
                    o.originId !== selectedOrigin.originId
            );
            if (exists) {
                messageApi.warning("Tên nước đã tồn tại!");
                return;
            }

            await api.put(`/Origin/${selectedOrigin.originId}`, {
                originId: selectedOrigin.originId,
                country,
            });

            messageApi.success("Cập nhật xuất xứ thành công!");
            setEditModalOpen(false);
            setSelectedOrigin(null);
            fetchOrigins();
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể cập nhật xuất xứ");
        } finally {
            setSaving(false);
        }
    };

    // ================= XÓA ORIGIN =================
    const handleDelete = async (id) => {
        try {
            await api.delete(`/Origin/${id}`);
            messageApi.success("Xóa xuất xứ thành công!");
            fetchOrigins();
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể xóa xuất xứ");
        }
    };

    // ================= CỘT HIỂN THỊ =================
    const columns = [
        {
            title: "ID",
            dataIndex: "originId",
            key: "originId",
            width: 80,
            sorter: (a, b) => a.originId - b.originId,
            defaultSortOrder: "descend",
        },
        {
            title: "Tên nước",
            dataIndex: "country",
            key: "country",
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
            title: "Hành động",
            key: "action",
            width: 120,
            render: (_, record) => (
                <Popconfirm
                    title={`Xóa xuất xứ "${record.country}"?`}
                    onConfirm={() => handleDelete(record.originId)}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
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
                    placeholder="Tìm theo tên nước..."
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
                    Thêm xuất xứ
                </Button>
            </Space>

            <Table
                dataSource={[...origins].sort(
                    (a, b) => b.originId - a.originId
                )}
                columns={columns}
                loading={loading}
                rowKey="originId"
                bordered
                pagination={{ pageSize: 15 }}
            />

            {/* Modal thêm mới */}
            <Modal
                title="Thêm xuất xứ mới"
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
                        label="Tên nước"
                        name="country"
                        rules={[
                            { required: true, message: "Nhập tên nước" },
                            {
                                validator: (_, value) => {
                                    if (!value || !value.trim())
                                        return Promise.reject(
                                            "Tên nước không được chỉ chứa khoảng trắng"
                                        );
                                    const name = value.trim().toLowerCase();
                                    if (
                                        allOrigins.some(
                                            (o) =>
                                                (o.country || "")
                                                    .trim()
                                                    .toLowerCase() === name
                                        )
                                    ) {
                                        return Promise.reject(
                                            "Tên nước đã tồn tại"
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input placeholder="VD: Việt Nam, Hàn Quốc, Mỹ..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chỉnh sửa */}
            <Modal
                title="Cập nhật xuất xứ"
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
                    preserve={false}
                >
                    <Form.Item
                        label="Tên nước"
                        name="country"
                        rules={[
                            { required: true, message: "Nhập tên nước" },
                            {
                                validator: (_, value) => {
                                    if (!value || !value.trim())
                                        return Promise.reject(
                                            "Tên nước không được chỉ chứa khoảng trắng"
                                        );
                                    const name = value.trim().toLowerCase();
                                    if (
                                        allOrigins.some(
                                            (o) =>
                                                (o.country || "")
                                                    .trim()
                                                    .toLowerCase() === name &&
                                                o.originId !==
                                                    selectedOrigin?.originId
                                        )
                                    ) {
                                        return Promise.reject(
                                            "Tên nước đã tồn tại"
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
