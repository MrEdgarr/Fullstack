<template>
    <div class="space-y-6">
        <div class="p-4 rounded-lg bg-base-100 border border-base-300 shadow-xs space-y-3">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h2 class="text-sm font-extrabold text-black">
                        Ma Trận Điều Phối Suất Chiếu Toàn Quốc
                    </h2>
                    <p class="text-xs text-neutral-500">
                        Giám sát số ghế, tỷ lệ giữ chỗ và xung đột phòng chiếu theo thời gian thực
                    </p>
                </div>
                <div class="flex items-center gap-2 text-xs text-neutral-600 font-mono">
                    <span class="w-2 h-2 rounded-full bg-black animate-pulse" />
                    <span>Đồng bộ 30 giây/lần với máy chủ rạp</span>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-base-200">
                <select
                    v-model="selectedMovieFilter"
                    class="select select-sm bg-base-200 text-xs text-black border-base-300 focus:outline-black font-medium"
                >
                    <option value="all">Tất cả phim ({{ cinemaStore.movies.length }})</option>
                    <option v-for="m in cinemaStore.movies" :key="m.id" :value="m.id">
                        {{ m.title }}
                    </option>
                </select>

                <select
                    v-model="selectedChainFilter"
                    class="select select-sm bg-base-200 text-xs text-black border-base-300 focus:outline-black font-medium"
                >
                    <option value="all">Tất cả chuỗi rạp</option>
                    <option v-for="c in cinemaStore.chains" :key="c.id" :value="c.id">
                        {{ c.name }}
                    </option>
                </select>

                <select
                    v-model="selectedFormatFilter"
                    class="select select-sm bg-base-200 text-xs text-black border-base-300 focus:outline-black font-medium"
                >
                    <option value="all">Tất cả định dạng</option>
                    <option value="IMAX Laser">IMAX Laser</option>
                    <option value="2D Phụ đề">2D Phụ đề</option>
                    <option value="2D Lồng tiếng">2D Lồng tiếng</option>
                    <option value="3D Phụ đề">3D Phụ đề</option>
                    <option value="ScreenX">ScreenX</option>
                </select>

                <button
                    v-if="
                        selectedMovieFilter !== 'all' ||
                        selectedChainFilter !== 'all' ||
                        selectedFormatFilter !== 'all'
                    "
                    @click="
                        selectedMovieFilter = 'all';
                        selectedChainFilter = 'all';
                        selectedFormatFilter = 'all';
                    "
                    class="text-xs text-black font-bold hover:underline px-2 py-1 cursor-pointer"
                >
                    Đặt lại
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                v-for="st in filteredShowtimes"
                :key="st.id"
                class="p-4 rounded-lg bg-base-100 border border-base-300 hover:border-black transition-all flex flex-col justify-between shadow-xs"
            >
                <div>
                    <div class="flex items-start gap-3">
                        <img
                            :src="st.moviePoster"
                            :alt="st.movieTitle"
                            class="w-12 h-16 object-cover rounded shadow-xs shrink-0 border border-base-300"
                        />
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-black" />
                                <span class="text-[11px] font-bold text-black">{{
                                    st.chainName
                                }}</span>
                                <span class="text-neutral-300">·</span>
                                <span
                                    class="badge badge-sm badge-neutral font-mono font-bold text-[10px]"
                                >
                                    {{ st.format }}
                                </span>
                            </div>
                            <h3 class="font-bold text-xs text-black truncate mt-1">
                                {{ st.movieTitle }}
                            </h3>
                            <p class="text-[11px] text-neutral-500 truncate mt-0.5">
                                {{ st.multiplexName }}
                            </p>
                        </div>
                    </div>

                    <div class="mt-3.5 pt-3 border-t border-base-200 space-y-2.5">
                        <div class="flex items-center justify-between text-xs">
                            <div class="flex items-center gap-1.5 font-mono text-black font-bold">
                                <BaseIcon name="time" size="14" class="text-neutral-500" />
                                <span>{{ st.startTime }}</span>
                                <span class="text-neutral-400 font-normal">→ {{ st.endTime }}</span>
                            </div>
                            <span class="text-[11px] text-neutral-500 font-mono">{{
                                st.roomName
                            }}</span>
                        </div>

                        <div>
                            <div class="flex items-center justify-between text-[11px] mb-1">
                                <span class="text-neutral-500">Tỷ lệ lấp đầy ghế:</span>
                                <span class="font-bold text-black font-mono"
                                    >{{ st.occupancyRate }}%</span
                                >
                            </div>
                            <div
                                class="w-full h-2 rounded-full bg-base-200 overflow-hidden border border-base-300"
                            >
                                <div
                                    class="h-full rounded-full bg-black transition-all duration-300"
                                    :style="{ width: `${st.occupancyRate}%` }"
                                />
                            </div>
                            <div
                                class="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono"
                            >
                                <span>Đã bán: {{ st.soldSeats }}</span>
                                <span>Đang giữ: {{ st.heldSeats }}</span>
                                <span class="text-black font-bold"
                                    >Trống: {{ st.availableSeats }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    @click="handleOpenSeatMap(st)"
                    class="btn btn-sm btn-outline text-black border-base-300 hover:bg-black hover:text-white mt-4 w-full font-bold"
                >
                    <span>Xem Sơ Đồ Ghế & Điều Phối</span>
                    <BaseIcon name="chevron-right" size="14" />
                </button>
            </div>
        </div>

        <div v-if="inspectingShowtime" class="modal modal-open p-2 sm:p-4">
            <div
                class="modal-box bg-base-100 border border-base-300 max-w-4xl p-4 sm:p-6 text-black space-y-4 max-h-[92vh] overflow-y-auto"
            >
                <div class="flex items-start justify-between pb-3 border-b border-base-300 gap-2">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2 font-mono flex-wrap">
                            <span class="text-xs font-bold text-black uppercase tracking-wider">
                                {{ inspectingShowtime.chainName }} · {{ inspectingShowtime.format }}
                            </span>
                            <span class="text-neutral-300">·</span>
                            <span class="text-xs text-neutral-500">{{
                                inspectingShowtime.roomName
                            }}</span>
                        </div>
                        <h3 class="text-sm sm:text-base font-black text-black mt-0.5 truncate">
                            {{ inspectingShowtime.movieTitle }}
                        </h3>
                        <p class="text-[11px] sm:text-xs text-neutral-500 font-mono">
                            {{ inspectingShowtime.startTime }} - {{ inspectingShowtime.endTime }} ·
                            {{ inspectingShowtime.multiplexName }}
                        </p>
                    </div>

                    <button
                        @click="inspectingShowtime = null"
                        class="btn btn-sm btn-ghost btn-circle shrink-0"
                    >
                        <BaseIcon name="close" size="18" />
                    </button>
                </div>

                <div
                    v-if="actionNotification"
                    class="p-2.5 rounded bg-base-200 border border-black text-xs font-medium flex items-center gap-2"
                >
                    <BaseIcon name="alert-circle" size="16" class="shrink-0 text-black" />
                    <span>{{ actionNotification }}</span>
                </div>

                <div
                    class="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2 px-3 rounded bg-base-200 border border-base-300 text-[11px] sm:text-xs"
                >
                    <div class="flex items-center gap-1.5">
                        <span class="w-3.5 h-3.5 rounded bg-white border border-neutral-400" />
                        <span class="text-neutral-600">Ghế trống</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="w-3.5 h-3.5 rounded bg-black" />
                        <span class="text-black font-semibold">Đã bán</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="w-3.5 h-3.5 rounded bg-neutral-300" />
                        <span class="text-neutral-600">Tại quầy</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="w-3.5 h-3.5 rounded bg-neutral-600" />
                        <span class="text-neutral-800 font-semibold">Giữ chỗ</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span
                            class="w-3.5 h-3.5 rounded bg-neutral-100 border border-neutral-800 line-through"
                        />
                        <span class="text-black">Khóa</span>
                    </div>
                </div>

                <p class="text-[10px] text-neutral-400 text-center sm:hidden font-mono">
                    ← Vuốt ngang để xem và chọn ghế trên sơ đồ →
                </p>

                <div class="py-2 text-center">
                    <div class="h-1.5 w-3/4 mx-auto rounded-full bg-black shadow-xs" />
                    <p
                        class="text-[10px] uppercase font-mono tracking-widest text-neutral-500 mt-1"
                    >
                        Màn Hình Chiếu / Screen ({{ inspectingShowtime.format }})
                    </p>
                </div>

                <div class="overflow-x-auto py-2 touch-pan-x">
                    <div class="min-w-[560px] max-w-2xl mx-auto space-y-1.5 px-2">
                        <div
                            v-for="rowLetter in seatRows"
                            :key="rowLetter"
                            class="flex items-center justify-center gap-1.5"
                        >
                            <span class="w-4 text-xs font-mono font-bold text-neutral-400 text-center">
                                {{ rowLetter }}
                            </span>

                            <div class="flex items-center gap-1.5">
                                <button
                                    v-for="seat in seatMap.filter((s) => s.row === rowLetter)"
                                    :key="seat.id"
                                    @click="selectedSeat = seat"
                                    class="w-7 h-7 rounded text-[10px] font-mono flex items-center justify-center transition-all cursor-pointer"
                                    :class="[
                                        seat.status === 'sold_cinehub'
                                            ? 'bg-black text-white border border-black font-bold'
                                            : seat.status === 'sold_partner'
                                              ? 'bg-neutral-200 text-neutral-500 border border-neutral-300'
                                              : seat.status === 'holding'
                                                ? 'bg-neutral-700 text-white font-bold border border-neutral-800'
                                                : seat.status === 'blocked'
                                                  ? 'bg-neutral-100 text-neutral-400 border border-neutral-400 line-through'
                                                  : 'bg-white text-black border border-neutral-300 hover:border-black',
                                        selectedSeat?.id === seat.id
                                            ? 'ring-2 ring-black scale-110 z-10'
                                            : '',
                                    ]"
                                    :title="`Ghế ${seat.id} (${seat.type}) - ${seat.status}`"
                                >
                                    {{ seat.number }}
                                </button>
                            </div>

                            <span class="w-4 text-xs font-mono font-bold text-neutral-400 text-center">
                                {{ rowLetter }}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    v-if="selectedSeat"
                    class="p-3.5 rounded-lg bg-base-200 border border-base-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded bg-black text-white flex items-center justify-center font-mono font-extrabold text-sm"
                        >
                            {{ selectedSeat.id }}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-black">Ghế {{ selectedSeat.id }}</span>
                                <span class="capitalize text-neutral-600"
                                    >· Hạng {{ selectedSeat.type }}</span
                                >
                                <span class="text-black font-mono font-bold"
                                    >· {{ selectedSeat.price.toLocaleString("vi-VN") }} ₫</span
                                >
                            </div>
                            <div class="text-[11px] text-neutral-500 mt-0.5">
                                Trạng thái:
                                <span class="text-black font-semibold">{{
                                    selectedSeat.status
                                }}</span>
                                <span
                                    v-if="selectedSeat.holdExpiresInSeconds"
                                    class="text-black font-mono ml-2"
                                >
                                    (Hết hạn sau
                                    {{ Math.floor(selectedSeat.holdExpiresInSeconds / 60) }}p
                                    {{ selectedSeat.holdExpiresInSeconds % 60 }}s)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button
                            v-if="selectedSeat.status === 'holding'"
                            @click="handleReleaseHoldingSeat(selectedSeat.id)"
                            class="btn btn-sm btn-neutral text-white font-bold"
                        >
                            <BaseIcon name="unlock" size="14" />
                            <span>Nhả Ghế Treo Khẩn Cấp</span>
                        </button>

                        <button
                            @click="handleToggleSeatEmergency(selectedSeat.id)"
                            class="btn btn-sm btn-outline text-black border-base-300 font-bold bg-base-100"
                        >
                            <template v-if="selectedSeat.status === 'blocked'">
                                <BaseIcon name="unlock" size="14" />
                                <span>Mở Khóa Ghế</span>
                            </template>
                            <template v-else>
                                <BaseIcon name="lock" size="14" />
                                <span>Khóa Khẩn Cấp Ghế</span>
                            </template>
                        </button>
                    </div>
                </div>

                <div
                    v-else
                    class="p-3 text-center text-xs text-neutral-500 bg-base-200 rounded border border-base-300 font-medium"
                >
                    Nhấp vào bất kỳ ghế nào trên sơ đồ để xem chi tiết giữ chỗ, giá vé hoặc can
                    thiệp điều phối kho vé.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAdminCinemaStore } from "@/stores/admin/useAdminCinemaStore";
