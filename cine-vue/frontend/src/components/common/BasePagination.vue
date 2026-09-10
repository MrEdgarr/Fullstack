<template>
    <nav
        v-if="totalPages > 1"
        class="flex flex-col sm:flex-row items-center justify-between gap-4 py-6"
        aria-label="Pagination"
    >
        <div v-if="showInfo && totalItems > 0" class="text-xs sm:text-sm text-base-content/70">
            Hiển thị
            <span class="font-semibold text-base-content">{{ startIndex }}</span> -
            <span class="font-semibold text-base-content">{{ endIndex }}</span>
            trên
            <span class="font-semibold text-base-content">{{ totalItems }}</span>
            kết quả
        </div>
        <div v-else class="hidden sm:block"></div>

        <div class="join border border-base-300 rounded-box shadow-xs">
            <!-- Nút Trước -->
            <button
                type="button"
                class="join-item btn btn-sm btn-ghost hover:bg-base-200 transition-colors"
                :disabled="modelValue <= 1 || disabled"
                aria-label="Trang trước"
                @click="goToPage(modelValue - 1)"
            >
                <span class="text-sm">«</span>
            </button>

            <!-- Danh sách số trang -->
            <template v-for="(page, idx) in visiblePages" :key="idx">
                <button
                    v-if="page !== '...'"
                    type="button"
                    class="join-item btn btn-sm transition-colors"
                    :class="
                        page === modelValue
                            ? 'btn-active font-bold border-base-300'
                            : 'btn-ghost hover:bg-base-200'
                    "
                    :disabled="disabled"
                    :aria-current="page === modelValue ? 'page' : undefined"
                    @click="goToPage(page)"
                >
                    {{ page }}
                </button>
                <button
                    v-else
                    type="button"
                    class="join-item btn btn-sm btn-disabled btn-ghost select-none cursor-default"
                    tabindex="-1"
                    aria-hidden="true"
                    disabled
                >
                    ...
                </button>
            </template>

            <!-- Nút Sau -->
            <button
                type="button"
                class="join-item btn btn-sm btn-ghost hover:bg-base-200 transition-colors"
                :disabled="modelValue >= totalPages || disabled"
                aria-label="Trang tiếp theo"
                @click="goToPage(modelValue + 1)"
            >
                <span class="text-sm">»</span>
            </button>
        </div>
    </nav>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    modelValue: {
        type: Number,
        default: 1,
    },
    totalPages: {
        type: Number,
        required: true,
    },
    totalItems: {
        type: Number,
        default: 0,
    },
    startIndex: {
        type: Number,
        default: 0,
    },
    endIndex: {
        type: Number,
        default: 0,
    },
    showInfo: {
        type: Boolean,
        default: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    scrollToTop: {
        type: Boolean,
        default: true,
    },
    scrollOffset: {
        type: Number,
        default: 0,
    },
    scrollTarget: {
        type: [String, Object],
        default: null,
    },
});

const emit = defineEmits(["update:modelValue", "change"]);

const visiblePages = computed(() => {
    const total = props.totalPages;
    const current = props.modelValue;

    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
        return [1, 2, 3, 4, 5, "...", total];
    }

    if (current >= total - 3) {
        return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, "...", current - 1, current, current + 1, "...", total];
});

const handleScrollOnTop = () => {
    if (!props.scrollToTop || typeof window === "undefined") return;

    if (props.scrollTarget) {
        const el =
            typeof props.scrollTarget === "string"
                ? document.querySelector(props.scrollTarget)
                : props.scrollTarget;
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }
    }

    window.scrollTo({
        top: props.scrollOffset,
        behavior: "smooth",
    });
};

const goToPage = (page) => {
    if (page < 1 || page > props.totalPages || page === props.modelValue || props.disabled) {
        return;
    }
    emit("update:modelValue", page);
    emit("change", page);
    handleScrollOnTop();
};
</script>
