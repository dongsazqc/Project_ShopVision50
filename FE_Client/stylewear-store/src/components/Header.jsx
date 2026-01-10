/* eslint-disable react-hooks/preserve-manual-memoization */
import React, { useState, useEffect, useCallback } from "react";
import { Layout, Menu, Input, Badge, Dropdown, Avatar } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    ShoppingFilled,
    UserOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import api from "../utils/axios";
import { useAppContext } from "../context/AppContext";

const { Header } = Layout;
const { Search } = Input;

const AppHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { cartCount, setCartCount } = useAppContext();
    // const [cartCount, setCartCount] = useState(0);
    const [keyword, setKeyword] = useState("");

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const handleNavigateSearch = useCallback(() => {
        if (keyword.trim()) {
            navigate(`/products?keyword=${keyword}`);
        } else {
            navigate(`/products`);
        }
    }, [navigate, keyword]);

    // ==================== UPDATE CART COUNT ====================
    // const updateCartCount = useCallback(async () => {
    //     try {
    //         if (!token || !userId) {
    //             // GUEST
    //             const cart = JSON.parse(localStorage.getItem("cart")) || [];
    //             const total = cart.reduce((sum, i) => sum + i.quantity, 0);
    //             setCartCount(total);
    //             return;
    //         }

    //         // LOGGED IN
    //         const res = await api.get(`/Cart/GetCartByUser/${userId}`);
    //         const items = res.data?.cartItems?.$values || [];
    //         const total = items.reduce((sum, i) => sum + i.quantity, 0);
    //         setCartCount(total);
    //     } catch (err) {
    //         console.error("Không thể load giỏ hàng:", err);
    //     }
    // }, [token, userId]);

    // useEffect(() => {
    //     updateCartCount();
    // }, [location.pathname, updateCartCount]);

    // ==================== LISTEN CART CHANGE ====================
    // useEffect(() => {
    //     const handleCartChange = () => {
    //         // Lấy dữ liệu cart mới từ localStorage hoặc tính tổng FE
    //         const cart = JSON.parse(localStorage.getItem("cartFE")) || [];
    //         const total = cart.reduce((sum, i) => sum + i.quantity, 0);
    //         setCartCount(total);
    //     };

    //     window.addEventListener("cartChanged", handleCartChange);

    //     return () => {
    //         window.removeEventListener("cartChanged", handleCartChange);
    //     };
    // }, []);

    useEffect(() => {
        const fetch = async () => {
            const res = await api.get(`/Cart/GetCartByUser/${userId}`);
            const rawItems = res.data?.cartItems || [];
            setCartCount(rawItems?.length);
        };
        fetch();
    }, []);

    console.log("Cart count in header:", cartCount);

    // ==================== USER MENU ====================
    const userMenu = (
        <Menu>
            {token ? (
                <>
                    <Menu.Item
                        key="userprofile"
                        onClick={() => navigate("/userprofile")}
                    >
                        Quản lý thông tin cá nhân
                    </Menu.Item>
                    <Menu.Item
                        key="myvoucher"
                        onClick={() => navigate("/myvoucher")}
                    >
                        Voucher của tôi
                    </Menu.Item>
                    <Menu.Item
                        key="logout"
                        onClick={() => {
                            localStorage.clear();
                            navigate("/login");
                        }}
                    >
                        Đăng xuất
                    </Menu.Item>
                </>
            ) : (
                <Menu.Item key="login" onClick={() => navigate("/login")}>
                    Đăng nhập
                </Menu.Item>
            )}
        </Menu>
    );

    // ==================== HEADER UI ====================
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
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                }}
            >
                {/* LOGO */}
                <div
                    style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#fff",
                        marginRight: 40,
                    }}
                >
                    <Link
                        to="/"
                        style={{ color: "#fff", textDecoration: "none" }}
                    >
                        StyleWear
                    </Link>
                </div>

                {/* SEARCH BAR */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <Search
                        placeholder="Tìm kiếm áo phông..."
                        enterButton={
                            <SearchOutlined onClick={handleNavigateSearch} />
                        }
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleNavigateSearch();
                            }
                        }}
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
                    <Menu.Item key="/voucher" style={{ fontWeight: "normal" }}>
                        <Link to="/voucher">Săn Voucher</Link>
                    </Menu.Item>
                    <Menu.Item key="/myorder" style={{ fontWeight: "normal" }}>
                        <Link to="/myorder">Đơn hàng của tôi</Link>
                    </Menu.Item>
                    <Menu.Item key="/sale" style={{ fontWeight: "normal" }}>
                        <Link to="/sale">Đang giảm giá</Link>
                    </Menu.Item>




                </Menu>

                {/* CART ICON */}
                <Link
                    to="/cart"
                    style={{
                        color: "#fff",
                        fontSize: 26,
                        padding: "8px 15px",
                        borderRadius: "50%",
                        transition: "all 0.3s ease",
                        marginRight: 20,
                    }}
                >
                    <Badge count={cartCount} size="small" offset={[-4, 4]}>
                        <ShoppingFilled
                            color="#fff"
                            style={{ color: "#fff", fontSize: 20 }}
                        />
                    </Badge>
                </Link>

                {/* USER DROPDOWN */}
                <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                    <Avatar
                        size={36}
                        icon={<UserOutlined />}
                        style={{ cursor: "pointer" }}
                    />
                </Dropdown>
            </div>
        </Header>
    );
};

export default AppHeader;
