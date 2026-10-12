import { computed, onScopeDispose, ref } from "vue";
import { defineStore } from "pinia";

const DISPLAY_DELAY_MS = 100;
const MAX_LOADING_MS = 61000;
const DEFAULT_MESSAGE = "Đang tải dữ liệu...";

export const useServerConnectionStore = defineStore("serverConnection", () => {
    const pendingRequests = ref(0);
    const isVisible = ref(false);
    const message = ref(DEFAULT_MESSAGE);
    const subMessage = ref("");
    let displayTimer = null;
    let safetyTimer = null;

    const isConnecting = computed(() => pendingRequests.value > 0);

    const clearDisplayTimer = () => {
        if (!displayTimer) return;

        clearTimeout(displayTimer);
        displayTimer = null;
    };

    const clearSafetyTimer = () => {
        if (!safetyTimer) return;

        clearTimeout(safetyTimer);
        safetyTimer = null;
    };

    const resetLoadingContent = () => {
        message.value = DEFAULT_MESSAGE;
        subMessage.value = "";
    };

    const hideImmediately = () => {
        clearDisplayTimer();
        clearSafetyTimer();
        isVisible.value = false;
        resetLoadingContent();
    };

    const startRequest = () => {
        pendingRequests.value += 1;

        if (pendingRequests.value > 1 || isVisible.value) return;

        clearDisplayTimer();
        resetLoadingContent();

        // Thời gian chờ an toàn: tự động ẩn sau khoảng thời gian chờ của API để tránh tình trạng tải vô hạn
        clearSafetyTimer();
        safetyTimer = setTimeout(() => {
            safetyTimer = null;
            if (isConnecting.value) {
                console.warn("[ServerConnection] Safety timeout reached, forcing hide");
                pendingRequests.value = 0;
                hideImmediately();
            }
        }, MAX_LOADING_MS);

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

        clearSafetyTimer();
        hideImmediately();
    };

    onScopeDispose(() => {
        clearDisplayTimer();
        clearSafetyTimer();
    });

    return {
        pendingRequests: computed(() => pendingRequests.value),
        isConnecting,
        isVisible,
        message,
        subMessage,
        startRequest,
        finishRequest,
    };
});
