<template>
    <div class="space-y-4">
        <!-- Skeleton Loading -->
        <div v-if="isLoading" class="space-y-4">
            <div
                v-for="i in 3"
                :key="i"
                class="card bg-base-100 border-base-300 flex flex-row items-center gap-4 border p-4 shadow-sm animate-pulse"
            >
                <div class="h-24 w-16 bg-base-300 rounded"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-4 bg-base-300 rounded w-1/3"></div>
                    <div class="h-4 bg-base-300 rounded w-1/2"></div>
                    <div class="h-4 bg-base-300 rounded w-1/4"></div>
                </div>
            </div>
        </div>
        <!-- Empty State -->
        <div
            v-else-if="bookings.length === 0"
            class="rounded-box border-base-300 bg-base-200/60 border p-6 text-center"
        >
            <h3 class="font-semibold text-lg">Chưa có lịch sử đặt vé</h3>
            <p class="text-base-content/70 mt-2 text-sm">
                Bạn chưa thực hiện giao dịch nào. Hãy đặt vé để xem phim nhé!
            </p>
            <RouterLink to="/showtimes" class="btn btn-primary btn-sm mt-4">
                Xem lịch chiếu
            </RouterLink>
        </div>

        <!-- Booking List -->
        <div v-else>
            <div
                v-for="booking in bookings"
                :key="booking.booking_id"
                class="card bg-base-100 border-base-300 flex flex-col md:flex-row gap-4 border p-4 shadow-sm transition-all mb-4"
                :class="{ 'opacity-60 grayscale': isExpiredOrFinished(booking) }"
            >
                <figure class="w-full md:w-24 shrink-0 rounded overflow-hidden h-32 md:h-auto">
                    <img
                        :src="booking.poster_url"
                        alt="Movie Poster"
                        class="w-full h-full object-cover"
                    />
                </figure>

                <div class="flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex items-start justify-between">
                            <h3 class="font-bold text-lg leading-tight mb-1">
                                {{ booking.movie_title }}
                            </h3>
                            <div class="badge ml-2 shrink-0" :class="getStatusBadgeClass(booking)">
                                {{ getStatusText(booking) }}
                            </div>
                        </div>
                        <p class="text-sm text-base-content/70 mb-1 flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4 mr-1 shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            {{ booking.cinema_name }} - {{ booking.room_name }}
                        </p>
                        <p class="text-sm text-base-content/70 mb-1 flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4 mr-1 shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            {{ formatDateTime(booking.start_time) }}
                        </p>
                        <p class="text-sm font-medium">
                            Ghế:
                            <span class="text-primary">{{
                                booking.ticket_seats || booking.held_seats || "Chưa có ghế"
                            }}</span>
                        </p>
                    </div>

                    <div
                        class="mt-3 flex items-center justify-between border-t border-base-300 pt-3"
                    >
                        <div class="text-sm">
                            Mã vé:
                            <span class="font-mono font-bold">{{
                                booking.booking_code || `#${booking.booking_id}`
                            }}</span>
                        </div>
                        <div class="font-bold text-primary text-lg">
                            {{ formatCurrency(booking.final_amount) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import api from "@/_services/api";

const authStore = useAuthStore();
const bookings = ref([]);
const isLoading = ref(true);

const fetchBookings = async () => {
    try {
        if (!authStore.user?.customer_id) return;
        isLoading.value = true;
        const res = await api.get(`/bookings/customer/${authStore.user.customer_id}`);
        console.log(res.data);

        bookings.value = res.data?.data || [];
    } catch (error) {
        console.error("Failed to fetch bookings:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    if (authStore.user?.customer_id) {
        fetchBookings();
    }
});

watch(
    () => authStore.user?.customer_id,
    (newId, oldId) => {
        if (newId && newId !== oldId) {
            fetchBookings();
        }
    },
);

const isExpiredOrFinished = (booking) => {
    if (booking.booking_status === "cancelled") return true;
    if (booking.end_time && new Date(booking.end_time) < new Date()) return true;
    if (
        booking.booking_status === "pending" &&
        booking.expires_at &&
        new Date(booking.expires_at) < new Date()
    )
        return true;
    return false;
};

const getStatusText = (booking) => {
    if (booking.booking_status === "cancelled") return "Đã huỷ";
    if (booking.booking_status === "pending") {
        if (booking.expires_at && new Date(booking.expires_at) < new Date())
            return "Hết hạn thanh toán";
        return "Chờ thanh toán";
    }
    if (booking.end_time && new Date(booking.end_time) < new Date()) return "Đã chiếu";
    if (booking.booking_status === "confirmed" || booking.booking_status === "completed")
        return "Đã thanh toán";
    return booking.booking_status;
};

const getStatusBadgeClass = (booking) => {
    if (booking.booking_status === "cancelled") return "badge-error";
    if (booking.booking_status === "pending") {
        if (booking.expires_at && new Date(booking.expires_at) < new Date()) return "badge-error";
        return "badge-warning";
    }
    if (booking.end_time && new Date(booking.end_time) < new Date()) return "badge-ghost";
    if (booking.booking_status === "confirmed" || booking.booking_status === "completed")
        return "badge-success";
    return "badge-neutral";
};

const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};
</script>
