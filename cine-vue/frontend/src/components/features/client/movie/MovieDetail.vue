<template>
    <div class="w-full bg-(image:--gradient-1)">
        <div class="container py-5">
            <div class="grid gap-5 text-center lg:grid-cols-12 lg:text-left">
                <div class="lg:col-span-2">
                    <img
                        :src="movieStore.currentMovie?.poster"
                        alt=""
                        class="m-auto w-30 rounded-lg lg:w-full"
                    />
                </div>
                <div class="text-base-100 lg:col-span-10">
                    <div class="grid gap-2.5">
                        <div>
                            <div class="truncate text-lg font-semibold md:text-2xl">
                                {{ movieStore.currentMovie?.title }}
                            </div>
                            <div class="text-base-300/75 text-xs md:text-sm">
                                NOBODY (浪浪山小妖怪) - Comedy, Adventu re, Animation, Fantasy
                            </div>
                        </div>
                        <div>
                            <div class="inline-flex gap-1">
                                <div class="btn btn-outline btn-sm">
                                    <BaseIcon name="heart" /> Thich
                                </div>
                                <div class="btn btn-outline btn-sm">
                                    <BaseIcon name="star" />
                                    Danh gia
                                </div>
                                <div class="btn btn-outline btn-sm">Trailer</div>
                            </div>
                        </div>
                        <div class="mb-2 text-justify text-sm md:text-base">
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fuga quis quae
                            qui molestiae culpa ipsum temporibus a est quod odio, quidem itaque enim
                            pariatur hic. Odio ipsam perspiciatis dolores voluptatibus. Lorem ipsum
                            dolor sit amet consectetur adipisicing elit. Cupiditate, dicta
                            explicabo. Facere beatae eaque, similique veniam illum illo enim
                            adipisci tenetur vero, suscipit ea dicta tempora velit! Autem, quisquam
                            harum. Lorem ipsum dolor sit amet consectetur adipisicing elit.
                            Cupiditate, dicta explicabo. Facere beatae eaque, similique veniam illum
                            illo enim adipisci tenetur vero, suscipit ea dicta tempora velit! Autem,
                            quisquam harum. Lorem ipsum dolor sit amet consectetur adipisicing elit.
                            Cupiditate, dicta explicabo. Facere beatae eaque, similique veniam illum
                            illo enim adipisci tenetur vero, suscipit ea dicta tempora velit! Autem,
                            quisquam harum. Lorem ipsum dolor sit amet consectetur adipisicing elit.
                            Cupiditate, dicta explicabo. Facere beatae eaque, similique veniam illum
                            illo enim adipisci tenetur vero, suscipit ea dicta tempora velit! Autem,
                            quisquam harum.
                        </div>
                        <div class="grid grid-cols-4">
                            <div class="md:text-left">
                                <div class="inline-flex items-center gap-2 font-medium">
                                    <BaseIcon name="like" />
                                    <div class="text-xs md:text-sm">Hai long</div>
                                </div>
                                <div class="text-xs md:text-sm">100%</div>
                            </div>
                            <div class="md:text-left">
                                <div class="inline-flex items-center gap-2 font-medium">
                                    <BaseIcon name="calendar" />
                                    <div class="text-xs md:text-sm">Khoi chieu</div>
                                </div>
                                <div class="text-xs md:text-sm">00/00/0000</div>
                            </div>
                            <div class="md:text-left">
                                <div class="inline-flex items-center gap-2 font-medium">
                                    <BaseIcon name="time" />
                                    <div class="text-xs md:text-sm">Thoi luong</div>
                                </div>
                                <div class="text-xs md:text-sm">000</div>
                            </div>
                            <div class="md:text-left">
                                <div class="inline-flex items-center gap-2 font-medium">
                                    <BaseIcon name="user-check" />
                                    <div class="text-xs md:text-sm">Gioi han tuoi</div>
                                </div>
                                <div class="text-xs md:text-sm">T13</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { useRoute } from "vue-router";
import { useMovieStore } from "@/stores/movie/useMovieStore";
import { MOVIES } from "@/utils/constants/Movie";
import { extractId } from "@/utils/helpers/formatSlug";

const route = useRoute();
const movieStore = useMovieStore();

onMounted(() => {
    const movieId = extractId(route.params.slug);
    if (movieId) {
        const movie = MOVIES.find((m) => m.id === movieId);
        if (movie) movieStore.setCurrentMovie(movie);
    }
});
</script>
<style lang=""></style>
