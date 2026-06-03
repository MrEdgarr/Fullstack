<template>
    <div class="grid grid-cols-12 gap-2.5">
        <div class="card card-sm col-span-6 border border-base-300 bg-base-100">
            <div class="card-body">
                <div class="flex items-center justify-between text-sm md:text-base">
                    <span>1. Vị trí</span>
                    <BaseIcon name="calendar" />
                </div>

                <select v-model="selectedCityId" class="select select-sm w-full md:select-md">
                    <option value="">Toàn quốc</option>
                    <option v-for="city in cityOptions" :key="city.id" :value="city.id">
                        {{ city.name }}
                    </option>
                </select>
            </div>
        </div>

        <div class="card card-sm col-span-6 border border-base-300 bg-base-100">
            <div class="card-body">
                <div class="flex items-center justify-between text-sm md:text-base">
                    <span>2. Rạp</span>
                    <BaseIcon name="calendar" />
                </div>

                <select v-model="selectedCinemaId" class="select select-sm w-full md:select-md">
                    <option value="">Tất cả rạp</option>
                    <option v-for="cinema in cinemaOptions" :key="cinema.id" :value="cinema.id">
                        {{ cinema.name }}
                    </option>
                </select>
            </div>
        </div>
    </div>

    <div class="flex items-center justify-center py-2">
        <BaseTimeSwiper v-model="selectedDate" />
    </div>

    <div v-if="isLoading" class="py-10 text-center text-base-content/50">
        Đang tải lịch chiếu...
    </div>

    <div v-else-if="error" class="py-10 text-center text-error">
        {{ error }}
    </div>

    <div
        v-else-if="cinemaBrands.length === 0"
        class="card card-sm border border-dashed border-base-300 bg-base-100"
    >
        <div class="card-body py-10 text-center text-base-content/60">
            Hiện chưa có lịch chiếu cho phim này.
        </div>
    </div>

    <div v-else class="card card-sm bg-base-100">
        <div
            v-for="brand in cinemaBrands"
            :key="brand.id"
            class="collapse-arrow collapse rounded-none border border-base-300"
        >
            <input type="checkbox" />

            <div class="collapse-title">
                <div class="flex gap-5">
                    <img
                        :src="brand.logo"
                        :alt="brand.name"
                        class="h-10 w-10 rounded object-contain"
                    />

                    <div>
                        <div class="text-sm font-semibold md:text-base">{{ brand.name }}</div>
                        <div class="text-xs text-base-content/50 md:text-sm">
                            {{ brand.branchCount }} rạp
                        </div>
                    </div>
                </div>
            </div>

            <div class="collapse-content pb-0 text-sm">
                <div
                    v-for="branch in brand.branches"
                    :key="branch.id"
                    class="collapse-arrow collapse rounded-none border-b border-b-base-300"
                >
                    <input type="checkbox" />

                    <div class="collapse-title">
                        <div class="text-sm md:text-base">{{ branch.name }}</div>
                    </div>

                    <div class="collapse-content text-sm">
                        <div class="text-base-content/50">
                            {{ branch.address || "Địa chỉ đang cập nhật" }}
                        </div>

                        <div v-for="format in branch.formats" :key="format.key">
                            <div class="pt-2 font-medium">{{ format.type }}</div>

                            <div class="mt-2.5 flex flex-wrap items-center justify-start gap-1">
                                <button
                                    v-for="slot in format.slots"
                                    :key="slot.id"
                                    type="button"
                                    class="btn btn-outline btn-primary btn-xs md:btn-sm"
                                    @click="selectShowtime(slot)"
                                >
                                    {{ slot.time }}
                                </button>
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
import {
    createCinemaOptions,
    createCityOptions,
    getTodayDate,
    groupShowtimesByCinemaBrand,
    normalizeMovieShowtime,
} from "@/utils/helpers/showtime";

const route = useRoute();
const router = useRouter();
const bookingStore = useBookingStore();
const movieStore = useMovieStore();

const selectedDate = ref(getTodayDate());
const selectedCityId = ref("");
const selectedCinemaId = ref("");
const showtimes = ref([]);
const isLoading = ref(false);
const error = ref("");

const movieId = computed(() => extractIdFromSlug(route.params.slug));
const currentMovie = computed(() => movieStore.currentMovie || {});

const filteredShowtimes = computed(() =>
    showtimes.value.filter((showtime) => {
        const matchDate = showtime.date === selectedDate.value;
        const matchCity = selectedCityId.value
            ? showtime.cityId === Number(selectedCityId.value)
            : true;
        const matchCinema = selectedCinemaId.value
            ? showtime.cinema.id === Number(selectedCinemaId.value)
            : true;

        return matchDate && matchCity && matchCinema;
    }),
);

const cityOptions = computed(() => createCityOptions(showtimes.value));
const cinemaOptions = computed(() => createCinemaOptions(showtimes.value, selectedCityId.value));
const cinemaBrands = computed(() => groupShowtimesByCinemaBrand(filteredShowtimes.value));

watch(cinemaOptions, (newCinemas) => {
    if (
        selectedCinemaId.value &&
        !newCinemas.some((cinema) => cinema.id === Number(selectedCinemaId.value))
    ) {
        selectedCinemaId.value = "";
    }
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
        showtimes.value = (res.data.data || []).map((row) =>
            normalizeMovieShowtime(row, currentMovie.value),
        );
    } catch (err) {
        error.value = err.response?.data?.message || "Không thể tải lịch chiếu cho phim này";
        showtimes.value = [];
    } finally {
        isLoading.value = false;
    }
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
