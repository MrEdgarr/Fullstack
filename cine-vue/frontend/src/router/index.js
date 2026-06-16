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

router.beforeEach((to) => {
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

    return {
        name: "home",
        query: { redirect: to.fullPath },
        replace: true,
    };
});

router.afterEach((to) => {
    document.title = to.meta.title || DEFAULT_TITLE;
});

export default router;
