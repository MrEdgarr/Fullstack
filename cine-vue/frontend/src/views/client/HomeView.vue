<template>
    <section>
        <div class="container">
            <HomeBanner />
        </div>
    </section>
    <section>
        <div class="container">
            <HomeNowPlaying :movies="nowPlayingMovies" :list-route="movieRoutes.nowPlaying" />
        </div>
    </section>
    <section>
        <div class="bg-base-100 py-10">
            <div class="container">
                <HomeComingSoon :movies="comingSoonMovies" :list-route="movieRoutes.comingSoon" />
            </div>
        </div>
    </section>
    <section>
        <div class="container">
            <HomeBlog />
        </div>
    </section>
    <section>
        <div class="bg-base-100 py-10">
            <div class="container">
                <HomeNews />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useMoviesStore } from "@/stores/movie/useMovieStore";
import { createMovieSlug } from "@/utils/helpers/slug";

const moviesStore = useMoviesStore();

const movieRoutes = {
    nowPlaying: {
        name: "showing",
        params: {
            slug: "now-playing",
        },
    },
    comingSoon: {
        name: "showing",
        params: {
            slug: "coming-soon",
        },
    },
};

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

const nowPlayingMovies = computed(() => withMovieRoutes(moviesStore.topRatedNowShowing));
const comingSoonMovies = computed(() => withMovieRoutes(moviesStore.sortedUpcoming));

onMounted(() => {
    moviesStore.fetchHomeMovies();
});
</script>
