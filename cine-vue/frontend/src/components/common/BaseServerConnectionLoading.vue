<template>
    <Transition name="server-loading">
        <div
            v-if="serverConnectionStore.isVisible"
            class="bg-base-100/80 fixed inset-0 z-[100] flex items-center justify-center px-5 backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div
                class="bg-base-100 border-base-300/70 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border p-7 text-center shadow-xl"
            >
                <span
                    class="loading loading-infinity loading-xl text-primary"
                    aria-hidden="true"
                ></span>

                <div class="space-y-1">
                    <p class="text-base font-semibold">
                        {{ serverConnectionStore.message }}
                    </p>
                    <p v-if="serverConnectionStore.subMessage" class="text-base-content/60 text-sm">
                        {{ serverConnectionStore.subMessage }}
                    </p>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { useServerConnectionStore } from "@/stores/app/useServerConnectionStore";

const serverConnectionStore = useServerConnectionStore();
</script>

<style scoped>
.server-loading-enter-active,
.server-loading-leave-active {
    transition: opacity 150ms ease;
}

.server-loading-enter-from,
.server-loading-leave-to {
    opacity: 0;
}
</style>
