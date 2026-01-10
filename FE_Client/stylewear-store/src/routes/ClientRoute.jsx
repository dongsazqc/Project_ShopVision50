import { createBrowserRouter } from "react-router-dom";
import ClientLayout from "../layout/ClientLayout";

// 📦 Các trang
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/Ordersuccess";
import OrderHistory from "../pages/Orderhistory";
import Userprofile from "../pages/Userprofile";
import Voucher from "../pages/Voucher";
import MyOrder from "../pages/MyOrder";
import Sale from "../pages/Sale";
import Myvoucher from "../pages/Myvoucher";


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
      { path: "checkout", element: <Checkout /> },
      { path: "ordersuccess", element: <OrderSuccess /> },
      { path: "orderhistory", element: <OrderHistory /> },  
      { path : "userprofile", element : <Userprofile />},
      { path: "voucher", element: <Voucher /> },     
      { path: "myorder", element: <MyOrder /> },   
      { path: "sale", element: <Sale /> },   
      { path: "myvoucher", element: <Myvoucher /> },   


    
    ],

  },
]);

export default clientRoutes;