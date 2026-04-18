<template>
    <div class="card bg-base-100 border border-base-300 card-sm">
        <div
            ref="viewportRef"
            class="relative w-full h-[40vh] bg-base-100 overflow-hidden"
            :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
            @touchstart="startDrag"
            @touchmove="onDrag"
            @touchend="endDrag"
        >
            <div
                ref="contentRef"
                class="absolute top-1/2 left-1/2 flex items-center justify-center origin-center will-change-transform w-max"
                :style="{
                    transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px)) scale(${transform.scale})`,
                    transition: isDragging
                        ? 'none'
                        : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }"
            >
                <div>
                    <div class="divider divider-neutral uppercase tracking-[.25rem] font-medium">
                        Màn hình
                    </div>
                    <div
                        class="flex gap-1 mb-1 items-center justify-center"
                        v-for="(rowSeats, row) in seatsByRow"
                    >
                        <div
                            v-for="seat in rowSeats"
                            :key="seat.id"
                            @click="seatStore.toggleSeat(seat)"
                            class="relative flex aspect-square cursor-pointer items-center justify-center rounded-md size-8"
                            :class="[
                                seat.isAvailable ? '' : 'bg-disabled cursor-not-allowed',
                                isSelected(seat) ? 'bg-info!' : '',
                                !seat.isAvailable
                                    ? ''
                                    : seat.type === 'single'
                                      ? ' bg-base-300'
                                      : seat.type === 'vip'
                                        ? 'bg-warning'
                                        : 'bg-error',
                            ]"
                        >
                            <p class="text-xs">{{ seat.row }}{{ seat.number }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                <button
                    @click="updateZoom(transform.scale + ZOOM_CONFIG.STEP)"
                    class="btn btn-circle btn-sm bg-base-100 shadow-lg border-base-300"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </button>
                <button
                    @click="updateZoom(transform.scale - ZOOM_CONFIG.STEP)"
                    class="btn btn-circle btn-sm bg-base-100 shadow-lg border-base-300"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M20 12H4"
                        />
                    </svg>
                </button>
                <button
                    @click="resetView"
                    class="btn btn-circle btn-sm bg-base-100 shadow-lg border-base-300 text-xs font-bold"
                >
                    R
                </button>
            </div>
        </div>
        <div class="py-5 flex flex-wrap items-center justify-center gap-5">
            <div class="flex items-center gap-1">
                <div
                    class="bg-disabled flex aspect-square size-5 items-center justify-center rounded-sm"
                    disabled="disabled"
                ></div>
                <div class="text-xs md:text-sm">Ghế đã bán</div>
            </div>
            <div class="flex items-center gap-1">
                <div
                    class="bg-info flex aspect-square size-5 items-center justify-center rounded-sm"
                ></div>
                <div class="text-xs md:text-sm">Ghế đang chọn</div>
            </div>
            <div class="flex items-center gap-1">
                <div
                    class="flex bg-base-300 aspect-square size-5 items-center justify-center rounded-sm"
                ></div>
                <div class="text-xs md:text-sm">Ghế thường</div>
            </div>
            <div class="flex items-center gap-1">
                <div
                    class="bg-warning flex aspect-square size-5 items-center justify-center rounded-sm"
                ></div>
                <div class="text-xs md:text-sm">Ghế VIP</div>
            </div>
            <div class="flex items-center gap-1">
                <div
                    class="bg-error flex aspect-square size-5 items-center justify-center rounded-sm"
                ></div>
                <div class="text-xs md:text-sm">Ghế đôi</div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { useSeatStore } from "@/stores/booking/useSeatStore";
import { SEATS_DATA } from "@/utils/constants/seatsData";
import { useSeatMap } from "@/composables/useSeatMap";

// Composable quản lý zoom và drag cho bản đồ chỗ ngồi
const viewportRef = ref(null);
const contentRef = ref(null);
const {
    transform,
    isDragging,
    ZOOM_CONFIG,
    resetView,
    updateZoom,
    startDrag,
    onDrag,
    endDrag,
    fitToViewport,
} = useSeatMap(viewportRef, contentRef);
// Store quản lý trạng thái chỗ ngồi đã chọn
const seatStore = useSeatStore();

const seatsByRow = computed(() => {
    const group = {};
    SEATS_DATA.forEach((seat) => {
        if (!group[seat.row]) group[seat.row] = [];
        group[seat.row].push(seat);
    });
    return group;
});

onMounted(async () => {
    await nextTick();
    fitToViewport();
});
watch(
    seatsByRow,
    async () => {
        await nextTick();
        fitToViewport();
    },
    { deep: true },
);

const isSelected = (seat) => seatStore.selectedSeats.some((s) => s.id === seat.id);
</script>
<style scoped>
* {
    user-select: none;
    -webkit-user-drag: none;
}
.origin-center {
    transform-origin: center center;
}
.bg-disabled {
    background: repeating-linear-gradient(
        45deg,
        rgba(100, 100, 100, 0.4),
        rgba(100, 100, 100, 0.4) 10px,
        rgba(100, 100, 100, 0.6) 0,
        rgba(100, 100, 100, 0.6) 20px
    );
}
</style>
