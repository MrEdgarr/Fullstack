<template>
    <div
        class="bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs h-full flex flex-col justify-between"
    >
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Phim bán chạy nhất
            </h3>

            <button
                type="button"
                class="text-xs font-semibold text-blue-600 border border-blue-200/90 rounded-lg px-3 py-1 hover:bg-blue-50/80 transition-colors cursor-pointer"
            >
                Xem tất cả
            </button>
        </div>

        <div v-if="isLoading" class="flex flex-col gap-4 grow justify-center animate-pulse">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3.5">
                <div class="skeleton w-11 h-11 rounded-xl shrink-0"></div>
                <div class="grow min-w-0 space-y-2">
                    <div class="flex items-center justify-between">
                        <div class="skeleton h-3.5 w-32 rounded-md"></div>
                        <div class="skeleton h-3.5 w-16 rounded-md"></div>
                    </div>
                    <div class="skeleton h-2 w-full rounded-full"></div>
                </div>
            </div>
        </div>

        <div v-else-if="displayedProducts.length > 0" class="flex flex-col gap-4 grow justify-center">
            <div
                v-for="product in displayedProducts"
                :key="product.id"
                class="flex items-center gap-3.5 group"
            >
                <div
                    class="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/60 shadow-2xs"
                >
                    <img
                        v-if="product.image"
                        :src="product.image"
                        :alt="product.name"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                    />
                    <div v-else class="text-slate-400">
                        <BaseIcon name="movie" size="20" />
                    </div>
                </div>

                <div class="grow min-w-0">
                    <div class="flex items-center justify-between mb-1.5">
                        <h4
                            class="text-xs sm:text-sm font-semibold text-slate-800 truncate"
                            :title="product.name"
                        >
                            {{ product.name }}
                        </h4>
                        <span class="text-xs font-medium text-slate-500 whitespace-nowrap ml-2">
                            {{ product.sold }} vé đã bán
                        </span>
                    </div>

                    <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            class="h-full rounded-full transition-all duration-500"
                            :style="{
                                width: `${product.percentage}%`,
                                backgroundColor: product.color,
                            }"
                        ></div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-10 text-slate-400 grow">
            <BaseIcon name="movie" size="32" class="opacity-30 mb-2" />
            <p class="text-xs text-base-content/50">Không có dữ liệu phim trong khoảng thời gian này</p>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import BaseIcon from "@/components/common/BaseIcon.vue";

const props = defineProps({
    isLoading: {
        type: Boolean,
        default: false,
    },
    topMovies: {
        type: Array,
        default: () => [],
    },
    formatNumber: {
        type: Function,
        default: (val) => val,
    },
});

const barColors = ["#0284C7", "#10B981", "#0284C7", "#E11D48", "#8B5CF6"];

const fallbackProducts = [
    {
        id: 1,
        name: "Doraemon: Nobita Và Bản Giao Hưởng Địa Cầu",
        sold: 16,
        percentage: 95,
        color: "#0284C7",
        image: "https://res.cloudinary.com/drcwlcyov/image/upload/q_auto/f_auto/v1779783450/doraemon-tieu-thuyet-nobita-va-ban-giao-huong-dia-cau-bia-62e39c436bdc4343afb79847062df2f2_sbnfgc.jpg",
    },
    {
        id: 2,
        name: "Mission: Impossible - Final Reckoning",
        sold: 12,
        percentage: 75,
        color: "#10B981",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&h=100&fit=crop&q=80",
    },
    {
        id: 3,
        name: "Lật Mặt 9: Vòng Xoáy",
        sold: 8,
        percentage: 55,
        color: "#334155",
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&h=100&fit=crop&q=80",
    },
    {
        id: 4,
        name: "Shin Cậu Bé Bút Chì",
        sold: 4,
        percentage: 35,
        color: "#E11D48",
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=100&h=100&fit=crop&q=80",
    },
];

const displayedProducts = computed(() => {
    if (props.topMovies && props.topMovies.length > 0) {
        const maxSold = Math.max(...props.topMovies.map((m) => Number(m.tickets_sold || 1)), 1);

        return props.topMovies.slice(0, 5).map((movie, idx) => {
            const sold = Number(movie.tickets_sold || 0);
            const percentage = Math.max(15, Math.min(100, Math.round((sold / maxSold) * 100)));

            return {
                id: movie.movie_id || idx,
                name: movie.title || `Phim #${idx + 1}`,
                sold: sold,
                percentage: percentage,
                color: barColors[idx % barColors.length],
                image: movie.poster_url || null,
            };
        });
    }
    if (props.topMovies === null || props.topMovies === undefined) {
        return fallbackProducts;
    }
    return [];
});
</script>
