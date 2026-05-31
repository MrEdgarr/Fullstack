<template>
    <div class="card card-sm border border-base-300 bg-base-100">
        <div class="card-body gap-5">
            <div class="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 class="text-xl font-bold uppercase tracking-widest">Lịch chiếu</h2>
                    <p class="text-sm text-base-content/60">
                        {{ movieTitle }}
                    </p>
                </div>
            </div>

            <div v-if="isLoading" class="py-10 text-center text-base-content/50">
                Đang tải lịch chiếu...
            </div>

            <div v-else-if="error" class="py-10 text-center text-error">
                {{ error }}
            </div>

            <div
                v-else-if="groupedCinemas.length === 0"
                class="rounded-lg border border-dashed border-base-300 px-4 py-10 text-center text-base-content/60"
            >
                Hiện chưa có lịch chiếu cho phim này.
            </div>

            <div v-else class="grid gap-4">
                <div
                    v-for="cinema in groupedCinemas"
                    :key="cinema.id"
                    class="rounded-lg border border-base-300"
                >
                    <div class="border-b border-base-300 p-4">
                        <div class="flex items-start gap-3">
                            <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                            >
                                <BaseIcon name="calendar" />
                            </div>

                            <div>
                                <div class="font-semibold">{{ cinema.name }}</div>
                                <div class="text-sm text-base-content/50">
                                    {{ cinema.address || "Địa chỉ đang cập nhật" }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid gap-4 p-4">
                        <div v-for="dateGroup in cinema.dates" :key="dateGroup.date">
                            <div class="mb-3 text-sm font-semibold text-primary">
                                {{ formatDate(dateGroup.date) }}
                            </div>

                            <div class="grid gap-3">
                                <div
                                    v-for="roomGroup in dateGroup.rooms"
                                    :key="roomGroup.key"
                                    class="rounded-md bg-base-200/60 p-3"
                                >
                                    <div class="mb-3 flex flex-wrap items-center gap-2 text-sm">
                                        <span class="font-medium">{{ roomGroup.format }}</span>
                                        <span class="text-base-content/40">·</span>
                                        <span class="text-base-content/60">{{ roomGroup.room }}</span>
                                    </div>

                                    <div class="flex flex-wrap gap-2">
                                        <button
                                            v-for="showtime in roomGroup.times"
                                            :key="showtime.showtime_id"
                                            type="button"
                                            class="btn btn-outline btn-primary btn-sm"
                                            @click="selectShowtime(showtime)"
                                        >
                                            <span>{{ showtime.time }}</span>
                                            <span v-if="showtime.priceStandard" class="text-xs opacity-70">
                                                {{ formatPrice(showtime.priceStandard) }}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/_services/api";
import { useBookingStore } from "@/stores/booking";
import { useMovieStore } from "@/stores/movie/useMovieStore";
import { extractIdFromSlug } from "@/utils/helpers/slug";

const route = useRoute();
const router = useRouter();
const bookingStore = useBookingStore();
const movieStore = useMovieStore();

const showtimes = ref([]);
const isLoading = ref(false);
const error = ref("");

const movieId = computed(() => extractIdFromSlug(route.params.slug));

const movieTitle = computed(() => {
    return movieStore.currentMovie?.title || showtimes.value[0]?.movie?.title || "Phim đang xem";
});

const groupedCinemas = computed(() => {
    const cinemaMap = new Map();

    showtimes.value.forEach((showtime) => {
        if (!cinemaMap.has(showtime.cinema.id)) {
            cinemaMap.set(showtime.cinema.id, {
                ...showtime.cinema,
                datesMap: new Map(),
            });
        }

        const cinema = cinemaMap.get(showtime.cinema.id);

        if (!cinema.datesMap.has(showtime.date)) {
            cinema.datesMap.set(showtime.date, {
                date: showtime.date,
                roomsMap: new Map(),
            });
        }

        const dateGroup = cinema.datesMap.get(showtime.date);
        const roomKey = `${showtime.room}-${showtime.format}`;

        if (!dateGroup.roomsMap.has(roomKey)) {
            dateGroup.roomsMap.set(roomKey, {
                key: roomKey,
                room: showtime.room,
                format: showtime.format,
                times: [],
            });
        }

        dateGroup.roomsMap.get(roomKey).times.push(showtime);
    });

    return Array.from(cinemaMap.values())
        .map((cinema) => ({
            id: cinema.id,
            name: cinema.name,
            address: cinema.address,
            dates: Array.from(cinema.datesMap.values())
                .map((dateGroup) => ({
                    date: dateGroup.date,
                    rooms: Array.from(dateGroup.roomsMap.values()).map((roomGroup) => ({
                        ...roomGroup,
                        times: roomGroup.times.sort((a, b) => a.time.localeCompare(b.time)),
                    })),
                }))
                .sort((a, b) => a.date.localeCompare(b.date)),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));
});

const fetchShowtimesByMovie = async () => {
    if (!movieId.value) {
        showtimes.value = [];
        return;
    }

    isLoading.value = true;
    error.value = "";

    try {
        const res = await api.get(`/showtimes/movie/${movieId.value}`);
        showtimes.value = (res.data.data || []).map(normalizeShowtime);
    } catch (err) {
        error.value = err.response?.data?.message || "Không thể tải lịch chiếu cho phim này";
        showtimes.value = [];
    } finally {
        isLoading.value = false;
    }
};

const normalizeShowtime = (row) => {
    const date = row.show_date || toDatePart(row.start_time);
    const time = row.show_time || toTimePart(row.start_time);

    return {
        id: Number(row.showtime_id),
        showtime_id: Number(row.showtime_id),
        movie_id: Number(row.movie_id),
        date,
        time,
        startTime: row.start_time,
        endTime: row.end_time,
        room: row.room_name || `Phòng ${row.room_id}`,
        format: formatRoomType(row.room_type),
        ageRestriction: row.age_rating || "Đang cập nhật",
        priceStandard: Number(row.price_standard || 0),
        priceVip: Number(row.price_vip || 0),
        priceCouple: Number(row.price_couple || 0),
        cinema: {
            id: Number(row.cinema_id),
            cinema_id: Number(row.cinema_id),
            name: row.cinema_name || "Rạp đang cập nhật",
            address: row.cinema_address || "",
            cityId: Number(row.city_id || 0),
        },
        movie: {
            id: Number(row.movie_id),
            movie_id: Number(row.movie_id),
            title: row.title || movieStore.currentMovie?.title || "Phim chưa xác định",
            poster: row.poster_url || movieStore.currentMovie?.poster_url,
            genre: row.genre || movieStore.currentMovie?.genre,
            durationMinutes: Number(row.duration_minutes || movieStore.currentMovie?.duration_minutes || 0),
        },
    };
};

const formatRoomType = (roomType) => {
    if (!roomType) return "2D";

    const normalizedRoomType = String(roomType).toLowerCase();
    if (normalizedRoomType === "imax") return "IMAX";
    if (normalizedRoomType === "vip") return "2D VIP";
    if (normalizedRoomType === "3d") return "3D";
    return "2D";
};

const toDatePart = (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
};

const toTimePart = (value) => {
    if (!value) return "";

    const text = String(value);
    if (text.includes("T")) return text.slice(11, 16);
    if (text.length >= 16) return text.slice(11, 16);
    return text.slice(0, 5);
};

const formatDate = (dateString) => {
    if (!dateString) return "Ngày chiếu đang cập nhật";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatPrice = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
};

const selectShowtime = (showtime) => {
    bookingStore.setSelectedShowtime({
        showtime_id: showtime.showtime_id,
        movie: showtime.movie,
        cinema: showtime.cinema,
        cinema_id: showtime.cinema.id,
        format: showtime.format,
        ageRestriction: showtime.ageRestriction,
        room: showtime.room,
        time: showtime.time,
        date: showtime.date,
        priceStandard: showtime.priceStandard,
        priceVip: showtime.priceVip,
        priceCouple: showtime.priceCouple,
    });

    bookingStore.seatStore.resetSeats();
    bookingStore.comboStore.resetCombos();
    bookingStore.paymentStore.resetPayment();
    bookingStore.stepStore.setStep(1);

    router.push("/booking");
};

watch(movieId, fetchShowtimesByMovie, { immediate: true });
</script>
