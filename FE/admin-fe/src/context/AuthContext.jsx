import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
// import api from "../utils/axios"; //  tạm bỏ để mock dữ liệu

const AuthContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  // Khi load lại trang, nếu có token thì giữ trạng thái đăng nhập
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, []);

  //  MOCK LOGIN để test frontend
  const login = async (email, password) => {
    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 600)); // mô phỏng delay

      // Dữ liệu mô phỏng người dùng:
      const fakeUsers = [
        {
          email: "admin@stylewear.com",
          password: "123456",
          roleId: 1,
          fullName: "Quản trị viên",
        },
        {
          email: "staff@stylewear.com",
          password: "123456",
          roleId: 3,
          fullName: "Nhân viên bán hàng",
        },
      ];

      const found = fakeUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!found) {
        message.error("Email hoặc mật khẩu không đúng!");
        return false;
      }

      const mockToken = "fake_token_" + Date.now();

      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(found));

      setUser(found);
      message.success(`Xin chào ${found.fullName}!`);
      return true;
    } catch (err) {
      console.error(err);
      message.error("Đăng nhập lỗi (mock)!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
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
