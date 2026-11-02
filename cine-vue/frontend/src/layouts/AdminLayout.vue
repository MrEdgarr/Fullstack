<template>
    <div class="min-h-screen bg-base-300 flex text-base-content">
        <!-- Sidebar Navigation -->
        <admin-sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

        <!-- Main Wrapper -->
        <div class="flex-1 flex flex-col min-w-0 min-h-screen">
            <!-- Header Bar -->
            <admin-header @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

            <!-- Main Content Area -->
            <main class="flex-1 p-4 sm:p-6 space-y-6">
                <router-view />
            </main>

            <!-- Footer -->
            <admin-footer />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth/useAuthStore";

const isSidebarOpen = ref(false);
const authStore = useAuthStore();
const router = useRouter();

// Tự động kiểm tra và đăng xuất chuyển hướng ra khỏi Admin khi phiên hết hạn
const verifyAdminSession = () => {
    if (!authStore.checkAuth() || !authStore.isLoggedIn || !authStore.isAdmin) {
        authStore.setLoginRedirect(router.currentRoute.value.fullPath);
        router.replace({ name: "home" }).then(() => {
            authStore.openModal("login");
        });
    }
};

onMounted(() => {
    verifyAdminSession();
});

// Giám sát trạng thái đăng nhập thời gian thực
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
