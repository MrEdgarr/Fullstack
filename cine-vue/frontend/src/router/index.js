import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router/routes";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else if (to.hash) {
            return {
                el: to.hash,
                behavior: "smooth",
            };
        } else {
            return { top: 0 };
        }
    },
});

// Global navigation guards
router.beforeEach((to, from) => {
    // Kiểm tra authentication, permissions, etc.
    console.log(`Navigating from ${from.path} to ${to.path}`);
});

router.afterEach((to, from) => {
    // Cập nhật title, analytics, etc.
    return (document.title = to.meta.title || "My Vue App");
});

export default router;
