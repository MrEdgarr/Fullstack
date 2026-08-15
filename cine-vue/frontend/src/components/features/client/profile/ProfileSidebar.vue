<template>
    <aside class="card bg-base-100 border-base-300 h-fit self-start border">
        <div class="card-body items-center text-center">
            <div class="avatar">
                <div class="h-24 w-24 rounded-full">
                    <img :src="avatarUrl" :alt="displayName" />
                </div>
            </div>

            <div>
                <h2 class="text-xl font-bold">{{ displayName }}</h2>
                <p class="text-base-content/70 text-sm">{{ user?.email }}</p>
            </div>

            <button class="btn btn-outline btn-sm mt-2" @click="handleLogout">
                Đăng xuất
            </button>
        </div>
    </aside>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth/useAuthStore";

const authStore = useAuthStore();
const router = useRouter();

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=CineMax&background=0f172a&color=ffffff";

const user = computed(() => authStore.user);
const displayName = computed(() => user.value?.full_name || "Người dùng CineMax");
const avatarUrl = computed(() => user.value?.avatar_url || DEFAULT_AVATAR);

const handleLogout = async () => {
    authStore.logout();
    await router.replace("/");
};
</script>
