// src/utils/axios.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://160.250.5.26:5000/api", // ✅ TODO: thay bằng URL thật của backend bạn
    timeout: 10000,
});

// 🧠 Tự động thêm token nếu có
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ⚠️ Nếu lỗi 401 → tự động redirect login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;
