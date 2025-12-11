export const routes = [
    {
        path: '/',
        component: () => import('@/layouts/ClientLayout.vue'),
        children: [
            {
                path: '/',
                component: () => import('@/views/client/HomeView.vue'),
            },
        ],
    },
]
