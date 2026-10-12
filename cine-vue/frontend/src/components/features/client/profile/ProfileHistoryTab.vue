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
                v-for="booking in paginatedBookings"
                :key="booking.booking_id"
                class="card bg-base-100 border-base-300 flex flex-col md:flex-row gap-4 border p-4 shadow-sm transition-all mb-4 relative"
                :class="{
                    'opacity-50 grayscale pointer-events-none cursor-not-allowed select-none bg-base-200/50 border-dashed':
                        isExpiredOrFinished(booking),
                }"
                :aria-disabled="isExpiredOrFinished(booking)"
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
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <h3
                                    class="font-bold text-lg leading-tight mb-1"
                                    :class="{
                                        'line-through text-base-content/60': isMovieEnded(booking),
                                    }"
                                >
                                    {{ booking.movie_title }}
                                </h3>
                                <div
                                    v-if="isMovieEnded(booking)"
                                    class="text-xs text-error font-medium mb-1"
                                >
                                    Đã hết thời gian chiếu
                                </div>
                            </div>
                            <div class="badge shrink-0" :class="getStatusBadgeClass(booking)">
                                {{ getStatusText(booking) }}
                            </div>
                        </div>
                        <p class="text-sm text-base-content/70 mb-1 flex items-center">
                            <BaseIcon name="location" :size="16" class="mr-1" />
                            {{ booking.cinema_name }} - {{ booking.room_name }}
                        </p>
                        <p class="text-sm text-base-content/70 mb-1 flex items-center">
                            <BaseIcon name="time" :size="16" class="mr-1" />
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

            <!-- Phân trang lịch sử đặt vé -->
            <base-pagination
                v-model="currentPage"
                :total-pages="totalPages"
                :total-items="totalItems"
                :start-index="startIndex"
                :end-index="endIndex"
                @change="setPage"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { usePagination } from "@/composables/usePagination";
import api from "@/_services/api";

const authStore = useAuthStore();
const bookings = ref([]);
const isLoading = ref(true);

// 5 vé / trang
const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems: paginatedBookings,
    startIndex,
    endIndex,
    setPage,
} = usePagination(bookings, { pageSize: 5, syncWithUrl: true, queryKey: "history_page" });

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

const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    const cleanStr = typeof dateStr === "string" ? dateStr.replace(" ", "T") : dateStr;
    const parsed = new Date(cleanStr);
    return isNaN(parsed.getTime()) ? null : parsed;
};

const isMovieEnded = (booking) => {
    const now = new Date();
    const endTime = parseDate(booking.end_time);
    if (endTime) {
        return endTime < now;
    }
    const startTime = parseDate(booking.start_time);
    if (startTime) {
        // Nếu không có end_time cụ thể, mặc định kết thúc sau 120 phút kể từ giờ bắt đầu
        return new Date(startTime.getTime() + 120 * 60 * 1000) < now;
    }
    return false;
};

const isExpiredOrFinished = (booking) => {
    if (booking.booking_status === "cancelled") return true;
    if (isMovieEnded(booking)) return true;
    if (booking.booking_status === "pending") {
        const expiresAt = parseDate(booking.expires_at);
        if (expiresAt && expiresAt < new Date()) return true;
    }
    return false;
};

const getStatusText = (booking) => {
    if (booking.booking_status === "cancelled") return "Đã huỷ";
    if (booking.booking_status === "pending") {
        const expiresAt = parseDate(booking.expires_at);
        if (expiresAt && expiresAt < new Date()) return "Hết hạn thanh toán";
        return "Chờ thanh toán";
    }
    if (isMovieEnded(booking)) return "Đã hết giờ chiếu";
    if (booking.booking_status === "confirmed" || booking.booking_status === "completed")
        return "Đã thanh toán";
    return booking.booking_status;
};

const getStatusBadgeClass = (booking) => {
    if (booking.booking_status === "cancelled") return "badge-error";
    if (booking.booking_status === "pending") {
        const expiresAt = parseDate(booking.expires_at);
        if (expiresAt && expiresAt < new Date()) return "badge-error";
        return "badge-warning";
    }
    if (isMovieEnded(booking)) return "badge-ghost opacity-80";
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
