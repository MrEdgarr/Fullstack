<template>
    <section class="container py-8">
        <div class="mb-6">
            <h1 class="text-base font-bold md:text-xl">Thông tin cá nhân</h1>
        </div>

        <div class="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside class="card bg-base-100 border-base-300 border shadow-sm">
                <div class="card-body items-center text-center">
                    <div class="avatar">
                        <div class="h-24 w-24 rounded-full">
                            <img :src="previewAvatarUrl" :alt="displayName" />
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

            <div class="card bg-base-100 border-base-300 border shadow-sm">
                <div class="card-body">
                    <div role="tablist" class="tabs tabs-lift">
                        <input
                            v-model="activeTab"
                            type="radio"
                            name="profile_tabs"
                            value="info"
                            role="tab"
                            class="tab"
                            aria-label="Thông tin"
                        />
                        <div role="tabpanel" class="tab-content bg-base-100 border-base-300 p-6">
                            <div v-if="successMessage" class="alert alert-success mb-4 py-2 text-sm">
                                {{ successMessage }}
                            </div>
                            <div v-if="errorMessage" class="alert alert-error mb-4 py-2 text-sm">
                                {{ errorMessage }}
                            </div>

                            <form v-if="isEditing" @submit.prevent="handleSave">
                                <fieldset :disabled="isSaving" class="grid gap-4 md:grid-cols-2">
                                    <label class="form-control">
                                        <span class="label-text mb-1">Họ tên</span>
                                        <input
                                            v-model.trim="form.full_name"
                                            type="text"
                                            class="input w-full"
                                            required
                                            minlength="3"
                                        />
                                    </label>

                                    <label class="form-control">
                                        <span class="label-text mb-1">Email</span>
                                        <input
                                            v-model.trim="form.email"
                                            type="email"
                                            class="input w-full"
                                            required
                                        />
                                    </label>

                                    <label class="form-control">
                                        <span class="label-text mb-1">Số điện thoại</span>
                                        <input
                                            v-model.trim="form.phone"
                                            type="tel"
                                            class="input w-full"
                                            placeholder="Không bắt buộc"
                                        />
                                    </label>

                                    <label class="form-control">
                                        <span class="label-text mb-1">Ngày sinh</span>
                                        <input
                                            v-model="form.date_of_birth"
                                            type="date"
                                            class="input w-full"
                                        />
                                    </label>

                                    <label class="form-control md:col-span-2">
                                        <span class="label-text mb-1">Avatar URL</span>
                                        <input
                                            v-model.trim="form.avatar_url"
                                            type="url"
                                            class="input w-full"
                                            placeholder="https://..."
                                        />
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
                                    <ProfileInfoItem label="Họ tên" :value="displayName" />
                                    <ProfileInfoItem label="Email" :value="user?.email" />
                                    <ProfileInfoItem label="Số điện thoại" :value="user?.phone" />
                                    <ProfileInfoItem
                                        label="Ngày sinh"
                                        :value="formattedBirthDate"
                                    />
                                    <ProfileInfoItem label="Vai trò" :value="roleLabel" />
                                </div>

                                <div class="mt-5 flex justify-end">
                                    <button class="btn btn-primary" @click="startEdit">
                                        Sửa thông tin
                                    </button>
                                </div>
                            </template>
                        </div>

                        <input
                            v-model="activeTab"
                            type="radio"
                            name="profile_tabs"
                            value="history"
                            role="tab"
                            class="tab"
                            aria-label="Lịch sử đặt vé"
                        />
                        <div role="tabpanel" class="tab-content bg-base-100 border-base-300 p-6">
                            <div
                                class="rounded-box border-base-300 bg-base-200/60 border p-6 text-center"
                            >
                                <h3 class="font-semibold">Chưa có lịch sử đặt vé</h3>
                                <p class="text-base-content/70 mt-2 text-sm">
                                    Phần này đã sẵn sàng để kết nối API lịch sử booking sau.
                                </p>
                                <RouterLink to="/showtimes" class="btn btn-primary btn-sm mt-4">
                                    Xem lịch chiếu
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth/useAuthStore";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=CineMax&background=0f172a&color=ffffff";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const activeTab = ref(route.path === "/history" ? "history" : "info");
const isEditing = ref(false);
const isSaving = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const form = reactive({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
    date_of_birth: "",
});

const user = computed(() => authStore.user);
const displayName = computed(() => user.value?.full_name || "Người dùng CineMax");
const avatarUrl = computed(() => user.value?.avatar_url || DEFAULT_AVATAR);
const previewAvatarUrl = computed(() => form.avatar_url || avatarUrl.value);
const roleLabel = computed(() => (user.value?.role === "admin" ? "Quản trị viên" : "Khách hàng"));
const formattedBirthDate = computed(() => formatDate(user.value?.date_of_birth));

const syncFormWithUser = () => {
    form.full_name = user.value?.full_name || "";
    form.email = user.value?.email || "";
    form.phone = user.value?.phone || "";
    form.avatar_url = user.value?.avatar_url || "";
    form.date_of_birth = toDateInputValue(user.value?.date_of_birth);
};

const startEdit = () => {
    successMessage.value = "";
    errorMessage.value = "";
    syncFormWithUser();
    isEditing.value = true;
};

const cancelEdit = () => {
    syncFormWithUser();
    isEditing.value = false;
    errorMessage.value = "";
};

const handleSave = async () => {
    isSaving.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    try {
        await authStore.updateProfile({
            full_name: form.full_name,
            email: form.email,
            phone: form.phone || null,
            avatar_url: form.avatar_url || null,
            date_of_birth: form.date_of_birth || null,
        });

        isEditing.value = false;
        successMessage.value = "Cập nhật thông tin thành công.";
    } catch (error) {
        errorMessage.value = getProfileErrorMessage(error);
    } finally {
        isSaving.value = false;
    }
};

const handleLogout = async () => {
    authStore.logout();
    await router.replace("/");
};

const getProfileErrorMessage = (error) => {
    const message = error.response?.data?.message;

    if (message === "Email already exists") {
        return "Email này đã được sử dụng bởi tài khoản khác.";
    }

    if (message === "Validation error") {
        return "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.";
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

watch(
    () => route.path,
    (path) => {
        activeTab.value = path === "/history" ? "history" : "info";
    },
);

watch(user, syncFormWithUser, { immediate: true });

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

const ProfileInfoItem = defineComponent({
    props: {
        label: {
            type: String,
            required: true,
        },
        value: {
            type: [String, Number],
            default: "",
        },
    },
    setup(props) {
        return () =>
            h("div", { class: "rounded-box border-base-300 border p-4" }, [
                h("div", { class: "text-base-content/60 text-sm" }, props.label),
                h("div", { class: "mt-1 font-medium" }, props.value || "Chưa cập nhật"),
            ]);
    },
});
</script>
