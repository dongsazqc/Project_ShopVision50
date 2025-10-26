import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  theme,
  Input,
} from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  UserOutlined,
  BarChartOutlined,
  ShopOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const siderWidth = collapsed ? 80 : 230;

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // ====== Hồ sơ (dropdown) ======
  const profileMenu = {
    items: [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        onClick: () => console.log("Đăng xuất"),
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ===== SIDEBAR ===== */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={230}
        style={{
          background: "#001529",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
          overflow: "auto",
          transition: "all 0.3s ease",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            color: "#fff",
            textAlign: "center",
            padding: "24px 12px",
            fontSize: "1.3rem",
            fontWeight: "bold",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            letterSpacing: 0.5,
          }}
        >
          {collapsed ? "SW" : "StyleWear Admin"}
        </div>

        {/* MENU */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["product-management"]}
          style={{ marginTop: 10 }}
        >
          {/* ====== BẢNG ĐIỀU KHIỂN ====== */}
          <Menu.Item key="/admin/dashboard" icon={<DashboardOutlined />}>
            <Link to="/admin/dashboard">Bảng điều khiển</Link>
          </Menu.Item>

          {/* ====== QUẢN LÝ SẢN PHẨM ====== */}
          <Menu.SubMenu
            key="product-management"
            icon={<ShoppingOutlined />}
            title="Quản lý sản phẩm"
          >
            <Menu.Item key="/admin/products">
              <Link to="/admin/products">Sản phẩm</Link>
            </Menu.Item>
            <Menu.Item key="/admin/categories">
              <Link to="/admin/categories">Danh mục</Link>
            </Menu.Item>
          </Menu.SubMenu>

          {/* ====== ĐƠN HÀNG ====== */}
          <Menu.Item key="/admin/orders" icon={<ShoppingCartOutlined />}>
            <Link to="/admin/orders">Đơn hàng</Link>
          </Menu.Item>

          {/* ====== KHO HÀNG ====== */}
          <Menu.Item key="/admin/inventory" icon={<DatabaseOutlined />}>
            <Link to="/admin/inventory">Kho hàng</Link>
          </Menu.Item>

          {/* ====== KHUYẾN MÃI ====== */}
          <Menu.Item key="/admin/promotions" icon={<TagsOutlined />}>
            <Link to="/admin/promotions">Khuyến mãi</Link>
          </Menu.Item>

          {/* ====== NGƯỜI DÙNG ====== */}
          <Menu.Item key="/admin/users" icon={<UserOutlined />}>
            <Link to="/admin/users">Người dùng</Link>
          </Menu.Item>

          {/* ====== BÁO CÁO ====== */}
          <Menu.Item key="/admin/reports" icon={<BarChartOutlined />}>
            <Link to="/admin/reports">Báo cáo</Link>
          </Menu.Item>

          {/* ====== POS ====== */}
          <Menu.Item key="/admin/pos" icon={<ShopOutlined />}>
            <Link to="/admin/pos">Bán hàng tại quầy (POS)</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      {/* ===== MAIN ===== */}
      <Layout
        style={{
          marginLeft: siderWidth,
          minHeight: "100vh",
          background: "#f5f6fa",
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* HEADER */}
        <Header
          style={{
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
            height: 64,
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* TRÁI: Toggle + Tiêu đề */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {collapsed ? (
              <MenuUnfoldOutlined
                onClick={() => setCollapsed(false)}
                style={{ fontSize: 20, cursor: "pointer" }}
              />
            ) : (
              <MenuFoldOutlined
                onClick={() => setCollapsed(true)}
                style={{ fontSize: 20, cursor: "pointer" }}
              />
            )}
            <span
              style={{
                fontWeight: 600,
                fontSize: "16px",
                whiteSpace: "nowrap",
              }}
            >
              Bảng điều khiển quản trị
            </span>
          </div>

          {/* PHẢI: Tìm kiếm + Avatar */}
          <Space size="large" align="center">
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              style={{
                width: 220,
                borderRadius: 6,
                background: "#f5f5f5",
              }}
            />
            <Dropdown
              menu={profileMenu}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  padding: "6px 10px",
                  borderRadius: 8,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Avatar
                  icon={<UserOutlined />}
                  size={32}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <span style={{ fontWeight: 500 }}>Admin</span>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* CONTENT */}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            minHeight: "calc(100vh - 112px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
