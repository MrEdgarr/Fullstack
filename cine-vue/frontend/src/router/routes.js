export const routes = [
    {
        path: "/",
        component: () => import("@/layouts/ClientLayout.vue"),
        children: [
            {
                path: "/",
                name: "home",
                component: () => import("@/views/client/HomeView.vue"),
                meta: {
                    title: "Cinemax",
                    requiresAuth: false,
                    breadcrumb: "Trang chủ",
                },
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
                            breadcrumb: (route) =>
                                route.params.slug === "coming-soon"
                                    ? "Phim sắp chiếu"
                                    : "Phim đang chiếu",
                        },
                        alias: ["dang-chieu"],
                    },
                    {
                        path: ":slug(.+-i\\d+)",
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
                    breadcrumb: "Đặt Vé",
                },
            },
            {
                path: "/showtimes",
                component: () => import("@/views/client/ShowtimesView.vue"),
                name: "showtimes",
                meta: {
                    title: "Cinemax",
                    requiresAuth: false,
                    breadcrumb: "Lịch Chiếu",
                },
                alias: ["/lich-chieu"],
            },
            {
                path: "/blog",
                component: () => import("@/views/client/BlogView.vue"),
                name: "blog",
                meta: {
                    title: "Cinemax",
                    requiresAuth: false,
                    breadcrumb: "Blog",
                },
                alias: ["/tin-tuc"],
            },
            {
                path: "/news",
                component: () => import("@/views/client/NewsView.vue"),
                name: "news",
                meta: {
                    title: "Cinemax",
                    requiresAuth: false,
                    breadcrumb: "Tin Tức",
                },
            },
            {
                path: "/about",
                component: () => import("@/views/client/AboutView.vue"),
                name: "about",
                meta: {
                    title: "Cinemax",
                    requiresAuth: false,
                    breadcrumb: "Về Chúng Tôi",
                },
                alias: ["/ve-chung-toi"],
            },
            {
                path: "/profile",
                component: () => import("@/views/client/ProfileView.vue"),
                meta: {
                    title: "Cinemax",
                    requiresAuth: true,
                },
                children: [
                    {
                        path: "",
                        name: "profile",
                        component: () =>
                            import("@/components/features/client/profile/ProfileInfoTab.vue"),
                    },
                    {
                        path: "history",
                        name: "history",
                        component: () =>
                            import("@/components/features/client/profile/ProfileHistoryTab.vue"),
                    },
                ],
            },
        ],
    },
    {
        path: "/admin",
        component: () => import("@/layouts/AdminLayout.vue"),
        meta: {
            title: "CineHub Admin",
            requiresAuth: true,
            requiresAdmin: true,
        },
        children: [
            {
                path: "",
                redirect: "/admin/dashboard",
            },
            {
                path: "dashboard",
                alias: ["overview"],
                name: "admin-dashboard",
                component: () => import("@/views/admin/DashboardView.vue"),
                meta: {
                    title: "Tổng quan Hệ thống - CineHub Admin",
                    headerTitle: "Tổng quan Hệ thống Phân phối",
                    subtitle:
                        "Theo dõi GMV toàn mạng lưới, doanh thu hoa hồng và chỉ số đồng bộ vé thời gian thực",
                    requiresAuth: true,
                    requiresAdmin: true,
                },
            },
            {
                path: "cinemas",
                name: "admin-cinemas",
                component: () => import("@/views/admin/CinemasView.vue"),
                meta: {
                    title: "Mạng lưới Chuỗi & Cụm Rạp - CineHub Admin",
                    headerTitle: "Mạng lưới Chuỗi & Cụm Rạp",
                    subtitle:
                        "Quản lý 7 chuỗi rạp đối tác, 195+ cụm rạp, tỷ lệ hoa hồng và kết nối API",
                    requiresAuth: true,
                    requiresAdmin: true,
                },
            },
            {
                path: "showtimes",
                name: "admin-showtimes",
                component: () => import("@/views/admin/ShowtimesView.vue"),
                meta: {
                    title: "Điều phối Suất Chiếu & Ghế - CineHub Admin",
                    headerTitle: "Điều phối Suất Chiếu & Ghế",
                    subtitle:
                        "Giám sát ma trận suất chiếu đa rạp, tra cứu sơ đồ phòng và tỷ lệ lấp đầy trực tiếp",
                    requiresAuth: true,
                    requiresAdmin: true,
                },
            },
            {
                path: "tickets",
                name: "admin-tickets",
                component: () => import("@/views/admin/TicketsView.vue"),
                meta: {
                    title: "Quản lý Giao dịch & Vé Điện tử - CineHub Admin",
                    headerTitle: "Quản lý Giao dịch & Vé Điện tử",
                    subtitle:
                        "Tra cứu booking code, xuất vé điện tử chuẩn rạp, xử lý lỗi sync và hoàn tiền",
                    requiresAuth: true,
                    requiresAdmin: true,
                },
            },
            {
                path: "movies",
                name: "admin-movies",
                component: () => import("@/views/admin/MoviesView.vue"),
                meta: {
                    title: "Danh mục Phim & Thị phần Rạp - CineHub Admin",
                    headerTitle: "Danh mục Phim & Thị phần Rạp",
                    subtitle:
                        "Phân tích tỷ trọng doanh số giữa CGV, Lotte, BHD, Galaxy theo từng đầu phim",
                    requiresAuth: true,
                    requiresAdmin: true,
                },
            },
            {
                path: "promotions",
                name: "admin-promotions",
                component: () => import("@/views/admin/PromotionsView.vue"),
                meta: {
                    title: "Chiến dịch Khuyến mãi Đa rạp - CineHub Admin",
                    headerTitle: "Chiến dịch Khuyến mãi Đa rạp",
                    subtitle:
                        "Cấu hình voucher flash sale, chương trình đồng giá và tỷ lệ chia sẻ tài trợ",
                    requiresAuth: true,
                    requiresAdmin: true,
                },
            },
            {
                path: "settlement",
                name: "admin-settlement",
                component: () => import("@/views/admin/SettlementView.vue"),
                meta: {
                    title: "Đối soát & Quyết toán Doanh thu - CineHub Admin",
                    headerTitle: "Đối soát & Quyết toán Doanh thu",
                    subtitle:
                        "Báo cáo chu kỳ doanh thu, hoa hồng giữ lại và giải quyết chênh lệch phòng vé",
                    requiresAuth: true,
                    requiresAdmin: true,
                },
            },
        ],
    },
];
