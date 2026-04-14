<template>
    <Swiper
        :slidesPerView="1"
        :spaceBetween="30"
        :loop="true"
        :pagination="{
            clickable: true,
        }"
        :navigation="{
            nextEl: '.banner-next',
            prevEl: '.banner-prev',
        }"
        :modules="modules"
        class="rounded-xl md:rounded-2xl"
        @swiper=""
    >
        <SwiperSlide
            v-for="value in HERO_BANNER"
            :key="value.id"
            class="after:absolute after:top-0 after:h-full after:w-full after:bg-(image:--gradient-banner)"
        >
            <div class=""></div>
            <img
                :src="value.image"
                :alt="value.name"
                class="hidden rounded-xl md:block md:rounded-2xl"
            />
            <img
                :src="value.image_md"
                :alt="value.name"
                class="block rounded-xl md:hidden md:rounded-2xl"
            />
        </SwiperSlide>
        <div class="hidden lg:flex">
            <button
                class="banner-prev bg-base-200/75 hover:bg-base-200 absolute top-1/2 left-4 z-10 flex h-8 w-8 -translate-y-1/2 rotate-45 cursor-pointer items-center justify-center rounded-md border-none transition-all duration-300 ease-in"
            >
                <BaseIcon name="chevron-left" class="-rotate-45 text-xl" />
            </button>

            <button
                class="banner-next bg-base-200/75 hover:bg-base-200 absolute top-1/2 right-4 z-10 flex h-8 w-8 -translate-y-1/2 -rotate-45 cursor-pointer items-center justify-center rounded-md border-none transition-all duration-300 ease-in"
            >
                <BaseIcon name="chevron-right" class="rotate-45 text-xl" />
            </button>
        </div>
    </Swiper>
</template>
<script setup>
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/pagination";
// import 'swiper/css/navigation'
// import required modules
import { Pagination, Navigation } from "swiper/modules";
import { HERO_BANNER } from "@/utils/constants/Banner";
const modules = ref([Pagination, Navigation]);
</script>
<style scoped>
/* Pagination :deep(.swiper-pagination) {
    position: relative;
    margin-top: 24px;
} */

:deep(.swiper-pagination-bullet) {
    width: 8px;
    height: 8px;
    background: #7e8694;
    opacity: 1;
    transition: all 0.5s ease;
}

:deep(.swiper-pagination-bullet-active) {
    background: #ffffff;
    width: 28px;
    border-radius: 5px;
}
</style>
