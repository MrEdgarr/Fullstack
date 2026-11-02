import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/_services/api";
import { AUTH_UNAUTHORIZED_EVENT } from "@/utils/constants/auth";
import { useToastStore } from "@/stores/app/useToastStore";
import router from "@/router";

const getSavedToken = () => localStorage.getItem("token");
const getSavedUser = () => localStorage.getItem("user");
let isUnauthorizedListenerRegistered = false;
let autoLogoutTimer = null;

const parseJwtPayload = (jwtToken) => {
    if (!jwtToken || typeof jwtToken !== "string") return null;
    try {
        const parts = jwtToken.split(".");
        if (parts.length < 2) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join(""),
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

const isTokenExpired = (jwtToken) => {
    const payload = parseJwtPayload(jwtToken);
    if (!payload || !payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
};

const clearAutoLogoutTimer = () => {
    if (autoLogoutTimer) {
        clearTimeout(autoLogoutTimer);
        autoLogoutTimer = null;
    }
};

export const useAuthStore = defineStore("auth", () => {
    const token = ref(getSavedToken());
    const user = ref(null);
    const isLoading = ref(false);
    const isModalOpen = ref(false);
    const currentTab = ref("login");
    const redirectAfterLogin = ref(null);

    const isLoggedIn = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === "admin");

    const clearAuth = () => {
        clearAutoLogoutTimer();
        token.value = null;
        user.value = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    /**
     * Xử lý đăng xuất tập trung khi phiên làm việc hết hạn (JWT expired hoặc 401 Unauthorized)
     */
    const handleSessionExpired = (message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.") => {
        const wasLoggedIn = !!token.value;
        clearAuth();

        if (wasLoggedIn) {
            try {
                const toastStore = useToastStore();
                toastStore.warning(message);
            } catch (err) {
                console.warn("[Auth] Session expired:", err);
            }
        }

        // Kiểm tra xem trang hiện tại có thuộc admin hoặc route yêu cầu đăng nhập hay không
        const currentRoute = router.currentRoute.value;
        const currentPath = currentRoute?.path || (typeof window !== "undefined" ? window.location.pathname : "");
        const isProtectedRoute =
            currentPath.startsWith("/admin") ||
            currentRoute?.matched?.some((record) => record.meta?.requiresAuth || record.meta?.requiresAdmin);

        if (isProtectedRoute) {
            setLoginRedirect(currentPath);
            router.replace({ name: "home" }).then(() => {
                openModal("login");
            });
        }
    };

    const scheduleAutoLogout = (jwtToken) => {
        clearAutoLogoutTimer();
        const payload = parseJwtPayload(jwtToken);
        if (!payload?.exp) return;

        const remainingTimeMs = payload.exp * 1000 - Date.now();
        if (remainingTimeMs <= 0) {
            handleSessionExpired();
            return;
        }

        autoLogoutTimer = setTimeout(() => {
            handleSessionExpired();
        }, remainingTimeMs);
    };

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
        scheduleAutoLogout(newToken);
    };

    const setUser = (userData) => {
        user.value = userData;
        localStorage.setItem("user", JSON.stringify(userData));
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

    const updateProfile = async (profileData, avatarFile = null) => {
        if (!avatarFile) {
            const res = await api.put("/customers/me", profileData, {
                skipServerLoading: true,
            });

            setUser(res.data.data);
            return res.data.data;
        }

        const formData = new FormData();
        Object.entries(profileData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        formData.append("avatar", avatarFile);

        const res = await api.put("/customers/me", formData, {
            skipServerLoading: true,
        });

        setUser(res.data.data);
        return res.data.data;
    };

    const logout = () => {
        clearAuth();
        const currentRoute = router.currentRoute.value;
        const currentPath = currentRoute?.path || (typeof window !== "undefined" ? window.location.pathname : "");
        if (currentPath.startsWith("/admin") || currentRoute?.matched?.some((record) => record.meta?.requiresAuth)) {
            router.replace({ name: "home" });
        }
    };

    const checkAuth = () => {
        const savedToken = getSavedToken();
        const savedUser = getSavedUser();

        if (!savedToken || isTokenExpired(savedToken)) {
            if (savedToken) {
                handleSessionExpired();
            } else {
                clearAuth();
            }
            return false;
        }

        token.value = savedToken;
        scheduleAutoLogout(savedToken);

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
        window.addEventListener(AUTH_UNAUTHORIZED_EVENT, () => {
            handleSessionExpired();
        });
        isUnauthorizedListenerRegistered = true;
    }

    // Khởi tạo và kiểm tra auth ngay khi store được khởi tạo
    checkAuth();

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
        handleSessionExpired,
    };
});
