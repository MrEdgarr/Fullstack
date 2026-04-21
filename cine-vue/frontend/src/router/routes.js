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
                path: "/movie",
                children: [
                    {
                        path: ":slug(now-playing|coming-soon)",
                        component: () => import("@/views/client/MovieStatusView.vue"),
                        name: "showing",
                        meta: {
                            title: "Cinemax",
                            requiresAuth: false,
                            breadcrumb: "Phim đang chiếu",
                        },
                        // Alias routes
                        alias: ["dang-chieu"],
                    },
                    {
                        path: ":slug",
                        component: () => import("@/views/client/MovieView.vue"),
                        name: "movie",
                        meta: {
                            title: "Cinemax",
                            requiresAuth: false,
                            breadcrumb: "Chi tiết phim",
                        },
                    },
                ],
            },
            {
                path: "/booking",
                component: () => import("@/views/client/BookingView.vue"),
                name: "booking",
                meta: {
                    title: "Cinemax",
                    requiresAuth: false,
                    breadcrumb: "Lịch Chiếu",
                },
                // Alias routes
                alias: ["/lich-chieu"],
            },
            {
                path: "/blog",
                component: () => import("@/views/client/BlogView.vue"),
                name: "blog",
                meta: {
                    title: "Cinemax",
                    requiresAuth: false,
                    breadcrumb: "Lịch Chiếu",
                },
                // Alias routes
                alias: ["/tin-tuc"],
            },
            {
                path: "/news",
                component: () => import("@/views/client/NewsView.vue"),
                name: "new",
                meta: {
                    title: "Cinemax",
                    requiresAuth: false,
                    breadcrumb: "Lịch Chiếu",
                },
                // Alias routes
                alias: ["/tin-tuc"],
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
                alias: ["/ve-chung-toi"],
            },
        ],
    },
];
