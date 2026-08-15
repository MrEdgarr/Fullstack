<template>
    <section class="container py-8">
        <div class="mb-6">
            <h1 class="text-base font-bold md:text-xl">
                {{ isHistory ? "Lịch sử đặt vé" : "Thông tin cá nhân" }}
            </h1>
        </div>

        <div v-if="errorMessage" class="alert alert-error mb-6 py-2 text-sm">
            {{ errorMessage }}
        </div>

        <div class="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <profile-sidebar />

            <div class="card bg-base-100 border-base-300 min-w-0 self-start border">
                <div class="card-body">
                    <div role="tablist" class="tabs tabs-lift">
                        <RouterLink
                            to="/profile"
                            role="tab"
                            class="tab"
                            exact-active-class="tab-active"
                        >
                            Thông tin
                        </RouterLink>

                        <RouterLink
                            to="/profile/history"
                            role="tab"
                            class="tab"
                            exact-active-class="tab-active"
                        >
                            Lịch sử đặt vé
                        </RouterLink>
                    </div>

                    <div
                        class="bg-base-100 border-base-300 rounded-b-box rounded-tr-box p-6 border border-t-0"
                    >
                        <router-view />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import ProfileSidebar from "@/components/features/client/profile/ProfileSidebar.vue";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const errorMessage = ref("");

onMounted(async () => {
    try {
        await authStore.fetchProfile();
    } catch (error) {
        if (error.response?.status === 401) {
            authStore.setLoginRedirect(route.fullPath);
            authStore.openModal("login");
            await router.replace({
                name: "home",
                query: { redirect: route.fullPath },
            });
            return;
        }

        if (error.response?.status === 404) {
            errorMessage.value =
                "Backend hiện tại chưa có API thông tin tài khoản. Hãy deploy lại backend trên Render.";
            return;
        }

        errorMessage.value = "Không thể tải thông tin tài khoản.";
    }
});
</script>
