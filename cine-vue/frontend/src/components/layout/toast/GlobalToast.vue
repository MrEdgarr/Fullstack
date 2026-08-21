<template>
    <div class="toast toast-top toast-end z-[9999]">
        <TransitionGroup name="toast">
            <div
                v-for="t in toastStore.toasts"
                :key="t.id"
                class="alert shadow-lg text-white"
                :class="getAlertClass(t.type)"
            >
                <div class="flex items-center gap-3">
                    <BaseIcon :name="getIconName(t.type)" :size="24" />
                    <span>{{ t.message }}</span>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup>
import { useToastStore } from "@/stores/app/useToastStore";

const toastStore = useToastStore();

const getAlertClass = (type) => {
    switch (type) {
        case "success":
            return "alert-success";
        case "error":
            return "alert-error";
        case "warning":
            return "alert-warning";
        default:
            return "alert-info";
    }
};

const getIconName = (type) => {
    switch (type) {
        case "success":
            return "check-circle";
        case "error":
            return "alert-circle";
        case "warning":
            return "alert-triangle";
        default:
            return "info";
    }
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}
.toast-enter-from {
    opacity: 0;
    transform: translateX(50px);
}
.toast-leave-to {
    opacity: 0;
    transform: translateX(50px);
}
</style>
