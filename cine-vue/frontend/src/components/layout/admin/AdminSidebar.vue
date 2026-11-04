<template>
    <div>
        <div
            v-if="cinemaStore.isMobileSidebarOpen"
            @click="cinemaStore.closeMobileSidebar"
            class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
            aria-label="Đóng bảng điều hướng"
        />

        <aside
            :class="[
                'fixed inset-y-0 left-0 z-50 w-72 bg-base-100 border-r border-base-300 flex flex-col justify-between shrink-0 h-full select-none transition-transform duration-200 ease-in-out lg:static lg:w-64 lg:translate-x-0 shadow-xl lg:shadow-none',
                cinemaStore.isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            ]"
        >
            <div class="overflow-y-auto">
                <div class="p-4 sm:p-5 border-b border-base-300 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-9 h-9 rounded-md bg-black text-white flex items-center justify-center shadow-xs shrink-0"
                        >
                            <BaseIcon name="movie" size="20" />
                        </div>
                        <div>
                            <div class="flex items-center gap-1.5">
                                <span class="font-extrabold text-black text-base tracking-tight"
                                    >CineHub</span
                                >
                                <span class="badge badge-sm badge-neutral font-bold font-mono">
                                    Vue 3
                                </span>
                            </div>
                            <p class="text-[11px] text-neutral-500">Multi-Cinema Aggregator</p>
                        </div>
                    </div>

                    <button
                        @click="cinemaStore.closeMobileSidebar"
                        class="btn btn-sm btn-ghost btn-square text-neutral-600 hover:text-black lg:hidden"
                        aria-label="Đóng menu"
                    >
                        <BaseIcon name="close" size="20" />
                    </button>
                </div>

                <div
                    class="px-4 py-3 mx-3 my-3 rounded-lg bg-base-200 border border-base-300 text-xs"
                >
                    <div class="flex items-center justify-between text-neutral-600 mb-1">
                        <span class="text-[11px] font-medium">Hệ thống phân phối</span>
                        <span class="text-black font-semibold flex items-center gap-1 text-[11px]">
                            <span class="w-1.5 h-1.5 rounded-full bg-black" />
                            195 Cụm rạp
                        </span>
                    </div>
                    <div
                        class="flex items-baseline justify-between mt-2 pt-2 border-t border-base-300 text-[11px]"
                    >
                        <span class="text-neutral-500 truncate mr-2">CGV · Lotte · BHD · Galaxy</span>
                        <span class="text-black font-mono font-bold shrink-0">99.8% Sync</span>
                    </div>
                </div>

                <nav class="p-3 space-y-1">
                    <div
                        class="px-3 pb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider"
                    >
                        Điều hành & Phân phối
                    </div>

                    <router-link
                        v-for="item in navItems"
                        :key="item.path"
                        :to="item.path"
                        @click="handleNavClick"
                        class="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all group text-left cursor-pointer border"
                        :class="[
                            route.path === item.path
                                ? 'bg-black text-white border-black shadow-xs font-bold'
                                : 'text-neutral-700 hover:text-black hover:bg-base-200 border-transparent',
                        ]"
                    >
                        <div class="flex items-center gap-3 min-w-0">
                            <BaseIcon
                                :name="item.icon"
                                size="16"
                                class="transition-colors shrink-0"
                                :class="[
                                    route.path === item.path
                                        ? 'text-white'
                                        : 'text-neutral-500 group-hover:text-black',
                                ]"
                            />
                            <span class="truncate">{{ item.label }}</span>
                        </div>

                        <div class="flex items-center gap-1.5 shrink-0 ml-2">
                            <span
                                v-if="item.badge"
                                class="text-[10px] font-mono px-1.5 py-0.5 rounded"
                                :class="[
                                    route.path === item.path
                                        ? 'bg-neutral-800 text-neutral-200'
                                        : 'bg-base-200 text-neutral-700 border border-base-300',
                                ]"
                            >
                                {{
                                    item.path === "/admin/tickets"
                                        ? cinemaStore.openOrdersCount
                                        : item.badge
                                }}
                            </span>
                            <BaseIcon
                                v-if="route.path === item.path"
                                name="chevron-right"
                                size="14"
                                class="text-white"
                            />
                        </div>
                    </router-link>
                </nav>
            </div>

            <div class="border-t border-base-300 bg-base-200 shrink-0">
                <div class="p-3 border-b border-base-300">
                    <router-link
                        to="/"
                        class="btn btn-xs btn-outline border-base-300 text-black hover:bg-black hover:text-white w-full font-bold flex items-center justify-center gap-1.5"
                    >
                        <BaseIcon name="arrow-left" size="12" />
                        <span>Về Trang Người Dùng</span>
                    </router-link>
                </div>
                <div class="p-4 text-xs">
                    <div class="flex items-center justify-between text-neutral-600 mb-1.5">
                        <span class="text-[11px] flex items-center gap-1.5 font-bold text-black">
                            <BaseIcon name="statistical" size="14" class="text-black" />
                            API Gateway
                        </span>
                        <span class="text-[10px] text-black font-mono font-bold">38ms avg</span>
                    </div>
                    <p class="text-[11px] text-neutral-500 leading-snug">
                        CineHub v3.8 · DaisyUI Lofi Monochromatic
                    </p>
                </div>
            </div>
        </aside>
    </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useAdminCinemaStore } from "@/stores/admin/useAdminCinemaStore";
import BaseIcon from "@/components/common/BaseIcon.vue";

const route = useRoute();
const cinemaStore = useAdminCinemaStore();

const navItems = [
    { path: "/admin/dashboard", label: "Tổng quan Hệ thống", icon: "home" },
    { path: "/admin/cinemas", label: "Mạng lưới Chuỗi Rạp", icon: "building", badge: "7 Chuỗi" },
    { path: "/admin/showtimes", label: "Suất Chiếu & Ghế", icon: "calendar" },
    { path: "/admin/tickets", label: "Đơn Hàng & Vé Điện Tử", icon: "ticket", badge: "Live" },
    { path: "/admin/movies", label: "Danh Mục Phim & Thị Phần", icon: "movie" },
    { path: "/admin/promotions", label: "Khuyến Mãi Đa Rạp", icon: "tag" },
    { path: "/admin/settlement", label: "Đối Soát & Quyết Toán", icon: "receipt", badge: "T+1" },
];

function handleNavClick() {
    if (cinemaStore.isMobileSidebarOpen) {
        cinemaStore.closeMobileSidebar();
    }
}
</script>
