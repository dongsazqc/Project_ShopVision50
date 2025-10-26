import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

// --- Import các trang ---
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Categories from "../pages/Categories";
import Orders from "../pages/Orders";
import Inventory from "../pages/Inventory";
import Promotions from "../pages/Promotions";
import Users from "../pages/Users";
import Reports from "../pages/Reports";
import POS from "../pages/POS";

// --- Định nghĩa các route admin ---
export default function AdminRoutes() {
  return (
    <Routes>
      {/* Layout chính cho toàn bộ phần quản trị */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Dashboard mặc định */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Quản lý sản phẩm */}
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />

        {/* Đơn hàng */}
        <Route path="orders" element={<Orders />} />

        {/* Kho hàng */}
        <Route path="inventory" element={<Inventory />} />

        {/* Khuyến mãi */}
        <Route path="promotions" element={<Promotions />} />

        {/* Người dùng */}
        <Route path="users" element={<Users />} />

        {/* Báo cáo */}
        <Route path="reports" element={<Reports />} />

        {/* POS – Bán hàng tại quầy */}
        <Route path="pos" element={<POS />} />
      </Route>
    </Routes>
  );
}
