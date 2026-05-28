import { computed, ref } from "vue";
import { defineStore } from "pinia";

const DISPLAY_DELAY_MS = 100;
const DEFAULT_MESSAGE = "Đang kết nối đến máy chủ...";

export const useServerConnectionStore = defineStore("serverConnection", () => {
    const pendingRequests = ref(0);
    const isVisible = ref(false);
    const message = ref(DEFAULT_MESSAGE);
    let displayTimer = null;

    const isConnecting = computed(() => pendingRequests.value > 0);

    const clearDisplayTimer = () => {
        if (!displayTimer) return;

        clearTimeout(displayTimer);
        displayTimer = null;
    };

    const startRequest = () => {
        pendingRequests.value += 1;

        if (pendingRequests.value > 1 || isVisible.value) return;

        clearDisplayTimer();
        displayTimer = setTimeout(() => {
            displayTimer = null;
            if (isConnecting.value) {
                isVisible.value = true;
            }
        }, DISPLAY_DELAY_MS);
    };

    const finishRequest = () => {
        pendingRequests.value = Math.max(pendingRequests.value - 1, 0);

        if (isConnecting.value) return;

        clearDisplayTimer();
        isVisible.value = false;
        message.value = DEFAULT_MESSAGE;
    };

    const showImmediately = (nextMessage = DEFAULT_MESSAGE) => {
        clearDisplayTimer();
        message.value = nextMessage;
        isVisible.value = true;
    };

    const hideImmediately = () => {
        if (isConnecting.value) return;

        clearDisplayTimer();
        isVisible.value = false;
        message.value = DEFAULT_MESSAGE;
    };

    return {
        pendingRequests,
        isConnecting,
        isVisible,
        message,
        startRequest,
        finishRequest,
        showImmediately,
        hideImmediately,
    };
});
