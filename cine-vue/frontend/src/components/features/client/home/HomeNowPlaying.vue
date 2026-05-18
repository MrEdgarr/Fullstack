<template>
    <BaseMovieSwiper
        :slides="movies"
        :titleSlide="`Phim Đang Chiếu`"
        :toRouter="'/movie/now-playing'"
    >
        <template #slide="{ slide }">
            <RouterLink :to="`/movie/${removeAccents(slide.title)}-i${slide.id}`">
                <div class="relative overflow-hidden rounded-lg">
                    <img
                        :src="slide.poster"
                        :alt="slide.title"
                        class="rounded-lg duration-300 hover:scale-105"
                    />

                    <div class="absolute top-2 right-2">
                        <div class="btn btn-xs btn-secondary">T18</div>
                    </div>
                </div>
                <div class="line-clamp-2 py-5 text-sm font-medium">
                    {{ slide.title }}
                </div>
            </RouterLink>
        </template>
    </BaseMovieSwiper>
</template>
<script setup>
import { removeAccents } from "@/utils/helpers/slug";
import { MOVIES } from "@/utils/constants/Movie.js";

const props = defineProps({
    movies: {
        type: Array,
        default: () => [],
    },
});
</script>
<style lang=""></style>
