<template>
    <section class="container pb-10 mt-5">
        <div class="hero p-5 mb-5 font-bold text-xl uppercase tracking-widest">Lịch Chiếu Phim</div>

        <div class="grid grid-cols-12 gap-2.5">
            <div class="card bg-base-100 border border-base-300 card-sm order-2 col-span-12 md:order-0 md:col-span-4">
                <div class="card-body">
                    <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                        <span>1. Phim</span>
                        <BaseIcon name="calendar" />
                    </div>
                    <select v-model="selectedMovieId" class="select md:select-md select-sm w-full">
                        <option value="">Tất cả phim</option>
                        <option v-for="movie in movieOptions" :key="movie.id" :value="movie.id">
                            {{ movie.title }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="card bg-base-100 border border-base-300 card-sm col-span-6 md:col-span-4">
                <div class="card-body">
                    <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                        <span>2. Vị trí</span>
                        <BaseIcon name="calendar" />
                    </div>
                    <select v-model="selectedLocationId" class="select md:select-md select-sm w-full">
                        <option value="">Toàn quốc</option>
                        <option value="1">Hà Nội</option>
                        <option value="2">TP. Hồ Chí Minh</option>
                    </select>
                </div>
            </div>

            <div class="card bg-base-100 border border-base-300 card-sm col-span-6 md:col-span-4">
                <div class="card-body">
                    <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                        <span>3. Rạp</span>
                        <BaseIcon name="calendar" />
                    </div>
                    <select v-model="selectedCinemaId" class="select md:select-md select-sm w-full">
                        <option value="">Tất cả rạp</option>
                        <option v-for="cinema in filteredCinemas" :key="cinema.id" :value="cinema.id">
                            {{ cinema.name }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <BaseTimeSwiper v-model="selectedDate" class="my-5" />

        <div v-if="isLoading" class="text-center py-10 text-base-content/50">
            Đang tải lịch chiếu...
        </div>
        <div v-else-if="error" class="text-center py-10 text-error">
            {{ error }}
        </div>
        <div v-else-if="filteredMovies.length === 0" class="text-center py-10 text-base-content/50">
            Không có suất chiếu nào cho ngày và rạp này. Vui lòng chọn rạp hoặc ngày khác.
        </div>

        <div v-else class="grid grid-cols-1 gap-6">
            <div
                v-for="item in filteredMovies"
                :key="item.movie.id"
                class="grid grid-cols-12 gap-2 bg-base-100 rounded-md overflow-hidden"
            >
                <div class="col-span-4 md:col-span-2 relative">
                    <div class="aspect-2/3 w-full overflow-hidden">
                        <img :src="item.movie.poster" alt="Movie" class="h-full w-full object-cover" />
                    </div>
                </div>

                <div class="col-span-8 md:col-span-10 card-body p-2 md:p-4 gap-0">
                    <h2 class="text-xl font-bold mb-1">{{ item.movie.title }}</h2>
                    <div class="flex flex-wrap items-center gap-1.5 text-sm text-base-content/60 mb-1">
                        <span class="opacity-70">{{ item.movie.genre }}</span>
                        <span>·</span>
                        <span class="font-medium text-base-content/80">{{ item.showtimes[0].ageRestriction }}</span>
                        <span>·</span>
                        <span>{{ formatDuration(item.movie.durationMinutes) }}</span>
                    </div>

                    <div
                        v-for="st in item.showtimes"
                        :key="st.key"
                        class="mt-2 not-last:border-b pb-5 border-b-base-content/20"
                    >
                        <div class="mb-3">
                            <h4 v-if="!selectedCinemaId" class="font-bold text-base">
                                @{{ st.cinema.name }}
                            </h4>
                            <span class="text-primary font-medium">{{ st.format }}</span>
                            <span class="text-sm text-base-content/50"> · {{ st.room }}</span>
                        </div>

                        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2">
                            <button
                                v-for="timeItem in st.times"
                                :key="timeItem.id"
                                @click="selectShowtime(item.movie, st, timeItem)"
                                :disabled="isTimePast(st.date, timeItem.time)"
                                class="flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all duration-200"
                                :class="[
                                    isTimePast(st.date, timeItem.time)
                                        ? 'bg-base-200/50 border-transparent text-base-content/30 cursor-not-allowed'
                                        : 'bg-white border-base-300 hover:border-primary hover:bg-base-100 text-base-content',
                                ]"
                            >
                                <span class="text-sm font-bold">{{ timeItem.time }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/_services/api";
import { useBookingStore } from "@/stores/booking";
import { MOVIES } from "@/utils/constants/Movie";

const router = useRouter();
const bookingStore = useBookingStore();

const selectedDate = ref(new Date().toISOString().split("T")[0]);
const selectedCinemaId = ref("");
const selectedMovieId = ref("");
const selectedLocationId = ref("");
const showtimes = ref([]);
const isLoading = ref(false);
const error = ref("");

const movieOptions = computed(() => {
    const movies = new Map();
    showtimes.value.forEach((showtime) => movies.set(showtime.movie.id, showtime.movie));
    return Array.from(movies.values()).sort((a, b) => a.title.localeCompare(b.title, "vi"));
});

const filteredCinemas = computed(() => {
    const cinemas = new Map();

    showtimes.value.forEach((showtime) => {
        if (showtime.date !== selectedDate.value) return;
        if (selectedLocationId.value && showtime.cityId !== Number(selectedLocationId.value)) return;
        if (isTimePast(showtime.date, showtime.time)) return;

        cinemas.set(showtime.cinema.id, showtime.cinema);
    });

    return Array.from(cinemas.values()).sort((a, b) => a.name.localeCompare(b.name, "vi"));
});

watch(filteredCinemas, (newCinemas) => {
    if (
        selectedCinemaId.value &&
        !newCinemas.find((cinema) => cinema.id === Number(selectedCinemaId.value))
    ) {
        selectedCinemaId.value = "";
    }
});

const filteredMovies = computed(() => {
    const matchingShowtimes = showtimes.value.filter((showtime) => {
        const matchDate = showtime.date === selectedDate.value;
        const matchCinema = selectedCinemaId.value
            ? showtime.cinema.id === Number(selectedCinemaId.value)
            : true;
        const matchMovie = selectedMovieId.value
            ? showtime.movie.id === Number(selectedMovieId.value)
            : true;
        const matchLocation = selectedLocationId.value
            ? showtime.cityId === Number(selectedLocationId.value)
            : true;

        return matchDate && matchCinema && matchMovie && matchLocation;
    });

    const moviesMap = new Map();

    matchingShowtimes.forEach((showtime) => {
        if (!moviesMap.has(showtime.movie.id)) {
            moviesMap.set(showtime.movie.id, {
                movie: showtime.movie,
                showtimes: [],
            });
        }

        const item = moviesMap.get(showtime.movie.id);
        const groupKey = `${showtime.cinema.id}-${showtime.room}-${showtime.format}-${showtime.date}`;
        let group = item.showtimes.find((candidate) => candidate.key === groupKey);

        if (!group) {
            group = {
                key: groupKey,
                cinema: showtime.cinema,
                cinemaId: showtime.cinema.id,
                date: showtime.date,
                format: showtime.format,
                ageRestriction: showtime.ageRestriction,
                room: showtime.room,
                times: [],
            };
            item.showtimes.push(group);
        }

        group.times.push({
            id: showtime.id,
            showtime_id: showtime.showtime_id,
            time: showtime.time,
        });
    });

    moviesMap.forEach((item) => {
        item.showtimes.forEach((group) => group.times.sort((a, b) => a.time.localeCompare(b.time)));
    });

    return Array.from(moviesMap.values());
});

const fetchShowtimes = async () => {
    isLoading.value = true;
    error.value = "";

    try {
        const res = await api.get("/showtimes");
        showtimes.value = (res.data.data || []).map(normalizeShowtime);
    } catch (err) {
        error.value = err.response?.data?.message || "Không thể tải lịch chiếu";
        showtimes.value = [];
    } finally {
        isLoading.value = false;
    }
};

const normalizeShowtime = (row) => {
    const fallbackMovie = MOVIES.find((movie) => movie.id === Number(row.movie_id));
    const date = row.show_date || toDatePart(row.start_time);
    const time = row.show_time || toTimePart(row.start_time);

    return {
        id: Number(row.showtime_id),
        showtime_id: Number(row.showtime_id),
        date,
        time,
        room: row.room_name,
        format: formatRoomType(row.room_type),
        ageRestriction: row.age_rating || "T13",
        cityId: Number(row.city_id),
        cinema: {
            id: Number(row.cinema_id),
            cinema_id: Number(row.cinema_id),
            name: row.cinema_name,
        },
        movie: {
            id: Number(row.movie_id),
            movie_id: Number(row.movie_id),
            title: row.title || fallbackMovie?.title || "Phim chưa xác định",
            poster: row.poster_url || fallbackMovie?.poster || "https://placehold.co/500x750?text=Movie",
            genre: row.genre || fallbackMovie?.genre || "Đang cập nhật",
            durationMinutes: Number(row.duration_minutes || 0),
        },
    };
};

const formatRoomType = (roomType) => {
    if (roomType === "imax") return "IMAX";
    if (roomType === "vip") return "2D VIP";
    return "2D Phụ Đề";
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

const isTimePast = (date, timeStr) => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    if (date < todayStr) return true;
    if (date > todayStr) return false;

    const [hour, minute] = timeStr.split(":").map(Number);
    if (hour < now.getHours()) return true;
    if (hour === now.getHours() && minute < now.getMinutes()) return true;
    return false;
};

const formatDuration = (minutes) => {
    if (!minutes) return "Đang cập nhật";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${String(mins).padStart(2, "0")}'`;
};

const selectShowtime = (movie, group, timeItem) => {
    if (isTimePast(group.date, timeItem.time)) return;

    bookingStore.setSelectedShowtime({
        showtime_id: timeItem.showtime_id,
        movie,
        cinema: group.cinema,
        cinema_id: group.cinema.id,
        format: group.format,
        ageRestriction: group.ageRestriction,
        room: group.room,
        time: timeItem.time,
        date: group.date,
    });
    bookingStore.seatStore.resetSeats();
    bookingStore.comboStore.resetCombos();
    bookingStore.paymentStore.resetPayment();
    bookingStore.stepStore.setStep(1);
    router.push("/booking");
};

onMounted(fetchShowtimes);
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
