import { Layout } from "antd";
import { Outlet, useLocation, useNavigate, matchPath } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect } from "react";

const { Content } = Layout;

const ClientLayout = () => {
    const navigate = useNavigate();
    const path = useLocation().pathname;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const notProtectedRoutes = [
        "/",
        "/login",
        "/register",
        "/products",
        "/products/:id",
    ];

    useEffect(() => {
        const isPublic = notProtectedRoutes.some((p) => matchPath(p, path));
        if (!isPublic && (!token || !userId)) {
            navigate("/login", { replace: true, state: { from: path } });
        }
    }, [token, userId, path]);
    return (
        <Layout style={{ minHeight: "100vh", background: "#fff" }}>
            <Header />
            <Content style={{ padding: "0 50px", marginTop: 64 }}>
                <Outlet />
            </Content>
            <Footer />
        </Layout>
    );
};

export default ClientLayout;
