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
            <!-- Thông tin combo đồ ăn -->
            <div
                v-if="comboStore.singleCombosList.length"
                class="border-base-content/25 border-b border-dashed pb-2"
            >
                <div class="grid grid-cols-1 gap-2">
                    <template v-for="combo in comboStore.singleCombosList" :key="combo.id">
                        <div class="flex items-center justify-between font-medium md:text-sm">
                            <div>
                                {{ combo.qty }} x
                                <span class="font-normal">{{ combo.name }}</span>
                            </div>
                            <div>{{ formatCurrency(combo.price * combo.qty) }}</div>
                        </div>
                    </template>
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
                <!-- Mã khuến mãi -->
                <div v-if="paymentStore.discountPercent > 0">
                    <div class="flex items-center justify-between md:text-sm">
                        <div>
                            Voucher
                            <span class="font-medium">({{ paymentStore.discountPercent }}%)</span>
                        </div>
                        <div>- {{ formatCurrency(voucherPrice) }}</div>
                    </div>
                </div>
            </div>
            <!-- Gía tiền có khuến mãi -->
            <div
                v-if="paymentStore.discountPercent > 0"
                class="border-base-content/25 border-t border-dashed pt-2"
            >
                <div class="flex items-center justify-between pb-2 text-xs font-medium md:text-sm">
                    <span>Thành tiền</span>
                    <span class="text-base-content">{{ formatCurrency(finalPrice) }}</span>
                </div>
            </div>
            <div v-if="stepStore.isLastStep" class="mt-2">
                <label class="flex cursor-pointer text-sm">
                    <input
                        v-model="isAgreed"
                        type="checkbox"
                        checked="checked"
                        class="checkbox checkbox-sm"
                    />
                    <div class="ml-2.5">
                        <p>
                            Tôi xác nhận các thông tin đã chính xác và đồng ý với các
                            <a href="" class="font-semibold underline"> điều khoản & chính sách</a>
                        </p>
                    </div>
                </label>
            </div>
            <div class="flex items-center pt-2">
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
                <button
                    v-else
                    class="btn btn-primary w-1/2"
                    :class="{ 'btn-disabled': !isAgreed }"
                    @click="paymentStore.openTicketModal"
                >
                    Thanh toan
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { useBookingStore } from "@/stores/booking";
import { formatCurrency } from "@/utils/helpers/formatCurrency";
import { clearStepData } from "@/utils/helpers/storage";

const bookingStore = useBookingStore();

const seatStore = bookingStore.seatStore;
const comboStore = bookingStore.comboStore;
const paymentStore = bookingStore.paymentStore;
const stepStore = bookingStore.stepStore;

const { totalPrice, voucherPrice, finalPrice } = storeToRefs(bookingStore);

const isAgreed = ref(false);

const handleBack = () => {
    if (stepStore.currentStep > 1) {
        if (stepStore.currentStep === 1) seatStore.resetSeats();
        if (stepStore.currentStep === 2) comboStore.resetCombos();
        if (stepStore.currentStep === 3) paymentStore.resetPayment();
        clearStepData(stepStore.currentStep);
        stepStore.prevStep();
    }
};
</script>
<style lang=""></style>
