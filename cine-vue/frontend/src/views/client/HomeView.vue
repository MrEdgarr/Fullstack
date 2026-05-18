<template>
    <section>
        <div class="container">
            <HomeBanner />
        </div>
    </section>
    <section>
        <div class="container">
            <HomeNowPlaying :movies="moviesStore.nowShowing" />
        </div>
    </section>
    <section>
        <div class="bg-base-100 py-10">
            <div class="container">
                <HomeComingSoon :movies="moviesStore.upcoming" />
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
import { useMoviesStore } from "@/stores/movie/useMovieStore";
const moviesStore = useMoviesStore();
onMounted(() => {
    moviesStore.fetchNowShowing();
    moviesStore.fetchUpcoming();
});
</script>
