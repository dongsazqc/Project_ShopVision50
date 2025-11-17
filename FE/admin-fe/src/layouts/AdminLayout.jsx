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
  ShoppingOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  UserOutlined,
  BarChartOutlined,
  ShopOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const siderWidth = collapsed ? 80 : 230;

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 🔒 Nếu chưa đăng nhập thì redirect ra trang /login
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  // 📋 Menu dropdown (đăng xuất)
  const profileMenu = {
    items: [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        onClick: () => logout(),
      },
    ],
  };

  // Kiểm tra vai trò của người dùng để điều chỉnh menu
  const isStaff = user?.roleId === 3;
  const isAdmin = user?.roleId === 1;

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

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["product-management"]}
          style={{ marginTop: 10 }}
        >
          {/* Quản lý sản phẩm chỉ dành cho admin */}
          {isAdmin && (
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
              <Menu.Item key="/admin/materials">
                <Link to="/admin/materials">Chất liệu</Link>
              </Menu.Item>
              <Menu.Item key="/admin/styles">
                <Link to="/admin/styles">Phong cách</Link>
              </Menu.Item>
              <Menu.Item key="/admin/genders">
                <Link to="/admin/genders">Giới tính</Link>
              </Menu.Item>
              <Menu.Item key="/admin/origins">
                <Link to="/admin/origins">Xuất xứ</Link>
              </Menu.Item>
            </Menu.SubMenu>
          )}

          {/* Đơn hàng */}
          {isAdmin && (
            <Menu.Item key="/admin/orders" icon={<ShoppingCartOutlined />}>
              <Link to="/admin/orders">Đơn hàng</Link>
            </Menu.Item>
          )}

          {/* Khuyến mãi */}
          {isAdmin && (
            <Menu.Item key="/admin/promotions" icon={<TagsOutlined />}>
              <Link to="/admin/promotions">Khuyến mãi</Link>
            </Menu.Item>
          )}

          {/* Người dùng (chỉ cho admin) */}
          {isAdmin && (
            <Menu.Item key="/admin/users" icon={<UserOutlined />}>
              <Link to="/admin/users">Người dùng</Link>
            </Menu.Item>
          )}

          {/* Báo cáo (chỉ cho admin) */}
          {isAdmin && (
            <Menu.Item key="/admin/reports" icon={<BarChartOutlined />}>
              <Link to="/admin/reports">Báo cáo</Link>
            </Menu.Item>
          )}

          {/* POS - Dành cho cả nhân viên và admin */}
          {(isAdmin || isStaff) && (
            <Menu.Item key="/admin/pos" icon={<ShopOutlined />}>
              <Link to="/admin/pos">Bán hàng tại quầy (POS)</Link>
            </Menu.Item>
          )}
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
        {/* ===== HEADER ===== */}
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
            <Dropdown menu={profileMenu} placement="bottomRight" trigger={["click"]}>
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
              >
                <Avatar
                  icon={<UserOutlined />}
                  size={32}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <span style={{ fontWeight: 500 }}>
                  {user?.fullName || "Người dùng"}
                </span>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* ===== CONTENT ===== */}
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
