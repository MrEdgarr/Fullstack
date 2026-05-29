import { computed, ref } from "vue";
import { defineStore } from "pinia";

const DISPLAY_DELAY_MS = 100;
const DEFAULT_MESSAGE = "Đang tải dữ liệu...";
const FIRST_CONNECTION_HINT = "Lần kết nối đầu tiên có thể mất thêm vài giây.";
const FIRST_CONNECTION_HINT_KEY = "cine-vue:first-connection-hint-shown";

export const useServerConnectionStore = defineStore("serverConnection", () => {
    const pendingRequests = ref(0);
    const isVisible = ref(false);
    const message = ref(DEFAULT_MESSAGE);
    const subMessage = ref("");
    let displayTimer = null;

    const isConnecting = computed(() => pendingRequests.value > 0);

    const clearDisplayTimer = () => {
        if (!displayTimer) return;

        clearTimeout(displayTimer);
        displayTimer = null;
    };

    const resetLoadingContent = () => {
        message.value = DEFAULT_MESSAGE;
        subMessage.value = "";
    };

    const shouldShowFirstConnectionHint = () => {
        if (typeof sessionStorage === "undefined") return true;

        try {
            return sessionStorage.getItem(FIRST_CONNECTION_HINT_KEY) !== "true";
        } catch {
            return true;
        }
    };

    const markFirstConnectionHintShown = () => {
        if (typeof sessionStorage === "undefined") return;

        try {
            sessionStorage.setItem(FIRST_CONNECTION_HINT_KEY, "true");
        } catch {
            // Ignore storage errors. Loading should still work normally.
        }
    };

    const hideImmediately = () => {
        clearDisplayTimer();
        isVisible.value = false;
        resetLoadingContent();
    };

    const startRequest = () => {
        pendingRequests.value += 1;

        if (pendingRequests.value > 1 || isVisible.value) return;

        clearDisplayTimer();
        resetLoadingContent();

        const shouldShowHint = shouldShowFirstConnectionHint();

        displayTimer = setTimeout(() => {
            displayTimer = null;
            if (isConnecting.value) {
                if (shouldShowHint) {
                    subMessage.value = FIRST_CONNECTION_HINT;
                    markFirstConnectionHintShown();
                }

                isVisible.value = true;
            }
        }, DISPLAY_DELAY_MS);
    };

    const finishRequest = () => {
        pendingRequests.value = Math.max(pendingRequests.value - 1, 0);

        if (isConnecting.value) return;

        hideImmediately();
    };

    return {
        pendingRequests,
        isConnecting,
        isVisible,
        message,
        subMessage,
        startRequest,
        finishRequest,
    };
});
