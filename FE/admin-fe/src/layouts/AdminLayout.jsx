import {
  Layout,Menu,Avatar, Dropdown, Space, theme,} from "antd";
import { ShoppingOutlined, ShoppingCartOutlined,TagsOutlined,UserOutlined,BarChartOutlined,ShopOutlined,LogoutOutlined,LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

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

  // Lấy key menu đang active (nếu URL có subpath thì lấy phần base)
  const getSelectedKey = (pathname) => {
    const parts = pathname.split("/");
    if (parts.length >= 3) {
      return `/${parts[1]}/${parts[2]}`;
    }
    return pathname;
  };

  const selectedKey = getSelectedKey(location.pathname);

  const siderWidth = collapsed ? 80 : 230;

  return (
<Layout
  style={{
    marginLeft: 0,
    minHeight: "100vh",
    background: "transparent",
    overflow: "visible",
  }}
>
    
      {/* ===== SIDEBAR ===== */}
<Sider
  collapsible
  collapsed={collapsed}
  onCollapse={setCollapsed}
  width={230}
  trigger={null} // tắt trigger mặc định
  style={{
    background: collapsed
      ? "linear-gradient(180deg, #b8e9ff 0%, #d5e3ff 40%, #e8cffc 100%)"
      : "linear-gradient(180deg, #c7f5ff 0%, #e0ecff 40%, #f1ddff 100%)",
    boxShadow: "4px 0 18px rgba(15, 23, 42, 0.18)",
    borderRight: "1px solid rgba(148, 163, 184, 0.35)",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    height: "100vh",
    overflow: "auto",
    transition: "all 0.3s ease",
  }}
>
        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: "20px 16px",
            borderBottom: collapsed
              ? "1px solid rgba(31, 41, 55, 0.7)"
              : "1px solid rgba(148,163,184,0.35)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background:
                "conic-gradient(from 160deg, #22c55e, #0ea5e9, #6366f1, #ec4899, #22c55e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#f9fafb",
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              S
            </span>
          </div>

          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  color: "#111827",
                  fontSize: 16,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                StyleWear Admin
              </div>
              <div
                style={{
                  color: "#4b5563",
                  fontSize: 12,
                }}
              >
                Fashion Management Panel
              </div>
            </div>
          )}
        </div>
        

        {/* Menu */}
<Menu
  theme="light"
  mode="inline"
  selectedKeys={[selectedKey]}
  defaultOpenKeys={["product-management"]}
  style={{
    marginTop: 8,
    borderRight: "none",
    background: "transparent",
    color: "#0f172a",
  }}
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
{/* Nút collapse pastel ở đáy sidebar */}
<div
  onClick={() => setCollapsed(!collapsed)}
  style={{
    position: "sticky",
    bottom: 0,
    width: "100%",
    padding: "10px 0",
    display: "flex",
    justifyContent: "center",
    background: "transparent",
  }}
>
  <div
    style={{
      width: collapsed ? 40 : 60,
      height: 28,
      borderRadius: 999,
      background:
        "linear-gradient(90deg, #c7f5ff 0%, #e0ecff 40%, #f1ddff 100%)",
      boxShadow: "0 4px 10px rgba(148,163,184,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      border: "1px solid rgba(148,163,184,0.7)",
    }}
  >
    {collapsed ? (
      <RightOutlined style={{ fontSize: 12, color: "#0f172a" }} />
    ) : (
      <LeftOutlined style={{ fontSize: 12, color: "#0f172a" }} />
    )}
  </div>
</div>
      </Sider>

      {/* ===== MAIN ===== */}
      <Layout
        style={{
          marginLeft: siderWidth,
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
          background: "transparent",
        }}
      >
        {/* ===== HEADER ===== */}
<Header
   style={{
      background:"#ffffff",
      backdropFilter: "blur(8px)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 24px",
      height: 80,
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 3px 12px rgba(148, 163, 184, 0.45)",
      borderBottom: "1px solid rgba(209, 213, 219, 0.9)",
      borderTop: "1px solid rgba(209, 213, 219, 0.6)",
    }}
>
<div
  style={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    lineHeight: 1.4,
  }}
>
  <span
    style={{
      fontWeight: 700,
      fontSize: 16,
      color: "#0f172a",
      lineHeight: "24px",
    }}
  >
    Bảng điều khiển quản trị
  </span>
  <span
    style={{
      fontSize: 12,
      color: "#4b5563",
      marginTop: 2,          
      lineHeight: "18px",
    }}
  >
    Quản lý sản phẩm, đơn hàng và hệ thống bán hàng của StyleWear
  </span>
</div>

  {/* PHẢI: Avatar + tên người dùng */}
  <Space size="middle" align="center">
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
          borderRadius: 999,
          transition: "all 0.2s ease",
          backgroundColor: "rgba(243, 244, 255, 0.95)",
          border: "1px solid rgba(129, 140, 248, 0.55)",
        }}
      >
        <Avatar
          icon={<UserOutlined />}
          size={32}
          style={{
            background:
              "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #ec4899 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.2,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "#111827",
            }}
          >
            {user?.fullName || "Người dùng"}
          </span>
          <span
            style={{
              fontSize: 11,
              color: "#6b7280",
            }}
          >
            {isAdmin ? "Quản trị viên" : isStaff ? "Nhân viên POS" : ""}
          </span>
        </div>
      </div>
    </Dropdown>
  </Space>
</Header>

        {/* ===== CONTENT ===== */}
        <Content
          style={{
            margin: "10px 10px",
            padding: 10,
            background: colorBgContainer,
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(148, 163, 184, 0.35)",
            minHeight: "calc(100vh - 112px)",
            overflow: "visible",
          }}
        >
     
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
