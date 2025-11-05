import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Khởi tạo user từ localStorage, tránh lỗi parse undefined/null
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || savedUser === "undefined") {
      localStorage.removeItem("user");
      return null;
    }
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Giữ trạng thái đăng nhập khi reload trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
    }
  }, [user]);

  // Hàm login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch("http://160.250.5.26:5000/api/Login/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Password: password }),
      });

      if (!res.ok) {
        message.error("Email hoặc mật khẩu không đúng!");
        return false;
      }

      const data = await res.json();

      // Lưu token + user vào localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      message.success(`Xin chào ${data.user.fullName || data.user.email}!`);
      return true;
    } catch (error) {
      console.error(error);
      message.error("Đăng nhập lỗi!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Hàm logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    message.info("Bạn đã đăng xuất!");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
