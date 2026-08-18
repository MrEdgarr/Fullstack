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
                    :disabled="authStore.isLoading"
                    @click="authStore.closeModal"
                >
                    <BaseIcon name="close" />
                </button>
            </div>
            <!-- Form -->
            <form @submit.prevent="handleRegister">
                <fieldset class="fieldset" :disabled="authStore.isLoading">
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
                    <!-- Phone -->
                    <div class="form-control">
                        <div class="label">
                            <span class="label-text">Số điện thoại</span>
                        </div>
                        <input
                            v-model="formData.phone"
                            type="tel"
                            placeholder="0901234567"
                            class="input input-bordered w-full"
                            pattern="[0-9]{10,11}"
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
                        :disabled="authStore.isLoading || !isFormValid"
                    >
                        {{ authStore.isLoading ? "Đang xử lý..." : "Đăng ký" }}
                    </button>
                    <!-- Login link -->
                    <p class="text-center text-sm pt-5">
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
import { reactive, computed } from "vue";
import { useAuthStore } from "@/stores/auth/useAuthStore";
const authStore = useAuthStore();

const formData = reactive({
    fullName: "",
    email: "",
    phone: "",
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
        /^[0-9]{10,11}$/.test(formData.phone) &&
        formData.password.length >= 8 &&
        formData.password === formData.confirmPassword &&
        formData.agreeToTerms
    );
});

const handleRegister = async () => {
    if (!isFormValid.value) {
        return;
    }

    try {
        await authStore.register({
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
        });

        formData.fullName = "";
        formData.email = "";
        formData.phone = "";
        formData.password = "";
        formData.confirmPassword = "";
        formData.agreeToTerms = false;

        alert("Đăng ký thành công!");
    } catch (error) {
        console.error("Register error:", error);
        alert(error.response?.data?.message || "Đăng ký thất bại!");
    }
};
</script>
