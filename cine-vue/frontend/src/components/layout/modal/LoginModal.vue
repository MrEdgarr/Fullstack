<template>
    <dialog
        class="modal"
        :class="{ 'modal-open': authStore.isModalOpen }"
        v-if="authStore.currentTab === 'login'"
    >
        <div class="modal-box">
            <!-- Header -->
            <div class="mb-6 flex items-center justify-between">
                <h3 class="text-2xl font-bold">Đăng nhập</h3>
                <button
                    class="btn btn-sm btn-circle btn-ghost"
                    aria-label="Đóng"
                    :disabled="authStore.isLoading"
                    @click="authStore.closeModal"
                >
                    <BaseIcon name="close" />
                </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleLogin">
                <fieldset class="fieldset" :disabled="authStore.isLoading">
                    <!-- Email -->
                    <div class="form-control">
                        <div class="label">
                            <span class="label-text">Email</span>
                        </div>
                        <input
                            v-model="formData.email"
                            type="email"
                            name="email"
                            placeholder="email@example.com"
                            class="input w-full"
                            required
                        />
                    </div>
                    <!-- Password -->
                    <div class="form-control">
                        <div class="label">
                            <span class="label-text">Mật khẩu</span>
                        </div>
                        <input
                            v-model="formData.password"
                            type="password"
                            name="password"
                            placeholder="Nhập mật khẩu"
                            class="input w-full"
                            required
                        />
                    </div>
                    <!-- Remember me -->
                    <div class="form-control">
                        <div class="my-2 flex items-center justify-end">
                            <label class="label">
                                <a href="#" class="link link-hover text-sm">Quên mật khẩu?</a>
                            </label>
                        </div>
                    </div>
                    <!-- Submit button -->
                    <button
                        type="submit"
                        class="btn btn-primary w-full"
                        :disabled="authStore.isLoading"
                    >
                        {{ authStore.isLoading ? "Đang xử lý..." : "Đăng nhập" }}
                    </button>
                    <!-- Register link -->
                    <p class="text-center text-sm pt-5">
                        Chưa có tài khoản?
                        <button
                            type="button"
                            @click="authStore.openModal('register')"
                            class="link link-primary font-semibold"
                        >
                            Đăng ký ngay
                        </button>
                    </p>
                </fieldset>
            </form>
        </div>
        <!-- Backdrop -->
        <!-- <form method="dialog" class="modal-backdrop">
            <button @click="closeLoginModal">close</button>
        </form> -->
    </dialog>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth/useAuthStore";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const formData = reactive({
    email: "admin@example.com",
    password: "123",
});

const getSafeRedirectPath = (path) => {
    if (typeof path !== "string") return null;
    if (!path.startsWith("/") || path.startsWith("//")) return null;
    return path;
};

const handleLogin = async () => {
    try {
        await authStore.login({
            email: formData.email,
            password: formData.password,
        });

        const redirectPath = getSafeRedirectPath(
            authStore.consumeLoginRedirect() || route.query.redirect,
        );

        if (redirectPath && redirectPath !== route.fullPath) {
            await router.replace(redirectPath);
        }

        resetForm();
    } catch (err) {
        alert(err.response?.data?.message || "Đăng nhập thất bại");
    }
};

const resetForm = () => {
    formData.email = "";
    formData.password = "";
};
</script>
