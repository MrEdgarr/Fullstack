import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth/useAuthStore";

const DEFAULT_TITLE = "Cinemax";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }

        if (to.hash) {
            return {
                el: to.hash,
                behavior: "smooth",
            };
        }

        return { top: 0 };
    },
});

const routeRequiresAuth = (route) => route.matched.some((record) => record.meta.requiresAuth);

router.beforeEach((to, from) => {
    const authStore = useAuthStore();

    authStore.checkAuth();

    if (!routeRequiresAuth(to)) {
        return true;
    }

    if (authStore.isLoggedIn) {
        return true;
    }

    authStore.setLoginRedirect(to.fullPath);
    authStore.openModal("login");
    // Nếu tải trang trực tiếp (gõ URL), đẩy về trang chủ để không bị trắng trang
    if (!from.name) {
        return {
            name: "home",
            replace: true,
        };
    }
    // Nếu click link từ trong app, chặn chuyển trang (giữ nguyên luồng/URL hiện tại)
    return false;
});

router.afterEach((to) => {
    document.title = to.meta.title || DEFAULT_TITLE;
});

export default router;
