<template>
    <dialog
        class="modal"
        :class="{ 'modal-open': authStore.isModalOpen }"
        v-if="authStore.currentTab === 'login'"
    >
        <div class="modal-box">
            <!-- Header -->
            <div class="mb-5 flex items-center justify-between">
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
                    <!-- Error Message -->
                    <div v-if="errorMessage" class="text-center text-error">
                        <span class="text-sm">{{ errorMessage }}</span>
                    </div>
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
                            :class="{ 'input-error': emailError }"
                            required
                        />
                        <div v-if="emailError" class="label">
                            <span class="label-text-alt text-error">{{ emailError }}</span>
                        </div>
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
                        :disabled="authStore.isLoading || !isFormValid"
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
import { reactive, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useToastStore } from "@/stores/app/useToastStore";
import { REGEX } from "@/utils/constants/regex";

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();
const route = useRoute();

const formData = reactive({
    email: "admin@example.com",
    password: "123",
});

const errorMessage = ref("");

const emailError = computed(() => {
    if (formData.email && !REGEX.EMAIL.test(formData.email)) {
        return "Định dạng email không hợp lệ";
    }
    return "";
});

const isFormValid = computed(() => {
    return REGEX.EMAIL.test(formData.email) && formData.password.length > 0;
});

const getSafeRedirectPath = (path) => {
    if (typeof path !== "string") return null;
    if (!path.startsWith("/") || path.startsWith("//")) return null;
    return path;
};

const handleLogin = async () => {
    errorMessage.value = "";
    try {
        await authStore.login({
            email: formData.email,
            password: formData.password,
        });

        const redirectPath = getSafeRedirectPath(
            authStore.consumeLoginRedirect() || route.query.redirect,
        );

        toastStore.success("Đăng nhập thành công!");

        if (redirectPath && redirectPath !== route.fullPath) {
            await router.replace(redirectPath);
        }

        resetForm();
    } catch (err) {
        errorMessage.value = err.response?.data?.message || "Đăng nhập thất bại";
    }
};

const resetForm = () => {
    formData.email = "";
    formData.password = "";
};
</script>
