import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Tag,
  Row,
  Col,
} from "antd";
import { PlusOutlined, SaveOutlined, SearchOutlined } from "@ant-design/icons";
import api from "../utils/axios";

const { Option } = Select;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchName, setSearchName] = useState("");

  const [form] = Form.useForm();

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/Products/getAllProducts");
      const list = res.data?.$values || res.data || [];
      setProducts(list);
      setFilteredProducts(list);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH CATEGORIES =================
  const fetchCategories = async () => {
    try {
      const res = await api.get("/Category/GetAll");
      const list = res.data?.$values || res.data || [];
      setCategories(list);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
      message.error("Không thể tải danh mục");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ================= FILTER BY CATEGORY =================
  useEffect(() => {
    if (!filterCategory) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (p) => p.categoryId === filterCategory
      );
      setFilteredProducts(filtered);
    }
  }, [filterCategory, products]);

  // ================= SEARCH BY NAME =================
  const searchByName = async () => {
    if (!searchName.trim()) {
      fetchProducts();
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(
        `/Products/getProductsByName/${encodeURIComponent(searchName)}`
      );
      const list = res.data?.$values || res.data || [];
      setFilteredProducts(list);
      if (list.length === 0) message.info("Không tìm thấy sản phẩm phù hợp");
    } catch (err) {
      console.error("Lỗi tìm sản phẩm:", err);
      message.error("Không thể tìm sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // ================= OPEN MODAL =================
  const openAddModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingProduct(record);
    form.setFieldsValue({
      name: record.name,
      price: record.price,
      description: record.description,
      brand: record.brand,
      warranty: record.warranty,
      status: record.status,
      categoryId: record.categoryId,
    });
    setModalOpen(true);
  };

  // ================= ADD / UPDATE PRODUCT =================
  const handleSubmit = async (values) => {
    try {
      const payload = {
        Name: values.name,
        Price: values.price,
        Description: values.description,
        Brand: values.brand,
        Warranty: values.warranty,
        Status: values.status,
        CategoryId: values.categoryId,
      };

      if (editingProduct) {
        await api.put(`/Products/update/${editingProduct.productId}`, payload);
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        await api.post("/Products/addProduct", payload);
        message.success("Thêm sản phẩm thành công!");
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi thêm/cập nhật:", err.response?.data || err.message);
      message.error(err.response?.data || "Không thể lưu sản phẩm");
    }
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    { title: "ID", dataIndex: "productId", width: 60 },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      render: (text, record) => (
        <span
          style={{ color: "#1677ff", cursor: "pointer" }}
          onClick={() => openEditModal(record)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (v) => v?.toLocaleString("vi-VN") + " ₫",
    },
    { title: "Thương hiệu", dataIndex: "brand" },
    { title: "Bảo hành", dataIndex: "warranty" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (v) =>
        v ? <Tag color="green">Còn hàng</Tag> : <Tag color="red">Hết hàng</Tag>,
    },
    {
      title: "Danh mục",
      dataIndex: "categoryId",
      render: (id) => {
        const cat = categories.find((c) => c.categoryId === id);
        return cat ? cat.name : "—";
      },
    },
  ];

  // ================= RENDER =================
  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Quản lý sản phẩm</h2>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="Nhập tên sản phẩm..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onPressEnter={searchByName}
          />
        </Col>
        <Col>
          <Button
            icon={<SearchOutlined />}
            onClick={searchByName}
          >
            Tìm
          </Button>
        </Col>
        <Col span={6}>
          <Select
            allowClear
            placeholder="Lọc theo danh mục"
            style={{ width: "100%" }}
            value={filterCategory}
            onChange={setFilterCategory}
          >
            {categories.map((c) => (
              <Option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col flex="auto" style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddModal}
          >
            Thêm sản phẩm
          </Button>
        </Col>
      </Row>

      <Table
        rowKey="productId"
        dataSource={filteredProducts}
        columns={columns}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
      />

      {/* ================= MODAL ================= */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        footer={[
          <Button onClick={() => setModalOpen(false)}>Hủy</Button>,
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="brand" label="Thương hiệu">
            <Input />
          </Form.Item>
          <Form.Item name="warranty" label="Bảo hành">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value={true}>Còn hàng</Option>
              <Option value={false}>Hết hàng</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((c) => (
                <Option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
