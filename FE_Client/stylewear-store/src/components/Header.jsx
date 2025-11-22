import React, { useState } from "react";
import { Layout, Menu, Input, Badge, Dropdown, Avatar } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingFilled, UserOutlined, SearchOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Search } = Input;

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(2); // mock số lượng giỏ hàng

  // User menu
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate("/profile")}>
        Quản lý thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="orders" onClick={() => navigate("/orders")}>
        Lịch sử đơn hàng
      </Menu.Item>
      <Menu.Item key="logout" onClick={() => {
        localStorage.removeItem("token"); // hoặc logout logic khác
        navigate("/login");
      }}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
        padding: "0 20px",
        background: "#001529",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        {/* LOGO */}
        <div style={{ fontSize: 24, fontWeight: "bold", color: "#fff", marginRight: 40 }}>
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            StyleWear
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Search
            placeholder="Tìm kiếm áo phông..."
            enterButton={<SearchOutlined />}
            size="large"
            style={{
              width: 400,
              borderRadius: 25,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          />
        </div>

        {/* MENU */}
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{
            background: "transparent",
            borderBottom: "none",
            marginLeft: 30,
            display: "flex",
            justifyContent: "flex-end",
            flex: 1,
          }}
        >
          <Menu.Item key="/" style={{ fontWeight: "normal" }}>
            <Link to="/">Trang chủ</Link>
          </Menu.Item>
          <Menu.Item key="/products" style={{ fontWeight: "normal" }}>
            <Link to="/products">Sản phẩm</Link>
          </Menu.Item>
        </Menu>
          <Link
            to="/cart"
            style={{
              color: "#fff",
              fontSize: 26,
              padding: "8px 15px",
              borderRadius: "50%",
              transition: "all 0.3s ease",
            }}
          >
            <Badge count={cartCount} size="small" offset={[-4, 4]}>
              <ShoppingFilled />
            </Badge>
          </Link>
        {/* ICONS */}
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {/* User Dropdown */}
          <Dropdown overlay={userMenu} placement="bottomRight" arrow>
            <Avatar
              size={36}
              icon={<UserOutlined />}
              style={{ cursor: "pointer" }}
            />
          </Dropdown>

          {/* Giỏ hàng */}
          
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;
