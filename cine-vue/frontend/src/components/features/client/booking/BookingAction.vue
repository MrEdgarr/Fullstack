<template>
    <div class="card bg-base-100 border border-base-300 card-sm">
        <div class="card-body">
            <!-- Hiển thị thông tin ghế -->
            <div
                v-if="seatStore.selectedSeats.length"
                class="border-base-content/25 border-b border-dashed pb-2"
            >
                <!-- Ghế đơn -->
                <div v-if="seatStore.singleSeatsCount > 0" class="mb-2">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-medium md:text-sm">
                                {{ seatStore.singleSeatsCount }}x
                                <span class="font-normal">Ghế đơn</span>
                            </div>
                            <div class="text-base-content md:text-sm">
                                Ghế:
                                <span class="font-medium">{{ seatStore.singleSeatsList }}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-base-content font-semibold md:text-sm">
                                {{ formatCurrency(seatStore.singleTotalPrice) }}
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Ghế đôi -->
                <div v-if="seatStore.coupleSeatsCount > 0">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-medium md:text-sm">
                                {{ seatStore.coupleSeatsCount }}x
                                <span class="font-normal">Ghế đôi</span>
                            </div>
                            <div class="text-base-content md:text-sm">
                                Ghế:
                                <span class="font-medium">{{ seatStore.coupleSeatsList }}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-base-content font-semibold md:text-sm">
                                {{ formatCurrency(seatStore.coupleTotalPrice) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gía tiền chưa có khuyến mãi -->
            <div>
                <div
                    v-if="totalPrice"
                    class="flex items-center justify-between text-xs font-medium md:text-sm"
                >
                    <span>Tổng tiền:</span>
                    <span>{{ formatCurrency(totalPrice) }}</span>
                </div>
            </div>

            <div class="flex items-center pt-5">
                <button
                    class="btn btn-ghost w-1/2"
                    :disabled="stepStore.isFirstStep"
                    @click="handleBack"
                >
                    Quay lai
                </button>
                <button
                    class="btn btn-primary w-1/2"
                    v-if="!stepStore.isLastStep"
                    :class="{ 'btn-disabled': !seatStore.selectedSeats.length }"
                    @click="stepStore.nextStep"
                >
                    Tiep tuc
                </button>
                <button v-else class="btn btn-primary w-1/2" onclick="QRCODE.showModal()">
                    Thanh toan
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { useBookingStore } from "@/stores/booking";
import { formatCurrency } from "@/utils/helpers/formatCurrency";

const bookingStore = useBookingStore();

const seatStore = bookingStore.seatStore;
const stepStore = bookingStore.stepStore;

const { totalPrice } = storeToRefs(bookingStore);
</script>
<style lang=""></style>
