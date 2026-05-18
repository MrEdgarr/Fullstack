<template>
    <div class="card bg-base-100 border border-base-300 card-sm">
        <div class="card-body">
            <template v-if="showtime">
                <div class="grid grid-cols-2 items-center gap-5 text-sm lg:items-start">
                    <div class="col-span-2 flex-1 sm:col-span-1 lg:col-span-2">
                        <div class="mb-2 text-base font-medium">{{ showtime.movie?.title }}</div>
                        <div class="">
                            {{ showtime.format }} -
                            <span class="btn btn-xs btn-primary">{{
                                showtime.ageRestriction
                            }}</span>
                        </div>
                    </div>
                    <div class="col-span-2 sm:col-span-1 lg:col-span-3">
                        <div class="mb-2 font-medium">
                            {{ showtime.cinema?.name }} - {{ showtime.room }}
                        </div>
                        <div>
                            Suất: <span class="font-medium">{{ showtime.time }}</span> -
                            <span class="font-medium">{{ formatDate(showtime.date) }}</span>
                        </div>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="text-center py-4 text-base-content/60">
                    Vui lòng chọn suất chiếu từ lịch chiếu để tiếp tục đặt vé.
                </div>
            </template>
        </div>
    </div>
</template>
<script setup>
import { computed } from "vue";
import { useBookingStore } from "@/stores/booking";

const bookingStore = useBookingStore();
const showtime = computed(() => bookingStore.selectedShowtime);

const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString("vi-VN", options);
};
</script>
<style lang=""></style>
