import axios from "axios";
import { AUTH_UNAUTHORIZED_EVENT } from "@/utils/constants/auth";
import { useServerConnectionStore } from "@/stores/app/useServerConnectionStore";

const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 60000;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
    timeout: API_TIMEOUT_MS,
});

const shouldUseGlobalLoading = (config) =>
    !config?.skipServerLoading && !config?.disableGlobalLoading;

const clearPersistedAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (shouldUseGlobalLoading(config)) {
            const connectionStore = useServerConnectionStore();
            connectionStore.startRequest();
        }

        return config;
    },
    (error) => {
        if (shouldUseGlobalLoading(error.config)) {
            const connectionStore = useServerConnectionStore();
            connectionStore.finishRequest();
        }
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => {
        if (shouldUseGlobalLoading(response.config)) {
            const connectionStore = useServerConnectionStore();
            connectionStore.finishRequest();
        }
        return response;
    },
    (error) => {
        if (shouldUseGlobalLoading(error.config)) {
            const connectionStore = useServerConnectionStore();
            connectionStore.finishRequest();
        }

        if (error.response?.status === 401) {
            clearPersistedAuth();
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
            }
        }
        return Promise.reject(error);
    },
);

export default api;
