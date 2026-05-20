<template>
    <div class="card bg-base-100 border border-base-300 card-sm">
        <div class="card-body">
            <div
                v-if="seatStore.selectedSeats.length"
                class="border-base-content/25 border-b border-dashed pb-2"
            >
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

            <div>
                <div
                    v-if="totalPrice"
                    class="flex items-center justify-between text-xs font-medium md:text-sm"
                >
                    <span>Tổng tiền:</span>
                    <span>{{ formatCurrency(totalPrice) }}</span>
                </div>
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

            <div
                v-if="paymentStore.discountPercent > 0"
                class="border-base-content/25 border-t border-dashed pt-2"
            >
                <div class="flex items-center justify-between pb-2 text-xs font-medium md:text-sm">
                    <span>Thành tiền tạm tính</span>
                    <span class="text-base-content">{{ formatCurrency(finalPrice) }}</span>
                </div>
            </div>

            <div v-if="submitError" class="alert alert-error py-2 text-sm">
                {{ submitError }}
            </div>

            <div v-if="stepStore.isLastStep" class="mt-2">
                <label class="flex cursor-pointer text-sm">
                    <input
                        v-model="isAgreed"
                        type="checkbox"
                        class="checkbox checkbox-sm"
                    />
                    <div class="ml-2.5">
                        <p>
                            Tôi xác nhận các thông tin đã chính xác và đồng ý với các
                            <a href="" class="font-semibold underline">điều khoản & chính sách</a>
                        </p>
                    </div>
                </label>
            </div>

            <div class="flex items-center pt-2">
                <button
                    class="btn btn-ghost w-1/2"
                    :disabled="stepStore.isFirstStep || isSubmitting"
                    @click="handleBack"
                >
                    Quay lại
                </button>
                <button
                    class="btn btn-primary w-1/2"
                    v-if="!stepStore.isLastStep"
                    :disabled="!canGoNext || isSubmitting"
                    :class="{ 'btn-disabled': !canGoNext || isSubmitting }"
                    @click="handleNext"
                >
                    Tiếp tục
                </button>
                <button
                    v-else
                    class="btn btn-primary w-1/2"
                    :disabled="!canPay"
                    :class="{ 'btn-disabled': !canPay }"
                    @click="handlePay"
                >
                    {{ isSubmitting ? "Đang xử lý..." : "Thanh toán" }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import api from "@/_services/api";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useBookingStore } from "@/stores/booking";
import { formatCurrency } from "@/utils/helpers/currency";

const PAYMENT_METHOD_MAP = {
    1: "card",
    2: "zalopay",
    3: "card",
    4: "momo",
};

const bookingStore = useBookingStore();
const authStore = useAuthStore();

const seatStore = bookingStore.seatStore;
const comboStore = bookingStore.comboStore;
const paymentStore = bookingStore.paymentStore;
const stepStore = bookingStore.stepStore;

const { totalPrice, voucherPrice, finalPrice } = storeToRefs(bookingStore);

const isAgreed = ref(false);
const isSubmitting = ref(false);
const submitError = ref("");

const showtimeId = computed(() =>
    Number(bookingStore.selectedShowtime?.showtime_id || bookingStore.selectedShowtime?.id || 0),
);

const canGoNext = computed(
    () => showtimeId.value > 0 && seatStore.selectedSeats.length > 0 && !seatStore.isLoading,
);
const canPay = computed(() => canGoNext.value && isAgreed.value && !isSubmitting.value);

const handleNext = () => {
    submitError.value = "";

    if (!showtimeId.value) {
        submitError.value = "Thiếu thông tin suất chiếu. Vui lòng chọn lại suất chiếu.";
        return;
    }

    if (!seatStore.selectedSeats.length) {
        submitError.value = "Vui lòng chọn ít nhất một ghế.";
        return;
    }

    stepStore.nextStep();
};

const handleBack = () => {
    if (stepStore.currentStep > 1) {
        if (stepStore.currentStep === 2) comboStore.resetCombos();
        if (stepStore.currentStep === 3) paymentStore.resetPayment();
        submitError.value = "";
        stepStore.prevStep();
    }
};

const handlePay = async () => {
    if (!canPay.value) return;

    if (!authStore.isLoggedIn) {
        submitError.value = "Bạn cần đăng nhập trước khi thanh toán.";
        authStore.openModal("login");
        return;
    }

    isSubmitting.value = true;
    submitError.value = "";
    let createdBookingId = null;
    let paymentStatusRequestStarted = false;

    try {
        const selectedSeatIds = seatStore.selectedSeats.map((seat) => Number(seat.showtimeSeatId));
        const foodCombos = comboStore.singleCombosList.map((combo) => ({
            food_combo_id: Number(combo.food_combo_id || combo.id),
            quantity: Number(combo.qty),
        }));

        const bookingPayload = {
            showtime_id: showtimeId.value,
            showtime_seat_ids: selectedSeatIds,
            food_combos: foodCombos,
        };

        if (paymentStore.promoCode?.trim()) {
            bookingPayload.promotion_code = paymentStore.promoCode.trim().toUpperCase();
        }

        const bookingRes = await api.post("/bookings", bookingPayload);
        const booking = bookingRes.data.data;
        createdBookingId = booking.booking_id;
        const paymentMethod = PAYMENT_METHOD_MAP[paymentStore.selectedMethod] || "card";

        const paymentRes = await api.post("/payments", {
            booking_id: booking.booking_id,
            amount: Number(booking.final_amount),
            payment_method: paymentMethod,
            transaction_id: `demo-${booking.booking_id}-${Date.now()}`,
        });
        const payment = paymentRes.data.data;

        paymentStatusRequestStarted = true;
        await api.put(`/payments/${payment.payment_id}/status`, { status: "success" });

        paymentStore.setLastTicket({
            booking,
            payment,
            payment_method: paymentMethod,
            showtime: bookingStore.selectedShowtime,
            seats: [...seatStore.selectedSeats],
            combos: [...comboStore.singleCombosList],
        });
        paymentStore.openTicketModal();
        await seatStore.fetchSeats(showtimeId.value);
    } catch (err) {
        if (createdBookingId && !paymentStatusRequestStarted) {
            await api.delete(`/bookings/${createdBookingId}`).catch(() => {});
        }

        submitError.value = getApiErrorMessage(err);

        if (err.response?.status === 409) {
            seatStore.resetSeats();
            stepStore.setStep(1);
            if (showtimeId.value) await seatStore.fetchSeats(showtimeId.value);
        }
    } finally {
        isSubmitting.value = false;
    }
};

const getApiErrorMessage = (err) => {
    const message = err.response?.data?.message;

    if (message === "One or more seats are unavailable") {
        return "Một hoặc nhiều ghế vừa được người khác đặt. Vui lòng chọn lại ghế.";
    }

    if (message === "Payment amount mismatch") {
        return "Số tiền thanh toán không khớp với booking. Vui lòng thử lại.";
    }

    if (message === "Promotion is invalid") {
        return "Mã khuyến mãi không hợp lệ hoặc đã hết hạn.";
    }

    return message || "Không thể hoàn tất đặt vé. Vui lòng thử lại.";
};
</script>

<style lang=""></style>
