<template>
    <section>
        <div class="container">
            <div class="breadcrumbs mt-5 text-xs md:text-base">
                <ul>
                    <li
                        v-for="s in stepStore.stepLabels"
                        :key="s.id"
                        class="text-base-content/50 cursor-pointer"
                        :class="{ 'text-primary! font-medium': stepStore.currentStep >= s.id }"
                    >
                        {{ s.label }}
                    </li>
                </ul>
            </div>
        </div>
    </section>

    <section class="pb-10">
        <div class="md:container">
            <div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
                <div class="order-2 lg:order-1 lg:col-span-2">
                    <BookingSeat v-if="stepStore.currentStep == 1" />
                    <BookingFood v-if="stepStore.currentStep == 2" />
                    <BookingPayment v-if="stepStore.currentStep == 3" />
                </div>
                <div class="contents lg:order-2 lg:flex lg:flex-col lg:gap-5">
                    <div class="order-1">
                        <BookingCountdownTimer
                            :initial-minutes="10"
                            @time-up="handleTimeUp"
                            storage-key="countdown_expiry"
                            :auto-restart="false"
                        />
                    </div>
                    <div class="order-1">
                        <BookingInfo />
                    </div>

                    <div class="order-3">
                        <BookingAction />
                    </div>
                </div>
            </div>
        </div>
    </section>
    <BookingTicket v-if="paymentStore.isTicketInfo" />
</template>
<script setup>
import { onBeforeRouteLeave } from "vue-router";
import { useBookingStore } from "@/stores/booking";
const bookingStore = useBookingStore();
const stepStore = bookingStore.stepStore;
const paymentStore = bookingStore.paymentStore;

const handleTimeUp = async () => {
    alert("Hết thời gian chọn ghế.");
    await bookingStore.resetAll();
};

onBeforeRouteLeave(async () => {
    await bookingStore.resetAll();
});
</script>
<style lang=""></style>
