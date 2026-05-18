<template>
    <div class="box-nav sticky top-0 z-20 w-full border-b border-gray-200 bg-white py-2">
        <Swiper
            :slides-per-view="'auto'"
            :space-between="5"
            :navigation="{
                nextEl: '.button-next',
                prevEl: '.button-prev',
            }"
            :modules="modules"
            class="z-0 px-10"
        >
            <SwiperSlide v-for="(item, index) in days" :key="index" class="w-16!">
                <div
                    class="group w-16 cursor-pointer overflow-hidden rounded border transition-all"
                    :class="[
                        selectedDate === item.date
                            ? 'border-primary'
                            : 'border-gray-300 hover:border-gray-400',
                    ]"
                    @click="selectDate(item.date)"
                >
                    <div
                        class="mx-auto flex h-8 items-center justify-center text-lg font-semibold transition-colors"
                        :class="[
                            selectedDate === item.date
                                ? 'bg-primary text-primary-content'
                                : 'bg-base-content/5',
                        ]"
                    >
                        {{ item.day }}
                    </div>
                    <div
                        class="flex h-6 items-center justify-center text-nowrap text-xs font-medium transition-colors"
                        :class="[
                            selectedDate === item.date
                                ? 'text-base-content'
                                : 'text-base-content/50',
                        ]"
                    >
                        {{ item.weekday }}
                    </div>
                </div>
            </SwiperSlide>
        </Swiper>

        <!-- Custom Navigation Buttons -->
        <button
            class="button-prev absolute left-0 top-0 z-10 flex h-full w-10 cursor-pointer items-center justify-center text-gray-400 disabled:opacity-30 disabled:hover:text-base-300"
        >
            <BaseIcon name="chevron-left" :size="20" />
        </button>
        <button
            class="button-next absolute right-0 top-0 z-10 flex h-full w-10 cursor-pointer items-center justify-center text-gray-400 transition-colors hover:text-pink-600 disabled:opacity-30 disabled:hover:text-gray-400"
        >
            <BaseIcon name="chevron-right" :size="20" />
        </button>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const modules = [Navigation];

const emit = defineEmits(["update:modelValue", "change"]);

const props = defineProps({
    modelValue: String,
});

const days = computed(() => {
    const result = [];
    const now = new Date();
    const weekdays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(now.getDate() + i);
        result.push({
            day: d.getDate(),
            weekday: i === 0 ? "Hôm nay" : weekdays[d.getDay()],
            date: d.toISOString().split("T")[0],
        });
    }
    return result;
});

const selectedDate = ref(props.modelValue || days.value[0].date);

watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal) selectedDate.value = newVal;
    },
);

const selectDate = (date) => {
    selectedDate.value = date;
    emit("update:modelValue", date);
    emit("change", date);
};
</script>

<style scoped></style>
