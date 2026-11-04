<template>
    <header
        class="sticky top-0 z-30 bg-base-100/95 backdrop-blur border-b border-base-300 px-4 sm:px-6 py-3 transition-all"
    >
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
            <div class="flex items-center gap-3 min-w-0">
                <button
                    @click="cinemaStore.toggleMobileSidebar"
                    class="btn btn-sm btn-ghost btn-square text-neutral-800 hover:text-black lg:hidden shrink-0"
                    aria-label="Mở menu điều hướng"
                >
                    <BaseIcon name="bars" size="20" />
                </button>

                <div class="min-w-0 flex-1">
                    <div
                        class="flex items-center gap-2 text-[11px] sm:text-xs text-neutral-500 font-medium mb-0.5 truncate"
                    >
                        <span class="hidden sm:inline">CineHub Platform</span>
                        <span class="hidden sm:inline" aria-hidden="true">/</span>
                        <span class="text-black font-bold capitalize truncate">{{
                            String(route.name || "overview")
                                .replace("admin-", "")
                                .replace("-", " ")
                        }}</span>
                        <span aria-hidden="true">·</span>
                        <span class="text-black font-semibold flex items-center gap-1 shrink-0">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span class="hidden xs:inline">Live Sync</span>
                        </span>
                    </div>

                    <h1
                        class="text-base sm:text-lg lg:text-xl font-black text-black tracking-tight flex items-center gap-2 truncate"
                    >
                        <span class="truncate">{{ currentTitle }}</span>
                    </h1>
                    <p class="text-[11px] sm:text-xs text-neutral-500 mt-0.5 hidden sm:block truncate">
                        {{ currentSubtitle }}
                    </p>
                </div>
            </div>

            <div class="flex items-center justify-between lg:justify-end gap-2 sm:gap-3 shrink-0">
                <div class="relative flex-1 sm:flex-initial w-full sm:w-48 lg:w-60">
                    <BaseIcon
                        name="search"
                        size="16"
                        class="text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Tìm vé, phim, rạp..."
                        class="input input-sm w-full bg-base-200 text-xs text-black pl-9 border-base-300 focus:outline-black font-medium"
                    />
                </div>

                <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                        @click="cinemaStore.syncAllApis"
                        :disabled="cinemaStore.isSyncingAll"
                        title="Đồng bộ lại cổng dữ liệu các chuỗi rạp"
                        class="btn btn-sm btn-outline text-black border-base-300 hover:bg-base-200 hover:text-black font-bold px-2 sm:px-3"
                    >
                        <BaseIcon
                            name="refresh"
                            size="14"
                            class="shrink-0"
                            :class="{ 'animate-spin': cinemaStore.isSyncingAll }"
                        />
                        <span class="hidden md:inline">Sync Đối tác</span>
                        <span
                            class="text-neutral-500 text-[10px] sm:text-[11px] font-mono font-normal hidden sm:inline"
                            >38ms</span
                        >
                    </button>

                    <div class="relative">
                        <button
                            @click="showNotifications = !showNotifications"
                            class="btn btn-sm btn-outline btn-square border-base-300 text-black hover:bg-base-200"
                            aria-label="Thông báo hệ thống"
                        >
                            <BaseIcon name="bell" size="16" />
                            <span class="badge badge-xs badge-neutral absolute top-1 right-1" />
                        </button>

                        <div
                            v-if="showNotifications"
                            class="absolute right-0 mt-2 w-72 sm:w-80 bg-base-100 border border-base-300 rounded-lg shadow-xl p-3 sm:p-4 text-xs text-neutral-800 z-50"
                        >
                            <div
                                class="flex items-center justify-between pb-2 mb-3 border-b border-base-300"
                            >
                                <span class="font-black text-black">Cập nhật cổng rạp</span>
                                <span class="text-[10px] sm:text-[11px] text-neutral-500 font-mono"
                                    >3 sự kiện mới</span
                                >
                            </div>
                            <div class="space-y-2">
                                <div class="p-2 sm:p-2.5 rounded bg-base-200 border border-base-300">
                                    <p class="font-bold text-black text-xs">CGV Landmark 81</p>
                                    <p class="text-neutral-600 text-[11px] mt-0.5">
                                        Suất chiếu IMAX 19:15 đã bán 88% lượng ghế khả dụng.
                                    </p>
                                    <span class="text-[10px] text-neutral-400 block mt-1"
                                        >2 phút trước</span
                                    >
                                </div>
                                <div class="p-2 sm:p-2.5 rounded bg-base-200 border border-base-300">
                                    <p class="font-bold text-black text-xs">BHD Star Thảo Điền</p>
                                    <p class="text-neutral-600 text-[11px] mt-0.5">
                                        Độ trễ API 148ms, đã kích hoạt retry socket.
                                    </p>
                                    <span class="text-[10px] text-neutral-400 block mt-1"
                                        >8 phút trước</span
                                    >
                                </div>
                                <div class="p-2 sm:p-2.5 rounded bg-base-200 border border-base-300">
                                    <p class="font-bold text-black text-xs">Galaxy Cinema</p>
                                    <p class="text-neutral-600 text-[11px] mt-0.5">
                                        Bổ sung 4 suất chiếu sớm Godzilla x Kong Dolby Atmos.
                                    </p>
                                    <span class="text-[10px] text-neutral-400 block mt-1"
                                        >15 phút trước</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="dropdown dropdown-end pl-1 sm:pl-2 border-l border-base-300 shrink-0">
                        <div
                            tabindex="0"
                            role="button"
                            class="flex items-center gap-2 cursor-pointer select-none"
                        >
                            <div
                                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs ring-1 ring-base-300 overflow-hidden"
                            >
                                <img
                                    v-if="userAvatar"
                                    :src="userAvatar"
                                    :alt="userName"
                                    class="w-full h-full object-cover"
                                />
                                <span v-else>{{ userInitial }}</span>
                            </div>
                            <div class="hidden xl:block text-left">
                                <p class="text-xs font-bold text-black leading-none">{{ userName }}</p>
                                <p class="text-[10px] text-neutral-500 mt-0.5 font-mono">Super Admin</p>
                            </div>
                        </div>

                        <ul
                            tabindex="0"
                            class="dropdown-content menu z-50 p-2 shadow-lg bg-base-100 rounded-lg w-48 border border-base-300 text-xs font-medium mt-2"
                        >
                            <li>
                                <router-link to="/profile" class="py-2 text-black">
                                    <BaseIcon name="user" size="14" />
                                    Hồ sơ cá nhân
                                </router-link>
                            </li>
                            <li>
                                <router-link to="/" class="py-2 text-black">
                                    <BaseIcon name="movie" size="14" />
                                    Xem rạp chiếu
                                </router-link>
                            </li>
                            <div class="divider my-1"></div>
                            <li>
                                <button
                                    @click="handleLogout"
                                    class="text-black hover:bg-base-200 py-2 font-bold"
                                >
                                    <BaseIcon name="logout" size="14" />
                                    Đăng xuất
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useAdminCinemaStore } from "@/stores/admin/useAdminCinemaStore";
import BaseIcon from "@/components/common/BaseIcon.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cinemaStore = useAdminCinemaStore();

const showNotifications = ref(false);
const searchQuery = ref("");

const currentTitle = computed(() => {
    return route.meta.headerTitle || "Tổng quan Hệ thống Phân phối";
});

const currentSubtitle = computed(() => {
    return (
        route.meta.subtitle ||
        "Theo dõi GMV toàn mạng lưới, doanh thu hoa hồng và chỉ số đồng bộ vé thời gian thực"
    );
});

const userName = computed(() => {
    return authStore.user?.full_name || "Huy Nguyen";
});

const userAvatar = computed(() => {
    return authStore.user?.avatar || null;
});

const userInitial = computed(() => {
    const name = userName.value;
    return name ? name.slice(0, 2).toUpperCase() : "AD";
});

const handleLogout = () => {
    authStore.logout();
    router.push("/");
};
</script>
