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
                :key="swiperKey"
                :slidesPerView="DEFAULT_SLIDES_PER_VIEW"
                :spaceBetween="DEFAULT_SPACE_BETWEEN"
                :breakpoints="SWIPER_BREAKPOINTS"
                :watch-overflow="true"
                :loop="shouldLoop"
                :modules="modules"
                @swiper="handleSwiper"
            >
                <SwiperSlide
                    v-for="(slide, index) in slides"
                    :key="slide.id ?? index"
                    :class="slideClass"
                    @click="handleSlideClick(slide, index)"
                >
                    <slot name="slide" :slide="slide" :index="index"> </slot>
                </SwiperSlide>
            </Swiper>
            <button
                v-if="canNavigate"
                class="button-prev bg-base-200/75 hover:bg-base-200 absolute top-[calc(50%-40px)] left-2 z-10 flex h-8 w-8 -translate-y-1/2 rotate-45 cursor-pointer items-center justify-center rounded-md transition-all duration-300 ease-in"
                @click="swiperRef?.slidePrev()"
            >
                <BaseIcon name="chevron-left" class="-rotate-45 md:text-xl" />
            </button>
            <button
                v-if="canNavigate"
                class="button-next bg-base-200/75 hover:bg-base-200 absolute top-[calc(50%-40px)] right-2 z-10 flex h-8 w-8 -translate-y-1/2 -rotate-45 cursor-pointer items-center justify-center rounded-md transition-all duration-300 ease-in"
                @click="swiperRef?.slideNext()"
            >
                <BaseIcon name="chevron-right" class="rotate-45 md:text-xl" />
            </button>
        </div>
    </div>
</template>
<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";

const emit = defineEmits(["slideClick"]);
const swiperRef = ref(null);

const DEFAULT_SLIDES_PER_VIEW = 2;
const DEFAULT_SPACE_BETWEEN = 10;
const SWIPER_BREAKPOINTS = {
    480: {
        slidesPerView: 3,
        spaceBetween: 10,
    },
    768: {
        slidesPerView: 4,
        spaceBetween: 15,
    },
    1024: {
        slidesPerView: 5,
        spaceBetween: 20,
    },
    1280: {
        slidesPerView: 6,
        spaceBetween: 20,
    },
};
const BREAKPOINT_WIDTHS = Object.keys(SWIPER_BREAKPOINTS)
    .map(Number)
    .sort((first, second) => second - first);

const props = defineProps({
    modules: {
        type: Array,
        default: () => [],
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

const resolveSlidesPerView = () => {
    if (typeof window === "undefined") return DEFAULT_SLIDES_PER_VIEW;

    const breakpoint = BREAKPOINT_WIDTHS.find((width) => window.innerWidth >= width);
    return breakpoint
        ? SWIPER_BREAKPOINTS[breakpoint].slidesPerView
        : DEFAULT_SLIDES_PER_VIEW;
};

const slidesPerView = ref(resolveSlidesPerView());
const canNavigate = computed(() => props.slides.length > slidesPerView.value);
const shouldLoop = computed(() => canNavigate.value);
const swiperKey = computed(() => {
    const mode = shouldLoop.value ? "loop" : "static";
    return `${slidesPerView.value}-${props.slides.length}-${mode}`;
});

const updateSlidesPerView = () => {
    slidesPerView.value = resolveSlidesPerView();
};

const handleSwiper = (swiper) => {
    swiperRef.value = swiper;
};

onMounted(() => {
    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
});

onUnmounted(() => {
    window.removeEventListener("resize", updateSlidesPerView);
});

const handleSlideClick = (slide, index) => {
    emit("slideClick", { slide, index });
};
</script>
