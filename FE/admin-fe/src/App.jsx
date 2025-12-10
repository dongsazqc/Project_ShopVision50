import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoutes from "./routes/AdminRoutes";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Dùng PrivateRoute bảo vệ tất cả các route admin */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <AdminRoutes />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
