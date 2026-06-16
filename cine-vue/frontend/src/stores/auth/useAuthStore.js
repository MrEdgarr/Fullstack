import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/_services/api";
import { AUTH_UNAUTHORIZED_EVENT } from "@/utils/constants/auth";

const getSavedToken = () => localStorage.getItem("token");
const getSavedUser = () => localStorage.getItem("user");
let isUnauthorizedListenerRegistered = false;

export const useAuthStore = defineStore("auth", () => {
    const token = ref(getSavedToken());
    const user = ref(null);
    const isLoading = ref(false);
    const isModalOpen = ref(false);
    const currentTab = ref("login");
    const redirectAfterLogin = ref(null);

    const isLoggedIn = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === "admin");

    const openModal = (tab = "login") => {
        currentTab.value = tab;
        isModalOpen.value = true;
    };

    const closeModal = () => {
        isModalOpen.value = false;
    };

    const setLoginRedirect = (path) => {
        redirectAfterLogin.value = path || null;
    };

    const consumeLoginRedirect = () => {
        const path = redirectAfterLogin.value;
        redirectAfterLogin.value = null;
        return path;
    };

    const setToken = (newToken) => {
        token.value = newToken;
        localStorage.setItem("token", newToken);
    };

    const setUser = (userData) => {
        user.value = userData;
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const clearAuth = () => {
        token.value = null;
        user.value = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const login = async (credentials) => {
        isLoading.value = true;
        try {
            const res = await api.post("/auth/login", credentials, {
                skipServerLoading: true,
            });

            setToken(res.data.token);
            setUser(res.data.customer);
            closeModal();

            return res.data;
        } finally {
            isLoading.value = false;
        }
    };

    const register = async (userData) => {
        isLoading.value = true;
        try {
            const res = await api.post("/auth/register", userData, {
                skipServerLoading: true,
            });
            closeModal();
            return res.data;
        } finally {
            isLoading.value = false;
        }
    };

    const fetchProfile = async () => {
        const res = await api.get("/customers/me", {
            skipServerLoading: true,
        });

        setUser(res.data.data);
        return res.data.data;
    };

    const updateProfile = async (profileData) => {
        const res = await api.put("/customers/me", profileData, {
            skipServerLoading: true,
        });

        setUser(res.data.data);
        return res.data.data;
    };

    const logout = () => {
        clearAuth();
    };

    const checkAuth = () => {
        const savedToken = getSavedToken();
        const savedUser = getSavedUser();

        if (!savedToken) {
            clearAuth();
            return false;
        }

        token.value = savedToken;

        if (!savedUser) {
            return true;
        }

        try {
            user.value = JSON.parse(savedUser);
            return true;
        } catch (error) {
            console.error("[Auth] Invalid saved user data:", error);
            clearAuth();
            return false;
        }
    };

    if (typeof window !== "undefined" && !isUnauthorizedListenerRegistered) {
        window.addEventListener(AUTH_UNAUTHORIZED_EVENT, clearAuth);
        isUnauthorizedListenerRegistered = true;
    }

    onMounted(() => {
        checkAuth();
    });

    return {
        token,
        user,
        isLoading,
        isModalOpen,
        currentTab,
        redirectAfterLogin,
        isLoggedIn,
        isAdmin,
        openModal,
        closeModal,
        setLoginRedirect,
        consumeLoginRedirect,
        login,
        register,
        fetchProfile,
        updateProfile,
        logout,
        clearAuth,
        checkAuth,
    };
});
