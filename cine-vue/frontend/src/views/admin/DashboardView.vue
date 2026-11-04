<template>
    <div class="space-y-6">
        <div
            class="p-4 rounded-lg bg-base-100 border border-base-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
        >
            <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-md bg-base-200 flex items-center justify-center text-black shrink-0 border border-base-300"
                >
                    <BaseIcon name="flame" size="20" class="text-black" />
                </div>
                <div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <h3 class="text-sm font-black text-black">
                            Cao điểm phòng vé: Lễ hội phim bom tấn đang diễn ra
                        </h3>
                        <span class="text-xs text-neutral-600 font-mono font-bold"
                            >· +28.4% tốc độ đặt vé</span
                        >
                    </div>
                    <p class="text-xs text-neutral-500 mt-0.5">
                        Phim "Dune 2" và "Mai" đang chiếm hơn 72% lưu lượng đặt chỗ. Cổng thanh toán
                        VietQR & MoMo phản hồi dưới 1.2s.
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
                <button
                    @click="router.push('/admin/showtimes')"
                    class="btn btn-sm btn-neutral text-white font-bold"
                >
                    <span>Sơ đồ ghế trực tiếp</span>
                </button>
                <button
                    @click="router.push('/admin/tickets')"
                    class="btn btn-sm btn-outline text-black border-base-300 hover:bg-base-200"
                >
                    Sổ vé điện tử
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-5 rounded-lg bg-base-100 border border-base-300 shadow-xs">
                <div class="flex items-center justify-between text-neutral-500 text-xs mb-2">
                    <span class="font-bold">Tổng GMV Phòng Vé Hôm Nay</span>
                    <span class="text-black flex items-center gap-0.5 font-bold font-mono">
                        <BaseIcon name="trend-up" size="14" /> +14.8%
                    </span>
                </div>
                <div class="text-2xl font-black text-black tracking-tight font-mono">
                    {{ cinemaStore.totalGmvToday.toLocaleString("vi-VN") }}
                    <span class="text-sm font-normal text-neutral-500">₫</span>
                </div>
                <div
                    class="mt-3 pt-3 border-t border-base-200 flex items-center justify-between text-[11px] text-neutral-500 font-mono"
                >
                    <span>Toàn bộ 7 chuỗi rạp</span>
                    <span class="text-black font-bold">Tăng trưởng liên tục</span>
                </div>
            </div>

            <div class="p-5 rounded-lg bg-base-100 border border-base-300 shadow-xs">
                <div class="flex items-center justify-between text-neutral-500 text-xs mb-2">
                    <span class="font-bold">Doanh thu Hoa hồng Nền tảng</span>
                    <span class="text-black flex items-center gap-0.5 font-bold font-mono">
                        <BaseIcon name="trend-up" size="14" /> +16.2%
                    </span>
                </div>
                <div class="text-2xl font-black text-black tracking-tight font-mono">
                    {{ Math.round(cinemaStore.totalCommissionRevenue).toLocaleString("vi-VN") }}
                    <span class="text-sm font-normal text-neutral-500">₫</span>
                </div>
                <div
                    class="mt-3 pt-3 border-t border-base-200 flex items-center justify-between text-[11px] text-neutral-500 font-mono"
                >
                    <span>Hoa hồng trung bình</span>
                    <span class="text-black font-bold"
                        >{{ cinemaStore.averageCommissionRate.toFixed(2) }}% net</span
                    >
                </div>
            </div>

            <div class="p-5 rounded-lg bg-base-100 border border-base-300 shadow-xs">
                <div class="flex items-center justify-between text-neutral-500 text-xs mb-2">
                    <span class="font-bold">Tổng Vé Xuất Thành Công</span>
                    <span class="text-black flex items-center gap-1 font-mono font-bold">
                        <BaseIcon name="ticket" size="14" /> Live
                    </span>
                </div>
                <div class="text-2xl font-black text-black tracking-tight font-mono">
                    {{ cinemaStore.totalTicketsToday.toLocaleString("vi-VN") }}
                    <span class="text-sm font-normal text-neutral-500">vé</span>
                </div>
                <div
                    class="mt-3 pt-3 border-t border-base-200 flex items-center justify-between text-[11px] text-neutral-500 font-mono"
                >
                    <span>Giá vé TB: 98.400 ₫</span>
                    <span class="text-black font-bold">Lấp đầy 78.4%</span>
                </div>
            </div>

            <div class="p-5 rounded-lg bg-base-100 border border-base-300 shadow-xs">
                <div class="flex items-center justify-between text-neutral-500 text-xs mb-2">
                    <span class="font-bold">Độ trễ API Gateway Rạp</span>
                    <span class="text-black flex items-center gap-1 font-mono font-bold">
                        <BaseIcon name="statistical" size="14" /> 99.82% Up
                    </span>
                </div>
                <div
                    class="text-2xl font-black text-black tracking-tight flex items-baseline gap-2 font-mono"
                >
                    46 <span class="text-sm font-normal text-neutral-500">ms TB</span>
                </div>
                <div
                    class="mt-3 pt-3 border-t border-base-200 flex items-center justify-between text-[11px] text-neutral-500 font-mono"
                >
                    <span>7/7 Cổng kết nối</span>
                    <span class="text-black font-bold">Tất cả ổn định</span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 p-5 rounded-lg bg-base-100 border border-base-300 shadow-xs">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-sm font-extrabold text-black">
                            Doanh số GMV theo Chuỗi Rạp Đối Tác
                        </h3>
                        <p class="text-xs text-neutral-500">
                            Tỷ trọng bán vé hôm nay xuyên suốt 7 hệ thống rạp tích hợp
                        </p>
                    </div>
                    <button
                        @click="router.push('/admin/cinemas')"
                        class="text-xs text-black font-bold hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                    >
                        <span>Xem chi tiết cụm rạp</span>
                        <BaseIcon name="arrow-up-right" size="14" />
                    </button>
                </div>

                <div class="space-y-4">
                    <div v-for="chain in cinemaStore.chains" :key="chain.id" class="space-y-1.5">
                        <div class="flex items-center justify-between text-xs">
                            <div class="flex items-center gap-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-black" />
                                <span class="font-bold text-black">{{ chain.name }}</span>
                                <span class="text-neutral-400 font-mono text-[11px]"
                                    >({{ chain.code }})</span
                                >
                                <span class="text-neutral-300">·</span>
                                <span class="text-neutral-500"
                                    >{{ chain.totalMultiplexes }} cụm rạp</span
                                >
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-neutral-500 font-mono"
                                    >{{ chain.todayTickets.toLocaleString("vi-VN") }} vé</span
                                >
                                <span class="font-bold text-black font-mono">
                                    {{ chain.todayGmv.toLocaleString("vi-VN") }} ₫
                                </span>
                                <span class="text-black font-mono font-bold w-10 text-right">
                                    {{
                                        Math.round(
                                            (chain.todayGmv / cinemaStore.totalGmvToday) * 100,
                                        )
                                    }}%
                                </span>
                            </div>
                        </div>

                        <div
                            class="w-full h-2 rounded-full bg-base-200 overflow-hidden border border-base-300"
                        >
                            <div
                                class="h-full rounded-full bg-black transition-all duration-500"
                                :style="{
                                    width: `${Math.round((chain.todayGmv / cinemaStore.totalGmvToday) * 100)}%`,
                                }"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="p-5 rounded-lg bg-base-100 border border-base-300 shadow-xs flex flex-col justify-between"
            >
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-sm font-extrabold text-black">
                                Kết Nối Cổng Dữ Liệu Rạp
                            </h3>
                            <p class="text-xs text-neutral-500">Trạng thái đồng bộ chỗ & vé</p>
                        </div>
                        <span class="w-2 h-2 rounded-full bg-black" />
                    </div>

                    <div class="space-y-2.5">
                        <div
                            v-for="chain in cinemaStore.chains"
                            :key="chain.id"
                            class="flex items-center justify-between p-2.5 rounded-md bg-base-200 border border-base-300 text-xs"
                        >
                            <div class="flex items-center gap-2.5">
                                <div
                                    class="w-6 h-6 rounded bg-black text-white flex items-center justify-center text-[10px] font-bold font-mono shrink-0"
                                >
                                    {{ chain.code }}
                                </div>
                                <div>
                                    <p class="font-bold text-black">{{ chain.name }}</p>
                                    <p
                                        class="text-[10px] text-neutral-500 truncate max-w-[140px] font-mono"
                                    >
                                        {{ chain.syncProtocol }}
                                    </p>
                                </div>
                            </div>

                            <div class="text-right">
                                <div class="flex items-center justify-end gap-1.5 font-mono">
                                    <BaseIcon name="check-circle" size="14" class="text-black" />
                                    <span class="font-bold text-black">{{ chain.latencyMs }}ms</span>
                                </div>
                                <span class="text-[10px] text-neutral-500">
                                    Hoa hồng {{ chain.commissionRate }}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="mt-4 pt-3 border-t border-base-300 text-[11px] text-neutral-500 flex items-center justify-between"
                >
                    <span>Chu kỳ đối soát T+1</span>
                    <button
                        @click="router.push('/admin/settlement')"
                        class="text-black font-bold hover:underline transition-colors cursor-pointer"
                    >
                        Xem quyết toán rạp →
                    </button>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="p-5 rounded-lg bg-base-100 border border-base-300 shadow-xs">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-sm font-extrabold text-black">
                            Top Phim Ăn Khách Toàn Hệ Thống
                        </h3>
                        <p class="text-xs text-neutral-500">
                            Doanh thu tích lũy được phân phối qua nền tảng CineHub
                        </p>
                    </div>
                    <button
                        @click="router.push('/admin/movies')"
                        class="text-xs text-black font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        <span>Tất cả phim</span>
                        <BaseIcon name="arrow-up-right" size="14" />
                    </button>
                </div>

                <div class="space-y-3">
                    <div
                        v-for="(movie, idx) in cinemaStore.movies.slice(0, 4)"
                        :key="movie.id"
                        class="flex items-center gap-3.5 p-3 rounded-md bg-base-200 border border-base-300 hover:border-black transition-all"
                    >
                        <div class="text-base font-black text-black font-mono w-5">
                            0{{ idx + 1 }}
                        </div>
                        <img
                            :src="movie.posterUrl"
                            :alt="movie.title"
                            class="w-12 h-16 object-cover rounded shadow-xs shrink-0 border border-base-300"
                        />
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-black text-xs truncate">
                                    {{ movie.title }}
                                </h4>
                                <span class="badge badge-xs badge-neutral font-mono font-bold">
                                    {{ movie.ageRating }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
                                <span>{{ movie.durationMinutes }} phút</span>
                                <span>·</span>
                                <span>{{ movie.genre.slice(0, 2).join(", ") }}</span>
                            </div>
                            <div class="flex items-center gap-3 mt-1.5 text-[11px]">
                                <span class="text-neutral-700 font-mono font-medium">
                                    {{ movie.totalTickets.toLocaleString("vi-VN") }} vé
                                </span>
                                <span class="text-black font-extrabold font-mono">
                                    {{ (movie.totalGmv / 1000000000).toFixed(2) }} tỷ ₫
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-5 rounded-lg bg-base-100 border border-base-300 shadow-xs">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-sm font-extrabold text-black">
                            Giao Dịch Đặt Vé Thời Gian Thực
                        </h3>
                        <p class="text-xs text-neutral-500">
                            Các đơn vé phát hành thành công từ người dùng
                        </p>
                    </div>
                    <button
                        @click="router.push('/admin/tickets')"
                        class="text-xs text-black font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        <span>Xem sổ vé</span>
                        <BaseIcon name="arrow-up-right" size="14" />
                    </button>
                </div>

                <div class="space-y-2.5">
                    <div
                        v-for="order in cinemaStore.orders"
                        :key="order.id"
                        @click="handleInspectOrder(order)"
                        class="flex items-center justify-between p-3 rounded-md bg-base-200 border border-base-300 hover:border-black hover:bg-base-100 transition-all cursor-pointer group"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-8 h-8 rounded-md bg-base-300 flex items-center justify-center text-black font-mono text-xs font-bold shrink-0"
                            >
                                <BaseIcon name="ticket" size="16" />
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <span
                                        class="font-mono text-xs font-bold text-black group-hover:underline"
                                    >
                                        {{ order.id }}
                                    </span>
                                    <span class="text-neutral-300">·</span>
                                    <span class="text-xs font-semibold text-neutral-800">{{
                                        order.chainName
                                    }}</span>
                                </div>
                                <p class="text-[11px] text-neutral-500 mt-0.5">
                                    {{ order.movieTitle }} · Ghế: {{ order.seats.join(", ") }} ({{
                                        order.format
                                    }})
                                </p>
                            </div>
                        </div>

                        <div class="text-right">
                            <span class="font-mono font-black text-xs text-black block">
                                {{ order.totalAmount.toLocaleString("vi-VN") }} ₫
                            </span>
                            <span class="text-[10px] text-neutral-500 font-mono">
                                Hoa hồng +{{ order.platformCommission.toLocaleString("vi-VN") }} ₫
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAdminCinemaStore } from "@/stores/admin/useAdminCinemaStore";
import BaseIcon from "@/components/common/BaseIcon.vue";

const router = useRouter();
const cinemaStore = useAdminCinemaStore();

function handleInspectOrder(order) {
    cinemaStore.selectedOrder = order;
    router.push("/admin/tickets");
}
</script>
