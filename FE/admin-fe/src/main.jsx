import "antd/dist/reset.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx"; // <-- thêm dòng này

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>        {/* ✅ Bọc toàn bộ App để dùng AuthContext */}
      <App />
    </AuthProvider>
  </StrictMode>
);
