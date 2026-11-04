<template>
    <div
        class="flex h-screen w-screen bg-base-100 text-base-content overflow-hidden antialiased selection:bg-black selection:text-white"
        data-theme="lofi"
    >
        <AdminSidebar />

        <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-base-100">
            <AdminHeader />

            <main class="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 bg-base-100 pb-20 lg:pb-8">
                <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                    <router-view />
                </div>
            </main>

            <nav
                class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-base-100/95 backdrop-blur border-t border-base-300 flex items-center justify-around py-1.5 px-2 shadow-lg"
            >
                <router-link
                    v-for="item in mobileNavItems"
                    :key="item.path"
                    :to="item.path"
                    class="flex flex-col items-center justify-center py-1 px-2 rounded transition-colors text-center cursor-pointer min-w-14"
                    :class="[
                        route.path === item.path
                            ? 'text-black font-extrabold'
                            : 'text-neutral-500 hover:text-black font-medium',
                    ]"
                >
                    <BaseIcon :name="item.icon" size="16" />
                    <span class="text-[10px] mt-1 tracking-tight">{{ item.label }}</span>
                </router-link>
            </nav>
        </div>
    </div>
</template>

<script setup>
import { watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useAdminCinemaStore } from "@/stores/admin/useAdminCinemaStore";
import AdminSidebar from "@/components/layout/admin/AdminSidebar.vue";
import AdminHeader from "@/components/layout/admin/AdminHeader.vue";
import BaseIcon from "@/components/common/BaseIcon.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cinemaStore = useAdminCinemaStore();

const mobileNavItems = [
    { path: "/admin/dashboard", label: "Tổng quan", icon: "home" },
    { path: "/admin/cinemas", label: "Rạp phim", icon: "building" },
    { path: "/admin/showtimes", label: "Suất chiếu", icon: "calendar" },
    { path: "/admin/tickets", label: "Vé đặt", icon: "ticket" },
    { path: "/admin/movies", label: "Kho phim", icon: "movie" },
];

const verifyAdminSession = () => {
    if (!authStore.checkAuth() || !authStore.isLoggedIn || !authStore.isAdmin) {
        authStore.setLoginRedirect(router.currentRoute.value.fullPath);
        router.replace({ name: "home" }).then(() => {
            authStore.openModal("login");
        });
        return false;
    }
    return true;
};

onMounted(() => {
    if (verifyAdminSession()) {
        cinemaStore.fetchAdminState();
    }
});

watch(
    () => authStore.isLoggedIn,
    (isLoggedIn) => {
        if (!isLoggedIn) {
            router.replace({ name: "home" }).then(() => {
                authStore.openModal("login");
            });
        }
    },
);

watch(
    () => authStore.isAdmin,
    (isAdmin) => {
        if (authStore.isLoggedIn && !isAdmin) {
            router.replace({ name: "home" });
        }
    },
);
</script>
