import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { useAuth } from "../context/AuthContext";

// --- Import các trang ---
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Categories from "../pages/Categories";
import Orders from "../pages/Orders";
import Promotions from "../pages/Promotions";
import Users from "../pages/Users";
import Reports from "../pages/Reports";
import POS from "../pages/POS";

export default function AdminRoutes() {
  const { user } = useAuth();

  // Nếu chưa đăng nhập → chuyển về login
  if (!user) return <Navigate to="/login" replace />;

  // Nếu là khách hàng → không được vào admin
  if (user.roleId === 4)
    return <Navigate to="/login" replace state={{ message: "Bạn không có quyền truy cập trang quản trị!" }} />;

  // Nếu là nhân viên → chỉ cho phép dashboard + pos
  if (user.roleId === 3) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          {/* Nếu truy cập route khác → quay lại POS */}
          <Route path="*" element={<Navigate to="/admin/pos" replace />} />
        </Route>
      </Routes>
    );
  }

  // Nếu là admin → toàn quyền
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Quản lý sản phẩm */}
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />

        {/* Đơn hàng */}
        <Route path="orders" element={<Orders />} />

        {/* Khuyến mãi */}
        <Route path="promotions" element={<Promotions />} />

        {/* Người dùng */}
        <Route path="users" element={<Users />} />

        {/* Báo cáo */}
        <Route path="reports" element={<Reports />} />

        {/* POS – Bán hàng tại quầy */}
        <Route path="pos" element={<POS />} />

        {/* Route sai → về Dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
