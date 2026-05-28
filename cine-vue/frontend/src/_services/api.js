import axios from "axios";
import { useServerConnectionStore } from "@/stores/app/useServerConnectionStore";

const SERVER_LOADING_FLAG = "__trackServerConnection";
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 60000;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
    timeout: API_TIMEOUT_MS,
});

const finishTrackedRequest = (config) => {
    if (!config?.[SERVER_LOADING_FLAG]) return;

    config[SERVER_LOADING_FLAG] = false;
    useServerConnectionStore().finishRequest();
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (!config.skipServerLoading) {
            config[SERVER_LOADING_FLAG] = true;
            useServerConnectionStore().startRequest();
        }

        return config;
    },
    (error) => {
        finishTrackedRequest(error.config);
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => {
        finishTrackedRequest(response.config);
        return response;
    },
    (error) => {
        finishTrackedRequest(error.config);

        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        }
        return Promise.reject(error);
    },
);

export default api;