import { generateCinemaSeats } from "@/utils/constants/adminMockData";
import BaseIcon from "@/components/common/BaseIcon.vue";

const cinemaStore = useAdminCinemaStore();

const selectedMovieFilter = ref("all");
const selectedChainFilter = ref("all");
const selectedFormatFilter = ref("all");

const inspectingShowtime = ref(null);
const seatMap = ref([]);
const selectedSeat = ref(null);
const actionNotification = ref(null);

const seatRows = computed(() => {
    const rows = [...new Set(seatMap.value.map((s) => s.row))];
    return rows.length > 0 ? rows : ["A", "B", "C", "D", "E", "F", "G", "H"];
});

async function handleOpenSeatMap(st) {
    inspectingShowtime.value = st;
    selectedSeat.value = null;
    seatMap.value = await cinemaStore.fetchShowtimeSeats(st.id);
}

function handleToggleSeatEmergency(seatId) {
    if (inspectingShowtime.value) {
        cinemaStore.toggleSeatBlock(inspectingShowtime.value.id, seatId);
    }
    seatMap.value = seatMap.value.map((s) => {
        if (s.id === seatId) {
            const newStatus = s.status === "blocked" ? "available" : "blocked";
            actionNotification.value =
                newStatus === "blocked"
                    ? `Đã khóa khẩn cấp ghế ${seatId} trên cổng rạp ${inspectingShowtime.value?.chainName}`
                    : `Đã mở khóa ghế ${seatId}`;
            setTimeout(() => (actionNotification.value = null), 3000);
            if (selectedSeat.value?.id === seatId) {
                selectedSeat.value = { ...selectedSeat.value, status: newStatus };
            }
            return { ...s, status: newStatus };
        }
        return s;
    });
}

function handleReleaseHoldingSeat(seatId) {
    if (inspectingShowtime.value) {
        cinemaStore.releaseSeatHold(inspectingShowtime.value.id, seatId);
    }
    seatMap.value = seatMap.value.map((s) => {
        if (s.id === seatId) {
            actionNotification.value = `Đã nhả ghế treo ${seatId} thành công về kho vé trống`;
            setTimeout(() => (actionNotification.value = null), 3000);
            return { ...s, status: "available", holdExpiresInSeconds: undefined };
        }
        return s;
    });
    if (selectedSeat.value?.id === seatId) {
        selectedSeat.value = {
            ...selectedSeat.value,
            status: "available",
            holdExpiresInSeconds: undefined,
        };
    }
}

const filteredShowtimes = computed(() => {
    return cinemaStore.showtimes.filter((st) => {
        const matchesMovie =
            selectedMovieFilter.value === "all" || st.movieId === selectedMovieFilter.value;
        const matchesChain =
            selectedChainFilter.value === "all" || st.chainId === selectedChainFilter.value;
        const matchesFormat =
            selectedFormatFilter.value === "all" || st.format === selectedFormatFilter.value;
        return matchesMovie && matchesChain && matchesFormat;
    });
});
</script>

