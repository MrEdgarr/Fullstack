<template>
    <BaseMovieSwiper :slides="MOVIES" :titleSlide="`Phim Đang Chiếu`">
        <template #slide="{ slide }">
            <RouterLink :to="`/movie/${toSlug(slide.title)}-i${slide.id}`">
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
import { toSlug } from "@/utils/helpers/formatSlug";
import { MOVIES } from "@/utils/constants/Movie.js";
</script>
<style lang=""></style>
