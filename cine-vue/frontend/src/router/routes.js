export const routes = [
    {
        path: "/",
        component: () => import("@/layouts/ClientLayout.vue"),
        children: [
            {
                path: "/",
                component: () => import("@/views/client/HomeView.vue"),
                meta: {
                    title: "Cinemax",
                    requiresAuth: false,
                    breadcrumb: "Trang chủ",
                },
                // Alias routes
                alias: ["/home", "/trang-chu"],
            },
            {
                path: "/movie/:slug",
                component: () => import("@/views/client/MovieView.vue"),
                name: "movie",
                meta: {
                    title: "Cinemax",
                    requiresAuth: false,
                    breadcrumb: "Phim",
                },
                // Alias routes
                alias: ["/movie/:slug", "/phim/:slug"],
            },
            {
                path: "/about",
                component: () => import("@/views/client/AboutView.vue"),
                name: "about",
                meta: {
                    title: "Cinemax",
                    requiresAuth: false,
                    breadcrumb: "Lịch Chiếu",
                },
                // Alias routes
                alias: ["/about", "/ve-chung-toi"],
            },
        ],
    },
];
