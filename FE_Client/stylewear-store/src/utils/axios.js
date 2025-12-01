// 📦 src/utils/axios.js
import axios from "axios";

// ✅ Tạo instance axios mặc định cho toàn bộ web client
const api = axios.create({
    baseURL: "http://160.250.5.26:5000/api", // Địa chỉ API backend của bạn
    // baseURL: "http://localhost:5000/api",

    timeout: 10000, // 10 giây timeout
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ (Tuỳ chọn) Thêm interceptor nếu sau này bạn có login/token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // hoặc sessionStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Xử lý lỗi chung cho response
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;
            // Nếu bị 401 - token hết hạn hoặc chưa đăng nhập
            if (status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        } else {
            console.error("Network or server error:", error);
        }
        return Promise.reject(error);
    }
);

// ✅ Export mặc định để toàn dự án dùng
export default api;
