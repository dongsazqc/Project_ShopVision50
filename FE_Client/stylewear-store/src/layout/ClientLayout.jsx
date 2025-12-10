import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const { Content } = Layout;

const ClientLayout = () => {
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
