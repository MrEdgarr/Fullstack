<template>
    <div class="space-y-4">
        <div v-if="successMessage" class="alert alert-success py-2 text-sm">
            {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="alert alert-error py-2 text-sm">
            {{ errorMessage }}
        </div>

        <form v-if="isEditing" @submit.prevent="handleSave">
            <fieldset :disabled="isSaving" class="grid gap-4 md:grid-cols-2">
                <label class="form-control">
                    <span class="text-base-content/75 text-xs">Họ tên</span>
                    <input
                        v-model.trim="form.full_name"
                        type="text"
                        class="input w-full"
                        required
                        minlength="3"
                    />
                </label>

                <label class="form-control">
                    <span class="text-base-content/75 text-xs">Email</span>
                    <input
                        v-model.trim="form.email"
                        type="email"
                        class="input w-full"
                        required
                    />
                </label>

                <label class="form-control">
                    <span class="text-base-content/75 text-xs">Số điện thoại</span>
                    <input
                        v-model.trim="form.phone"
                        type="tel"
                        class="input w-full"
                        placeholder="Không bắt buộc"
                    />
                </label>

                <label class="form-control">
                    <span class="text-base-content/75 text-xs">Ngày sinh</span>
                    <input
                        v-model="form.date_of_birth"
                        type="date"
                        class="input w-full"
                    />
                </label>

                <label class="form-control md:col-span-2">
                    <span class="text-base-content/75 text-xs">Ảnh đại diện</span>
                    <input
                        type="file"
                        accept="image/*"
                        class="file-input w-full"
                        @change="handleAvatarChange"
                    />
                    <span class="text-base-content/60 mt-1 text-xs">
                        Chọn ảnh JPG, PNG hoặc WebP. Dung lượng tối đa 5MB.
                    </span>
                </label>
            </fieldset>

            <div class="mt-5 flex justify-end gap-2">
                <button
                    type="button"
                    class="btn btn-ghost"
                    :disabled="isSaving"
                    @click="cancelEdit"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="isSaving"
                >
                    <span
                        v-if="isSaving"
                        class="loading loading-spinner loading-sm"
                    ></span>
                    {{ isSaving ? "Đang lưu..." : "Lưu thay đổi" }}
                </button>
            </div>
        </form>

        <template v-else>
            <div class="grid gap-4 md:grid-cols-2">
                <div
                    v-for="item in profileItems"
                    :key="item.label"
                    class="rounded-box border-base-300 border p-4"
                >
                    <div class="text-base-content/60 text-sm">
                        {{ item.label }}
                    </div>
                    <div class="mt-1 font-medium">
                        {{ item.value || "Chưa cập nhật" }}
                    </div>
                </div>
            </div>

            <div class="mt-5 flex justify-end">
                <button class="btn btn-primary" @click="startEdit">
                    Sửa thông tin
                </button>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth/useAuthStore";

const authStore = useAuthStore();
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const isEditing = ref(false);
const isSaving = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const selectedAvatarFile = ref(null);
const selectedAvatarPreview = ref("");

const form = reactive({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
});

const user = computed(() => authStore.user);
const displayName = computed(() => user.value?.full_name || "Người dùng CineMax");
const roleLabel = computed(() => (user.value?.role === "admin" ? "Quản trị viên" : "Khách hàng"));
const formattedBirthDate = computed(() => formatDate(user.value?.date_of_birth));

const profileItems = computed(() => [
    {
        label: "Họ tên",
        value: displayName.value,
    },
    {
        label: "Email",
        value: user.value?.email,
    },
    {
        label: "Số điện thoại",
        value: user.value?.phone,
    },
    {
        label: "Ngày sinh",
        value: formattedBirthDate.value,
    },
    {
        label: "Vai trò",
        value: roleLabel.value,
    },
]);

const syncFormWithUser = () => {
    form.full_name = user.value?.full_name || "";
    form.email = user.value?.email || "";
    form.phone = user.value?.phone || "";
    form.date_of_birth = toDateInputValue(user.value?.date_of_birth);
};

const startEdit = () => {
    successMessage.value = "";
    errorMessage.value = "";
    clearSelectedAvatar();
    syncFormWithUser();
    isEditing.value = true;
};

const cancelEdit = () => {
    syncFormWithUser();
    clearSelectedAvatar();
    isEditing.value = false;
    errorMessage.value = "";
};

const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    clearSelectedAvatar();

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        errorMessage.value = "Vui lòng chọn đúng file hình ảnh.";
        event.target.value = "";
        return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
        errorMessage.value = "Ảnh đại diện không được vượt quá 5MB.";
        event.target.value = "";
        return;
    }

    errorMessage.value = "";
    selectedAvatarFile.value = file;
    selectedAvatarPreview.value = URL.createObjectURL(file);
};

const clearSelectedAvatar = () => {
    if (selectedAvatarPreview.value) {
        URL.revokeObjectURL(selectedAvatarPreview.value);
    }

    selectedAvatarFile.value = null;
    selectedAvatarPreview.value = "";
};

const handleSave = async () => {
    isSaving.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    try {
        await authStore.updateProfile(
            {
                full_name: form.full_name,
                email: form.email,
                phone: form.phone || null,
                date_of_birth: form.date_of_birth || null,
            },
            selectedAvatarFile.value,
        );

        clearSelectedAvatar();
        isEditing.value = false;
        successMessage.value = "Cập nhật thông tin thành công.";
    } catch (error) {
        errorMessage.value = getProfileErrorMessage(error);
    } finally {
        isSaving.value = false;
    }
};

const getProfileErrorMessage = (error) => {
    const message = error.response?.data?.message;

    if (message === "Email already exists") {
        return "Email này đã được sử dụng bởi tài khoản khác.";
    }

    if (message === "Validation error") {
        return "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.";
    }

    if (message === "Avatar must be an image") {
        return "Vui lòng chọn đúng file hình ảnh.";
    }

    return message || "Không thể cập nhật thông tin. Vui lòng thử lại.";
};

const toDateInputValue = (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
};

const formatDate = (value) => {
    if (!value) return "";
    return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
};

watch(user, syncFormWithUser, { immediate: true });

onBeforeUnmount(clearSelectedAvatar);
</script>
