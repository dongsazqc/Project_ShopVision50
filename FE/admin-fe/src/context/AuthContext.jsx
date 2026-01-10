import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            if (!saved || saved === "undefined") return null;
            return JSON.parse(saved);
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    const [loading, setLoading] = useState(false);

    // Tải lại user khi F5 nếu token còn
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && !user) {
            try {
                const savedUser = JSON.parse(localStorage.getItem("user"));
                setUser(savedUser || null);
            } catch {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
        }
    }, [user]);

    // 🔥 LOGIN — phiên bản hoàn chỉnh
    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await fetch(
                // "http://160.250.5.26:5000/api/Login/login",
                "http://localhost:5000/api/Login/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Email: email, Password: password }),
                }
            );
            // ❌ API báo lỗi → hiện popup lỗi
            if (!res.ok) {
                const errorText = await res.text();
                messageApi.error(errorText || "Đăng nhập thất bại!");
                return { success: false };
            }

            // ✔ Login thành công
            const data = await res.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);

            messageApi.success(
                `Xin chào ${data.user.fullName || data.user.email}!`
            );
            return { success: true };
        } catch (err) {
            messageApi.error(err?.response?.data);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    // LOGOUT
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        messageApi.info("Bạn đã đăng xuất!");
        window.location.href = "/login";
    };

    return (
        <>
            {contextHolder}
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
        </>
    );
};
