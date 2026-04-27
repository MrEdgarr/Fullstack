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

export default api;
