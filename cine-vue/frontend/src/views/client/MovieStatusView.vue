<template>
    <section class="container pb-10">
        <div class="hero p-5 mb-5 font-bold text-xl uppercase tracking-widest">Phim đang chiếu</div>
        <div
            class="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5"
        >
            <div v-for="movie in MOVIES">
                <div class="relative cursor-pointer block">
                    <div class="rounded relative z-10 overflow-hidden">
                        <img
                            :src="movie.poster"
                            alt=""
                            class="rounded-md w-full h-full scale-100 transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                    <div class="absolute top-2 right-2 z-20">
                        <div class="btn btn-xs btn-secondary">T18</div>
                    </div>
                </div>
                <div class="mt-2">
                    <a href="/cinema/nghi-he-so-nghi-huu-24855" class="group"
                        ><div class="truncate font-semibold leading-tight sm:text-md">
                            {{ movie.title }}
                        </div>
                        <div
                            class="mt-1 truncate text-tiny leading-tight text-gray-400 group-hover:text-pink-400"
                        ></div
                    ></a>
                </div>
            </div>
        </div>
    </section>
</template>
<script setup>
import { MOVIES } from "@/utils/constants/Movie";
</script>
