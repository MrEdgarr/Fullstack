<template>
    <dialog
        class="modal"
        :class="{ 'modal-open': authStore.isModalOpen }"
        v-if="authStore.currentTab === 'register'"
    >
        <div class="modal-box">
            <!-- Header -->
            <div class="mb-6 flex items-center justify-between">
                <h3 class="text-2xl font-bold">Đăng ký tài khoản</h3>
                <button
                    class="btn btn-sm btn-circle btn-ghost"
                    aria-label="Đóng"
                    @click="authStore.closeModal"
                >
                    <BaseIcon name="close" />
                </button>
            </div>
            <!-- Form -->
            <form @submit.prevent="handleRegister">
                <fieldset class="fieldset">
                    <!-- Full Name -->
                    <div class="form-control">
                        <div class="label">
                            <span class="label-text">Họ và tên</span>
                        </div>
                        <input
                            v-model="formData.fullName"
                            type="text"
                            name="fullname"
                            placeholder="Nguyễn Văn A"
                            class="input w-full"
                            required
                        />
                    </div>
                    <!-- Email -->
                    <div class="form-control">
                        <div class="label">
                            <span class="label-text">Email</span>
                        </div>
                        <input
                            v-model="formData.email"
                            type="email"
                            placeholder="email@example.com"
                            class="input input-bordered w-full"
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
                            placeholder="Tối thiểu 8 ký tự"
                            class="input input-bordered w-full"
                            :class="{ 'input-error': passwordError }"
                            minlength="8"
                            required
                        />
                        <div v-if="passwordError" class="label">
                            <span class="label-text-alt text-error">{{ passwordError }}</span>
                        </div>
                    </div>
                    <!-- Confirm Password -->
                    <div class="form-control">
                        <div class="label">
                            <span class="label-text">Xác nhận mật khẩu</span>
                        </div>
                        <input
                            v-model="formData.confirmPassword"
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            class="input input-bordered w-full"
                            :class="{ 'input-error': confirmPasswordError }"
                            required
                        />
                        <div v-if="confirmPasswordError" class="label">
                            <span class="label-text-alt text-error">{{
                                confirmPasswordError
                            }}</span>
                        </div>
                    </div>
                    <!-- Terms and conditions -->
                    <div class="form-control">
                        <div class="my-2">
                            <div class="label cursor-pointer justify-start">
                                <input
                                    v-model="formData.agreeToTerms"
                                    type="checkbox"
                                    class="checkbox checkbox-primary checkbox-xs"
                                    required
                                />
                                <div class="label-text text-xs whitespace-normal">
                                    Bằng việc đăng ký tài khoản, tôi đồng ý với
                                    <a href="#" class="link link-primary">Điều khoản dịch vụ</a>
                                    và
                                    <a href="#" class="link link-primary">Chính sách bảo mật</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Submit button -->
                    <button
                        type="submit"
                        class="btn btn-primary w-full"
                        :class="{ loading: isLoading }"
                        :disabled="isLoading || !isFormValid"
                    >
                        {{ isLoading ? "Đang xử lý..." : "Đăng ký" }}
                    </button>
                    <!-- Divider -->
                    <div class="divider">HOẶC</div>
                    <!-- Social register -->
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
                            Đăng ký với Google
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
                            Đăng ký với Facebook
                        </button>
                    </div>
                    <!-- Login link -->
                    <p class="text-center text-sm">
                        Đã có tài khoản?
                        <button
                            type="button"
                            @click="authStore.openModal('login')"
                            class="link link-primary font-semibold"
                        >
                            Đăng nhập ngay
                        </button>
                    </p>
                </fieldset>
            </form>
        </div>
        <!-- Backdrop -->
        <!-- <form method="dialog" class="modal-backdrop">
            <button @click="closeRegisterModal">close</button>
        </form> -->
    </dialog>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useAuthStore } from "@/stores/auth/useAuthStore";
const authStore = useAuthStore();

const isLoading = ref(false);

const formData = reactive({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
});

const passwordError = computed(() => {
    if (formData.password && formData.password.length < 8) {
        return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    return "";
});

const confirmPasswordError = computed(() => {
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        return "Mật khẩu xác nhận không khớp";
    }
    return "";
});

const isFormValid = computed(() => {
    return (
        formData.fullName &&
        formData.email &&
        formData.password.length >= 8 &&
        formData.password === formData.confirmPassword &&
        formData.agreeToTerms
    );
});

const handleRegister = async () => {
    if (!isFormValid.value) {
        return;
    }

    isLoading.value = true;

    try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        console.log("Register data:", {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
        });

        // Reset form
        formData.fullName = "";
        formData.email = "";
        formData.password = "";
        formData.confirmPassword = "";
        formData.agreeToTerms = false;

        closeRegisterModal();

        // Show success message
        alert("Đăng ký thành công!");
    } catch (error) {
        console.error("Register error:", error);
        alert("Đăng ký thất bại!");
    } finally {
        isLoading.value = false;
    }
};
</script>
