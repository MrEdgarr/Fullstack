<template>
    <div class="w-full bg-(image:--gradient-1)">
        <div class="container py-5">
            <div class="grid gap-5 text-center lg:grid-cols-12 lg:text-left">
                <div class="lg:col-span-2">
                    <img
                        :src="movie?.poster_url || movie?.poster"
                        :alt="movie?.title || 'Movie poster'"
                        class="m-auto w-30 rounded-lg lg:w-full"
                    />
                </div>

                <div class="text-base-100 lg:col-span-10">
                    <div class="grid gap-2.5">
                        <div>
                            <h2 class="truncate text-lg font-semibold md:text-2xl">
                                {{ movie?.title || "Không tìm thấy phim" }}
                            </h2>
                            <div class="text-base-300/75 text-xs md:text-sm">
                                {{ movieMeta || "Thông tin phim đang được cập nhật" }}
                            </div>
                        </div>

                        <div>
                            <div class="inline-flex gap-1">
                                <div class="btn btn-outline btn-xs md:btn-sm">
                                    <BaseIcon name="heart" /> Thích
                                </div>
                                <div class="btn btn-outline btn-xs md:btn-sm">
                                    <BaseIcon name="star" />
                                    Đánh giá
                                </div>
                                <div class="btn btn-outline btn-xs md:btn-sm">Trailer</div>
                            </div>
                        </div>

                        <div class="mb-2 text-justify text-sm md:text-base">
                            {{ movie?.description || "Chưa có mô tả cho phim này." }}
                        </div>

                        <div class="grid grid-cols-4">
                            <div class="md:text-left">
                                <div class="inline-flex items-center gap-2 font-medium">
                                    <BaseIcon name="like" class="text-xs md:text-base" />
                                    <div class="text-xs md:text-sm hidden md:flex">Hài lòng</div>
                                </div>
                                <div class="text-xs md:text-sm">
                                    {{ movie?.rating_percent ?? 0 }}%
                                </div>
                            </div>

                            <div class="md:text-left">
                                <div class="inline-flex items-center gap-2 font-medium">
                                    <BaseIcon name="calendar" class="text-xs md:text-base" />
                                    <div class="text-xs md:text-sm hidden md:flex">Khởi chiếu</div>
                                </div>
                                <div class="text-xs md:text-sm">
                                    {{ formatDate(movie?.release_date) }}
                                </div>
                            </div>

                            <div class="md:text-left">
                                <div class="inline-flex items-center gap-2 font-medium">
                                    <BaseIcon name="time" class="text-xs md:text-base" />
                                    <div class="text-xs md:text-sm hidden md:flex">Thời lượng</div>
                                </div>
                                <div class="text-xs md:text-sm">
                                    {{ movie?.duration_minutes || "--" }} phút
                                </div>
                            </div>

                            <div class="md:text-left">
                                <div class="inline-flex items-center gap-2 font-medium">
                                    <BaseIcon name="user-check" class="text-xs md:text-base" />
                                    <div class="text-xs md:text-sm hidden md:flex">
                                        Giới hạn tuổi
                                    </div>
                                </div>
                                <div class="text-xs md:text-sm">
                                    {{ movie?.age_rating || "--" }}
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
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useMovieStore } from "@/stores/movie/useMovieStore";
import { extractIdFromSlug } from "@/utils/helpers/slug";

const route = useRoute();
const movieStore = useMovieStore();

const movie = computed(() => movieStore.currentMovie);

const movieMeta = computed(() =>
    [movie.value?.title_en, movie.value?.genre].filter(Boolean).join(" - "),
);

const formatDate = (dateString) => {
    if (!dateString) return "--";

    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString("vi-VN");
};

const loadMovie = () => {
    const movieId = extractIdFromSlug(route.params.slug);

    if (!movieId) {
        movieStore.setCurrentMovie(null);
        return;
    }

    movieStore.fetchMovieById(movieId);
};

onMounted(loadMovie);
watch(() => route.params.slug, loadMovie);
</script>
