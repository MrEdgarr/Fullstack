import { defineStore } from "pinia";
import { ref } from "vue";

export const useToastStore = defineStore("toast", () => {
    const toasts = ref([]);
    const DEFAULT_DURATION = 3000;

    const addToast = (message, type = "info", duration = DEFAULT_DURATION) => {
        const id = Date.now() + Math.random().toString(36).substring(2, 9);
        const toast = { id, message, type };
        
        toasts.value.push(toast);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id) => {
        toasts.value = toasts.value.filter((t) => t.id !== id);
    };

    const success = (message, duration) => addToast(message, "success", duration);
    const error = (message, duration) => addToast(message, "error", duration);
    const info = (message, duration) => addToast(message, "info", duration);
    const warning = (message, duration) => addToast(message, "warning", duration);

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        warning,
    };
});
