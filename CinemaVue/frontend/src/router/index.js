import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router/routes'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
    // Scroll behavior
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        } else {
            return { top: 0 }
        }
    },
    // Link active class configuration
    linkActiveClass: 'router-link-active',
    linkExactActiveClass: 'router-link-exact-active',
})

// Global navigation guards
router.beforeEach((to, from, next) => {
    // Kiểm tra authentication, permissions, etc.
    console.log(`Navigating from ${from.path} to ${to.path}`)
    next()
})

router.afterEach((to, from) => {
    // Cập nhật title, analytics, etc.
    document.title = to.meta.title || 'My Vue App'
})

export default router
