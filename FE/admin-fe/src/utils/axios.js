import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
    baseURL: "http://160.250.5.26:5000/api",
    // baseURL: "http://localhost:5000/api",
=======
    // baseURL: "http://160.250.5.26:5000/api",
    baseURL: "http://160.250.5.26:5000/api",
>>>>>>> 1e456e2eb232953c678ab631f2e697e1d8655e9e
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;
