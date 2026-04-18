<template>
    <!-- QRCODE -->
    <section>
        <div class="card bg-base-100 border border-base-300 card-sm">
            <div class="card-body">
                <div class="text-base font-semibold sm:text-lg">Mã khuyến mãi</div>

                <div class="join">
                    <div class="w-full md:w-1/2">
                        <label class="input w-full">
                            <input
                                v-model="paymentStore.promoCode"
                                type="text"
                                class="input md:input-md input-sm w-full"
                                :class="{ 'input-error': paymentStore.promoError }"
                                @input="handleInput"
                                maxlength="10"
                                placeholder="Ma khuyen mai"
                                required
                                @keyup.enter="applyPromo"
                            />
                        </label>
                        <div v-if="paymentStore.promoError" class="text-error mt-1 pl-1 text-sm">
                            {{ paymentStore.promoError }}
                        </div>
                    </div>
                    <button
                        class="btn btn-primary"
                        :class="{ 'btn-disabled': !paymentStore.promoCode.trim() }"
                        @click="applyPromo"
                    >
                        Áp dụng
                    </button>
                </div>
            </div>
        </div>
    </section>
    <section>
        <div class="card bg-base-100 border border-base-300 card-sm">
            <div class="card-body">
                <div class="list">
                    <div class="text-base font-semibold sm:text-lg">Phương thức thanh toán</div>
                    <label
                        v-for="payment in PAYMENT_DATA"
                        :key="payment.id"
                        class="list-row hover:bg-base-200 cursor-pointer items-center transition-colors"
                    >
                        <input
                            v-model="paymentStore.selectedMethod"
                            type="radio"
                            name="song-select"
                            class="radio radio-primary radio-xs"
                            :value="payment.id"
                            @change="paymentStore.setPaymentMethod(payment.id)"
                        />

                        <div class="flex items-center justify-start gap-2 md:gap-5">
                            <img class="rounded-box size-7.5 sm:size-10" :src="payment.image" />
                            <div class="grow text-sm sm:text-base">
                                <div>{{ payment.name }}</div>
                            </div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    </section>
</template>
<script setup>
import { useBookingStore } from "@/stores/booking";
import { PAYMENT_DATA } from "@/utils/constants/paymentData";

const bookingStore = useBookingStore();

const paymentStore = bookingStore.paymentStore;

const handleInput = () => {
    paymentStore.validatePromoCode(paymentStore.promoCode);
};
const applyPromo = () => {
    if (!paymentStore.validatePromoCode(paymentStore.promoCode)) return;
    const success = paymentStore.applyPromo(paymentStore.promoCode);
    if (success) {
        paymentStore.promoError = "";
    }
};
</script>
<style>
.dashed-line::after,
.dashed-line::before {
    background: oklch(0% 0 0/ 0.4);
}
</style>
