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
  {
    path: "/",
    element: <ClientLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <Products /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "cart", element: <Cart /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
]);

export default clientRoutes;
