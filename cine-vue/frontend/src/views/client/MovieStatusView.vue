<template>
    <section class="container pb-10">
        <h1 class="hero mb-5 p-5 text-xl font-bold tracking-widest uppercase">
            {{ pageTitle }}
        </h1>

        <div
            v-if="movies.length"
            class="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5"
        >
            <RouterLink
                v-for="movie in movies"
                :key="movie.movie_id ?? movie.id"
                :to="movie.detailRoute"
                class="group block"
            >
                <div class="relative cursor-pointer">
                    <div class="relative z-10 aspect-2/3 overflow-hidden rounded">
                        <img
                            :src="movie.poster_url || movie.poster"
                            :alt="movie.title"
                            class="h-full w-full rounded-md object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>

                    <div v-if="movie.age_rating" class="absolute top-2 right-2 z-20">
                        <div class="btn btn-xs btn-secondary">{{ movie.age_rating }}</div>
                    </div>
                </div>

                <div class="mt-2">
                    <div class="line-clamp-2 font-semibold leading-tight sm:text-md">
                        {{ movie.title }}
                    </div>
                </div>
            </RouterLink>
        </div>

        <div v-else-if="!moviesStore.isLoading" class="py-10 text-center text-base-content/60">
            Chưa có phim trong danh mục này.
        </div>
    </section>
</template>

<script setup>
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useMoviesStore } from "@/stores/movie/useMovieStore";
import { createMovieSlug } from "@/utils/helpers/slug";

const route = useRoute();
const moviesStore = useMoviesStore();

const isComingSoon = computed(() => route.params.slug === "coming-soon");

const pageTitle = computed(() => (isComingSoon.value ? "Phim sắp chiếu" : "Phim đang chiếu"));

const createMovieDetailRoute = (movie) => ({
    name: "movie",
    params: {
        slug: createMovieSlug(movie),
    },
});

const withMovieRoutes = (movies) =>
    movies.map((movie) => ({
        ...movie,
        detailRoute: createMovieDetailRoute(movie),
    }));

const movies = computed(() =>
    withMovieRoutes(isComingSoon.value ? moviesStore.sortedUpcoming : moviesStore.topRatedNowShowing),
);

watch(
    isComingSoon,
    () => {
        if (isComingSoon.value) {
            moviesStore.fetchUpcoming();
            return;
        }

        moviesStore.fetchNowShowing();
    },
    { immediate: true },
);
</script>
