import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/_services/api";

export const useAuthStore = defineStore("auth", () => {
    const token = ref(localStorage.getItem("token") || null);
    const user = ref(null);
    const isLoading = ref(false);
    const isModalOpen = ref(false);
    const currentTab = ref("login");

    // const userItems = computed(() => JSON.parse(localStorage.getItem("user")) || user.value);
    const isLoggedIn = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === "admin");

    const openModal = (tab = "login") => {
        currentTab.value = tab;
        isModalOpen.value = true;
    };

    const closeModal = () => {
        isModalOpen.value = false;
    };

    const setToken = (newToken) => {
        token.value = newToken;
        localStorage.setItem("token", newToken);
    };

    const setUser = (userData) => {
        user.value = userData;
        // Lưu thông tin user vào localStorage để tự động load khi reload trang
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const clearAuth = () => {
        token.value = null;
        user.value = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    // Đăng nhập
    const login = async (credentials) => {
        isLoading.value = true;
        try {
            const res = await api.post("/auth/login", credentials);

            setToken(res.data.token);
            setUser(res.data.customer);

            closeModal();

            return res.data;
        } finally {
            isLoading.value = false;
        }
    };

    // Đăng ký
    const register = async (userData) => {
        isLoading.value = true;
        try {
            const res = await api.post("/auth/register", userData);
            closeModal();
            return res.data;
        } finally {
            isLoading.value = false;
        }
    };

    const logout = () => {
        clearAuth();
    };

    // Kiểm tra và load thông tin khi reload trang
    const checkAuth = () => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken) {
            token.value = savedToken;
        }

        if (savedUser) {
            try {
                user.value = JSON.parse(savedUser);
            } catch (e) {
                console.log(e);
                clearAuth();
            }
        }
    };

    onMounted(() => {
        checkAuth();
    });

    return {
        token,
        user,
        isLoading,
        isModalOpen,
        currentTab,
        isLoggedIn,
        isAdmin,
        // userItems,
        openModal,
        closeModal,
        login,
        register,
        logout,
        checkAuth,
    };
});
