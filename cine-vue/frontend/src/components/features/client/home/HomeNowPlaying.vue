<template>
    <BaseMovieSwiper :slides="movies" :titleSlide="`Phim Đang Chiếu`" :toRouter="listRoute">
        <template #slide="{ slide }">
            <RouterLink :to="slide.detailRoute">
                <div class="relative aspect-2/3 w-full overflow-hidden rounded-lg">
                    <img
                        :src="slide.poster_url"
                        :alt="slide.title"
                        class="h-full w-full object-cover object-center duration-300 hover:scale-105"
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
defineProps({
    movies: {
        type: Array,
        default: () => [],
    },
    listRoute: {
        type: [String, Object],
        default: "/movie/now-playing",
    },
});
</script>
<style lang=""></style>
