import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Header } = Layout;

const AppHeader = () => {
  const location = useLocation();
  return (
    <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
      <div className="logo" style={{ float: "left", color: "#fff", fontWeight: "bold" }}>
        <Link to="/" style={{ color: "#fff" }}>StyleWear</Link>
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        style={{ lineHeight: "64px" }}
      >
        <Menu.Item key="/">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="/products">
          <Link to="/products">Products</Link>
        </Menu.Item>
        <Menu.Item key="/cart">
          <Link to="/cart">Cart</Link>
        </Menu.Item>
        <Menu.Item key="/login">
          <Link to="/login">Login</Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
};

export default AppHeader;
