<template>
    <section class="container pb-10 mt-5">
        <div class="hero p-5 mb-5 font-bold text-xl uppercase tracking-widest">Lịch Chiếu Phim</div>

        <div class="grid grid-cols-12 gap-2.5">
            <div
                class="card bg-base-100 border border-base-300 card-sm order-2 col-span-12 md:order-0 md:col-span-4"
            >
                <div class="card-body">
                    <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                        <span>1. Phim</span>
                        <BaseIcon name="calendar" />
                    </div>
                    <div>
                        <select
                            v-model="selectedMovieId"
                            class="select md:select-md select-sm w-full"
                        >
                            <option value="">Tất cả phim</option>
                            <option v-for="movie in MOVIES" :key="movie.id" :value="movie.id">
                                {{ movie.title }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="card bg-base-100 border border-base-300 card-sm col-span-6 md:col-span-4">
                <div class="card-body">
                    <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                        <span>2. Vị trí</span>
                        <BaseIcon name="calendar" />
                    </div>
                    <div>
                        <select
                            v-model="selectedLocationId"
                            class="select md:select-md select-sm w-full"
                        >
                            <option value="">Toàn quốc</option>
                            <option value="1">Hà Nội</option>
                            <option value="2">TP. Hồ Chí Minh</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="card bg-base-100 border border-base-300 card-sm col-span-6 md:col-span-4">
                <div class="card-body">
                    <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                        <span>3. Rạp</span>
                        <BaseIcon name="calendar" />
                    </div>
                    <div>
                        <select
                            v-model="selectedCinemaId"
                            class="select md:select-md select-sm w-full"
                        >
                            <option value="">Tất cả rạp</option>
                            <option
                                v-for="cinema in filteredCinemas"
                                :key="cinema.id"
                                :value="cinema.id"
                            >
                                {{ cinema.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <BaseTimeSwiper v-model="selectedDate" class="my-5" />

        <!-- Movies & Showtimes -->
        <div v-if="filteredMovies.length === 0" class="text-center py-10 text-base-content/50">
            Không có suất chiếu nào cho ngày và rạp này. Vui lòng chọn rạp hoặc ngày khác!
        </div>

        <div class="grid grid-cols-1 gap-6">
            <div
                v-for="item in filteredMovies"
                :key="item.movie.id"
                class="grid grid-cols-12 gap-2 bg-base-100 rounded-md overflow-hidden"
            >
                <!-- Poster Section -->
                <div class="col-span-4 md:col-span-2 relative">
                    <div class="aspect-2/3 w-full overflow-hidden">
                        <img
                            :src="item.movie.poster"
                            alt="Movie"
                            class="h-full w-full object-cover"
                        />
                    </div>
                </div>

                <!-- Movie Info & Showtimes -->
                <div class="col-span-8 md:col-span-10 card-body p-2 md:p-4 gap-0">
                    <h2 class="text-xl font-bold mb-1">{{ item.movie.title }}</h2>
                    <div
                        class="flex flex-wrap items-center gap-1.5 text-sm text-base-content/60 mb-1"
                    >
                        <span class="opacity-70">Hell Trotter</span>
                        <span>·</span>
                        <span class="font-medium text-base-content/80">{{
                            item.showtimes[0].ageRestriction
                        }}</span>
                        <span>·</span>
                        <span>1h43'</span>
                        <span>·</span>
                        <a href="#" class="text-blue-500 hover:underline">Trailer</a>
                    </div>
                    <div class="text-sm text-base-content/50">{{ item.movie.genre }}</div>

                    <!-- Showtimes grouped by format -->
                    <div
                        v-for="st in item.showtimes"
                        :key="st.id"
                        class="mt-2 not-last:border-b pb-5 border-b-base-content/20"
                    >
                        <div class="mb-3">
                            <h4 v-if="!selectedCinemaId" class="font-bold text-base">
                                @{{ getCinemaName(st.cinemaId) }}
                            </h4>
                            <span class="text-primary font-medium">{{ st.format }}</span>
                        </div>

                        <div
                            class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2"
                        >
                            <button
                                v-for="time in st.times"
                                :key="time"
                                @click="selectShowtime(item.movie, st, time)"
                                class="flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all duration-200"
                                :class="[
                                    isTimePast(st.date, time)
                                        ? 'bg-base-200/50 border-transparent text-base-content/30 cursor-not-allowed'
                                        : 'bg-white border-base-300 hover:border-primary hover:bg-base-100 text-base-content',
                                ]"
                            >
                                <span class="text-sm font-bold">{{ time }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useBookingStore } from "@/stores/booking";
import { CINEMAS, SHOWTIMES_DATA } from "@/utils/constants/showtimesData";
import { MOVIES } from "@/utils/constants/Movie";

const router = useRouter();
const bookingStore = useBookingStore();

const selectedDate = ref(new Date().toISOString().split("T")[0]);
const selectedCinemaId = ref("");
const selectedMovieId = ref("");
const selectedLocationId = ref("");

// Lấy tên rạp từ ID
const getCinemaName = (id) => {
    return CINEMAS.find((c) => c.id === id)?.name || "Rạp không xác định";
};

// Lọc danh sách rạp dựa trên ngày đã chọn
const filteredCinemas = computed(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const availableCinemaIds = new Set(
        SHOWTIMES_DATA.filter((st) => {
            if (st.date !== selectedDate.value) return false;

            // Nếu là ngày hôm nay, kiểm tra xem còn suất chiếu nào chưa diễn ra không
            if (st.date === todayStr) {
                return st.times.some((timeStr) => {
                    const [h, m] = timeStr.split(":").map(Number);
                    if (h > currentHour) return true;
                    if (h === currentHour && m > currentMinute) return true;
                    return false;
                });
            }
            return true;
        }).map((st) => st.cinemaId),
    );
    return CINEMAS.filter((cinema) => availableCinemaIds.has(cinema.id));
});

// Tự động chọn rạp đầu tiên nếu rạp hiện tại không có suất chiếu vào ngày mới (chỉ khi đang chọn 1 rạp cụ thể)
watch(filteredCinemas, (newCinemas) => {
    if (
        selectedCinemaId.value &&
        newCinemas.length > 0 &&
        !newCinemas.find((c) => c.id === selectedCinemaId.value)
    ) {
        selectedCinemaId.value = newCinemas[0].id;
    }
});

// Lọc các phim có suất chiếu theo ngày, rạp và phim được chọn
const filteredMovies = computed(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const matchingShowtimes = SHOWTIMES_DATA.filter((st) => {
        const matchDate = st.date === selectedDate.value;
        const matchCinema = selectedCinemaId.value
            ? st.cinemaId === Number(selectedCinemaId.value)
            : true;
        const matchMovie = selectedMovieId.value
            ? st.movieId === Number(selectedMovieId.value)
            : true;
        return matchDate && matchCinema && matchMovie;
    });

    // Group theo movie
    const moviesMap = new Map();
    matchingShowtimes.forEach((st) => {
        if (!moviesMap.has(st.movieId)) {
            const movie = MOVIES.find((m) => m.id === st.movieId);
            if (movie) {
                moviesMap.set(st.movieId, {
                    movie,
                    showtimes: [],
                });
            }
        }
        if (moviesMap.has(st.movieId)) {
            moviesMap.get(st.movieId).showtimes.push(st);
        }
    });

    return Array.from(moviesMap.values());
});

const isTimePast = (date, timeStr) => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (date < todayStr) return true;
    if (date > todayStr) return false;

    const [h, m] = timeStr.split(":").map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (h < currentHour) return true;
    if (h === currentHour && m < currentMinute) return true;
    return false;
};

const selectShowtime = (movie, st, timeStr) => {
    if (isTimePast(st.date, timeStr)) return;

    const cinema = CINEMAS.find((c) => c.id === st.cinemaId);
    bookingStore.setSelectedShowtime({
        movie,
        cinema,
        format: st.format,
        ageRestriction: st.ageRestriction,
        room: st.room,
        time: timeStr,
        date: st.date,
    });
    router.push("/booking");
};
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
