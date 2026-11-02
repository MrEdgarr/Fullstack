import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useToastStore } from "@/stores/app/useToastStore";

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
const routeRequiresAdmin = (route) => route.matched.some((record) => record.meta.requiresAdmin);

router.beforeEach((to, from) => {
    const authStore = useAuthStore();

    authStore.checkAuth();

    if (!routeRequiresAuth(to)) {
        return true;
    }

    if (!authStore.isLoggedIn) {
        authStore.setLoginRedirect(to.fullPath);
        authStore.openModal("login");

        // Nếu tải trang trực tiếp (gõ URL) hoặc đang cố vào trang Admin, đẩy về trang chủ
        if (!from.name || to.path.startsWith("/admin")) {
            return {
                name: "home",
                replace: true,
            };
        }
        // Nếu click link từ trong app tới trang client khác cần login, chặn chuyển trang
        return false;
    }

    // Kiểm tra quyền Admin đối với các trang quản trị
    if (routeRequiresAdmin(to) && !authStore.isAdmin) {
        const toastStore = useToastStore();
        toastStore.warning("Bạn không có quyền truy cập khu vực quản trị.");
        return {
            name: "home",
            replace: true,
        };
    }

    return true;
});

router.afterEach((to) => {
    document.title = to.meta.title || DEFAULT_TITLE;
});

export default router;
