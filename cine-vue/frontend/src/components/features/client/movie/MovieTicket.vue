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
import { extractIdFromSlug } from "@/utils/helpers/slug";
import { getTodayDate } from "@/utils/helpers/showtime";

const route = useRoute();
const router = useRouter();
const bookingStore = useBookingStore();

const selectedDate = ref(getTodayDate());
const selectedCityId = ref("");
const selectedCinemaId = ref("");
const schedule = ref(createEmptySchedule());
const isLoading = ref(false);
const error = ref("");

const movieId = computed(() => extractIdFromSlug(route.params.slug));
const cityOptions = computed(() => schedule.value.cityOptions);
const cinemaOptions = computed(() => schedule.value.cinemaOptions);
const cinemaBrands = computed(() => schedule.value.cinemaBrands);

let latestRequestId = 0;

watch(selectedCityId, () => {
    selectedCinemaId.value = "";
});

watch(cinemaOptions, (newCinemas) => {
    if (
        selectedCinemaId.value &&
        !newCinemas.some((cinema) => Number(cinema.id) === Number(selectedCinemaId.value))
    ) {
        selectedCinemaId.value = "";
    }
});

watch([movieId, selectedDate, selectedCityId, selectedCinemaId], fetchMovieScheduleTree, {
    immediate: true,
});

async function fetchMovieScheduleTree() {
    if (!movieId.value) {
        schedule.value = createEmptySchedule();
        return;
    }

    const requestId = ++latestRequestId;
    isLoading.value = true;
    error.value = "";

    try {
        const res = await api.get(`/showtimes/movie/${movieId.value}/tree`, {
            params: buildScheduleParams(),
            skipServerLoading: true,
        });

        if (requestId !== latestRequestId) return;

        schedule.value = normalizeScheduleResponse(res.data.data);
    } catch (err) {
        if (requestId !== latestRequestId) return;

        error.value =
            err.response?.data?.message || "Không thể tải lịch chiếu cho phim này";
        schedule.value = createEmptySchedule();
    } finally {
        if (requestId === latestRequestId) {
            isLoading.value = false;
        }
    }
}

function buildScheduleParams() {
    return {
        date: selectedDate.value,
        city_id: selectedCityId.value || undefined,
        cinema_id: selectedCinemaId.value || undefined,
    };
}

function normalizeScheduleResponse(data = {}) {
    return {
        cityOptions: data.cityOptions || [],
        cinemaOptions: data.cinemaOptions || [],
        cinemaBrands: data.cinemaBrands || [],
    };
}

function createEmptySchedule() {
    return {
        cityOptions: [],
        cinemaOptions: [],
        cinemaBrands: [],
    };
}

function selectShowtime(showtime) {
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
}
</script>
