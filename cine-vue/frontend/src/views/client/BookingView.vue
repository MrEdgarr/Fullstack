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
                <div class="order-2 lg:order-1 lg:col-span-2"></div>
                <div class="contents lg:order-2 lg:flex lg:flex-col lg:gap-5">
                    <div class="order-1"></div>
                    <div class="order-1"></div>
                    <div class="order-3"></div>
                </div>
            </div>
        </div>
    </section>
</template>
<script setup>
import { useBookingStore } from "@/stores/booking";
import { clearBookingData } from "@/utils/helpers/storage";
const bookingStore = useBookingStore();
const stepStore = bookingStore.stepStore;

const handleBeforeUnload = () => {
    clearBookingData();
};

onUnmounted(() => {
    bookingStore.resetAll();
    window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>
<style lang=""></style>
