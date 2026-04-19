<template>
    <dialog id="confirmation_modal" class="modal">
        <div class="modal-box max-w-lg p-0 overflow-hidden rounded-3xl">
            <!-- Header -->
            <div class="bg-primary text-white px-6 py-5 text-center">
                <h3 class="text-2xl font-bold">Xác nhận đặt vé</h3>
                <p class="text-sm opacity-90 mt-1">
                    Vui lòng kiểm tra lại thông tin trước khi thanh toán
                </p>
            </div>

            <div class="p-6 space-y-6">
                <!-- Thông tin phim -->
                <div>
                    <div class="text-xs text-base-content/60 mb-1">PHIM</div>
                    <div class="font-semibold text-lg">{{ movieTitle }}</div>
                    <div class="text-sm text-base-content/70">{{ movieInfo }}</div>
                </div>

                <!-- Ghế đã chọn -->
                <div>
                    <div class="text-xs text-base-content/60 mb-2">GHẾ ĐÃ CHỌN</div>
                    <div class="flex flex-wrap gap-2">
                        <div
                            v-for="seat in selectedSeatsDisplay"
                            :key="seat"
                            class="badge badge-lg badge-primary"
                        >
                            {{ seat }}
                        </div>
                    </div>
                </div>

                <!-- Combo -->
                <div v-if="hasCombo">
                    <div class="text-xs text-base-content/60 mb-2">COMBO ĐỒ ĂN</div>
                    <div class="space-y-1 text-sm">
                        <div
                            v-for="(qty, id) in selectedCombos"
                            :key="id"
                            class="flex justify-between"
                        >
                            <span>{{ getComboName(id) }} × {{ qty }}</span>
                            <span class="font-medium">{{
                                formatCurrency(getComboPrice(id) * qty)
                            }}</span>
                        </div>
                    </div>
                </div>

                <!-- Tổng tiền -->
                <div class="border-t pt-4">
                    <div class="flex justify-between items-end">
                        <span class="text-base-content/70">Tổng thanh toán</span>
                        <div class="text-right">
                            <div class="text-3xl font-bold text-primary">
                                {{ formatCurrency(totalPrice) }}
                            </div>
                            <div v-if="discountPercent > 0" class="text-success text-sm">
                                (Đã giảm {{ discountPercent }}%)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer buttons -->
            <div class="flex gap-3 p-6 border-t bg-base-100">
                <button @click="closeModal" class="btn btn-outline flex-1">
                    Quay lại chỉnh sửa
                </button>
                <button @click="confirmBooking" class="btn btn-primary flex-1">
                    Xác nhận & Thanh toán
                </button>
            </div>
        </div>
    </dialog>
</template>

<script setup>
import { computed } from "vue";
import { useBookingStore } from "@/stores/booking";

import { formatCurrency } from "@/utils/helpers/formatCurrency";

const bookingStore = useBookingStore();
const movieStore = bookingStore.movieStore;

const emit = defineEmits(["confirm"]);

const movieTitle = computed(() => movieStore.movieTitle);
const movieInfo = computed(() => {
    return `${bookingStore.seatStore.singleSeatsCount + bookingStore.seatStore.coupleSeatsCount} vé • ${bookingStore.seatStore.singleSeatsList || bookingStore.seatStore.coupleSeatsList}`;
});

const selectedSeatsDisplay = computed(() => {
    const seats = [];
    if (bookingStore.seatStore.singleSeatsList) seats.push(bookingStore.seatStore.singleSeatsList);
    if (bookingStore.seatStore.coupleSeatsList) seats.push(bookingStore.seatStore.coupleSeatsList);
    return seats.flatMap((s) => s.split(", "));
});

const selectedCombos = computed(() => bookingStore.comboStore.selectedCombos);
const hasCombo = computed(() => Object.keys(selectedCombos.value).length > 0);

const discountPercent = computed(() => bookingStore.paymentStore?.discountPercent || 0);
const totalPrice = computed(() => bookingStore.totalPrice);

const getComboName = (id) => {
    // Lấy từ combosData của bạn
    const combo = combosData.find((c) => c.id === Number(id));
    return combo ? combo.name : "Combo";
};

const getComboPrice = (id) => {
    const combo = combosData.find((c) => c.id === Number(id));
    return combo ? combo.price : 0;
};

const closeModal = () => {
    document.getElementById("confirmation-modal").close();
};
</script>
