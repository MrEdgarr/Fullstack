import axios from "axios";

const api = axios.create({
    baseURL: "/api", // Sử dụng proxy trong dev
    timeout: 10000,
});

// Request interceptor - tự động thêm token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - xử lý lỗi 401 (token hết hạn)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        }
        return Promise.reject(error);
    },
);

export default api;

