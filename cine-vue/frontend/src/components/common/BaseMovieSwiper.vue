<template>
    <div class="flex flex-col justify-between gap-5 bg-transparent p-0" :class="containerClass">
        <div class="flex w-full shrink-0 grow flex-row items-center justify-between gap-5 p-0">
            <div class="text-sm font-bold md:text-2xl">{{ titleSlide }}</div>
            <div class="cursor-pointer text-sm">
                <router-link
                    :to="toRouter"
                    class="btn btn-link md:btn-md btn-xs text-base-content flex items-center font-medium"
                >
                    Xem toàn bộ
                </router-link>
            </div>
        </div>
        <div class="relative">
            <Swiper
                :slidesPerView="2"
                :spaceBetween="10"
                :breakpoints="{
                    '480': {
                        slidesPerView: 3,
                        spaceBetween: 10,
                    },
                    '768': {
                        slidesPerView: 4,
                        spaceBetween: 15,
                    },
                    '1024': {
                        slidesPerView: 5,
                        spaceBetween: 20,
                    },
                    '1280': {
                        slidesPerView: 6,
                        spaceBetween: 20,
                    },
                }"
                :loop="true"
                :modules="modules"
                @swiper="(s) => (swiperRef = s)"
            >
                <SwiperSlide
                    v-for="(slide, index) in slides"
                    :key="index"
                    :class="slideClass"
                    @click="handleSlideClick(slide, index)"
                >
                    <slot name="slide" :slide="slide" :index="index"> </slot>
                </SwiperSlide>
            </Swiper>
            <button
                class="movie-prev bg-base-200/75 hover:bg-base-200 absolute top-[calc(50%-40px)] left-2 z-10 flex h-8 w-8 -translate-y-1/2 rotate-45 cursor-pointer items-center justify-center rounded-md transition-all duration-300 ease-in"
                @click="swiperRef?.slidePrev()"
            >
                <BaseIcon name="chevron-left" class="-rotate-45 md:text-xl" />
            </button>
            <button
                class="movie-next bg-base-200/75 hover:bg-base-200 absolute top-[calc(50%-40px)] right-2 z-10 flex h-8 w-8 -translate-y-1/2 -rotate-45 cursor-pointer items-center justify-center rounded-md transition-all duration-300 ease-in"
                @click="swiperRef?.slideNext()"
            >
                <BaseIcon name="chevron-right" class="rotate-45 md:text-xl" />
            </button>
        </div>
    </div>
</template>
<script setup>
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from "swiper/vue";
const emit = defineEmits(["slideClick"]);

const props = defineProps({
    modules: {
        type: Array,
    },
    titleSlide: {
        type: String,
        default: "",
    },
    // Slides data
    slides: {
        type: Array,
        default: () => [],
    },
    // Custom class
    containerClass: {
        type: String,
        default: "",
    },
    slideClass: {
        type: String,
        default: "",
    },
    toRouter: {
        type: String,
        default: "/",
    },
});

const handleSlideClick = (slide, index) => {
    emit("slideClick", { slide, index });
};
</script>

<style scoped></style>
