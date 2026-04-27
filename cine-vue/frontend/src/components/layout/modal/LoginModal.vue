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
                    @click="authStore.closeModal"
                >
                    <BaseIcon name="close" />
                </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleLogin">
                <fieldset class="fieldset">
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
                        <div class="my-2 flex items-center justify-between">
                            <label class="label cursor-pointer">
                                <input
                                    v-model="formData.rememberMe"
                                    type="checkbox"
                                    class="checkbox checkbox-primary checkbox-xs"
                                />
                                <span class="text-sm">Ghi nhớ đăng nhập</span>
                            </label>
                            <label class="label">
                                <a href="#" class="link link-hover text-sm">Quên mật khẩu?</a>
                            </label>
                        </div>
                    </div>
                    <!-- Submit button -->
                    <button
                        type="submit"
                        class="btn btn-primary w-full"
                        :class="{ loading: authStore.isLoading }"
                        :disabled="authStore.isLoading"
                    >
                        {{ authStore.isLoading ? "Đang xử lý..." : "Đăng nhập" }}
                    </button>
                    <!-- Divider -->
                    <div class="divider">HOẶC</div>
                    <!-- Social login -->
                    <div class="mb-5 space-y-2">
                        <button type="button" class="btn btn-outline w-full">
                            <svg class="icon-base h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Đăng nhập với Google
                        </button>

                        <button type="button" class="btn btn-outline w-full">
                            <svg
                                class="icon-base h-5 w-5"
                                viewBox="0 0 256 256"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M256 128C256 57.308 198.692 0 128 0C57.308 0 0 57.307 0 128c0 63.888 46.808 116.843 108 126.445V165H75.5v-37H108V99.8c0-32.08 19.11-49.8 48.347-49.8C170.352 50 185 52.5 185 52.5V84h-16.14C152.958 84 148 93.867 148 103.99V128h35.5l-5.675 37H148v89.445c61.192-9.602 108-62.556 108-126.445"
                                    fill="#1877F2"
                                />
                                <path
                                    d="m177.825 165l5.675-37H148v-24.01C148 93.866 152.959 84 168.86 84H185V52.5S170.352 50 156.347 50C127.11 50 108 67.72 108 99.8V128H75.5v37H108v89.445A128.959 128.959 0 0 0 128 256a128.9 128.9 0 0 0 20-1.555V165h29.825"
                                    fill="#FFF"
                                />
                            </svg>
                            Đăng nhập với Facebook
                        </button>
                    </div>

                    <!-- Register link -->
                    <p class="text-center text-sm">
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

const formData = reactive({
    email: "nva@gmail.com",
    password: "123",
});

const handleLogin = async () => {
    try {
        await authStore.login({
            email: formData.email,
            password: formData.password,
        });
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
