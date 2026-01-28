export const routes = [
    {
        path: '/',
        component: () => import('@/layouts/ClientLayout.vue'),
        children: [
            {
                path: '/',
                component: () => import('@/views/client/HomeView.vue'),
                meta: {
                    title: 'Trang chủ',
                    requiresAuth: false,
                    breadcrumb: 'Trang chủ',
                },
                // Alias routes
                alias: ['/home', '/trang-chu'],
            },
        ],
    },
]
