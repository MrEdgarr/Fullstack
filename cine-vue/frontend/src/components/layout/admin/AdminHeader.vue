<template>
    <header class="sticky top-0 z-30 w-full bg-base-100 border-b border-base-300 shadow-xs">
        <div class="px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div class="flex items-center flex-1">
                <div>
                    <button
                        @click="$emit('toggle-sidebar')"
                        type="button"
                        class="btn btn-link btn-xs text-2xl flex lg:hidden"
                        aria-label="Toggle navigation"
                    >
                        <base-icon name="bars" />
                    </button>
                </div>

                <div class="relative w-48 sm:w-72 md:w-96">
                    <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/25"
                    >
                        <base-icon name="search" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm phim, đơn hàng, khách hàng..."
                        class="w-full pl-9 pr-4 py-2 hover:bg-base-200 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-base-300 focus:outline-hidden transition-all"
                    />
                </div>
            </div>

            <div class="flex items-center">
                <button class="relative btn btn-ghost btn-sm" aria-label="Thông báo">
                    <BaseIcon name="bell" size="24" />
                    <span
                        class="absolute top-1 right-3 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"
                    ></span>
                </button>

                <div class="dropdown dropdown-end">
                    <div
                        tabindex="0"
                        role="button"
                        class="flex items-center gap-2.5 p-1 sm:px-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none"
                    >
                        <div
                            class="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 ring-1 ring-slate-300"
                        >
                            <img
                                v-if="userAvatar"
                                :src="userAvatar"
                                :alt="userName"
                                class="w-full h-full object-cover"
                            />
                            <div
                                v-else
                                class="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-xs"
                            >
                                {{ userInitial }}
                            </div>
                        </div>

                        <div class="hidden md:block">
                            <span
                                class="hidden sm:inline-block text-xs sm:text-sm font-semibold text-slate-800"
                            >
                                {{ userName }}
                            </span>

                            <BaseIcon name="chevron-down" />
                        </div>
                    </div>

                    <ul
                        tabindex="0"
                        class="dropdown-content menu z-50 p-2 shadow-lg bg-base-100 rounded-xl w-52 border border-base-200 text-xs sm:text-sm font-medium mt-2"
                    >
                        <li>
                            <router-link to="/profile" class="py-2">
                                <BaseIcon name="user" />
                                Hồ sơ cá nhân
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/" class="py-2">
                                <BaseIcon name="movie" />
                                Xem rạp chiếu
                            </router-link>
                        </li>
                        <div class="divider my-1"></div>
                        <li>
                            <button
                                @click="handleLogout"
                                class="text-rose-500 hover:bg-rose-50 py-2"
                            >
                                <BaseIcon name="logout" />
                                Đăng xuất
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import BaseIcon from "@/components/common/BaseIcon.vue";

defineEmits(["toggle-sidebar"]);

const authStore = useAuthStore();
const router = useRouter();

const userName = computed(() => {
    return authStore.user?.full_name || "Quản trị viên";
});

const userAvatar = computed(() => {
    return authStore.user?.avatar || null;
});

const userInitial = computed(() => {
    const name = userName.value;
    return name ? name.charAt(0).toUpperCase() : "A";
});

const handleLogout = () => {
    authStore.logout();
    router.push("/");
};
</script>
