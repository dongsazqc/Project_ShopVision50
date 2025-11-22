import { createBrowserRouter } from "react-router-dom";
import ClientLayout from "../layout/ClientLayout";

// 📦 Các trang
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Register from "../pages/Register";

const clientRoutes = createBrowserRouter([
  // 🔹 Login/Register không dùng layout
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  // 🔹 Các trang còn lại dùng layout
  {
    path: "/",
    element: <ClientLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <Products /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "cart", element: <Cart /> },
    ],
  },
]);

export default clientRoutes;
