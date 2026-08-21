import { defineStore } from "pinia";
import { ref } from "vue";

export const useDialogStore = defineStore("dialog", () => {
    const isOpen = ref(false);
    const title = ref("");
    const message = ref("");
    const confirmText = ref("Đồng ý");
    const cancelText = ref(""); // If empty, it's just an alert (no cancel button)
    
    // Callbacks
    let onConfirmCallback = null;
    let onCancelCallback = null;

    const alert = (options) => {
        title.value = options.title || "Thông báo";
        message.value = options.message || "";
        confirmText.value = options.confirmText || "Đồng ý";
        cancelText.value = ""; // Alert only has confirm button
        onConfirmCallback = options.onConfirm || null;
        isOpen.value = true;
    };

    const confirm = (options) => {
        title.value = options.title || "Xác nhận";
        message.value = options.message || "";
        confirmText.value = options.confirmText || "Đồng ý";
        cancelText.value = options.cancelText || "Hủy";
        onConfirmCallback = options.onConfirm || null;
        onCancelCallback = options.onCancel || null;
        isOpen.value = true;
    };

    const close = () => {
        isOpen.value = false;
    };

    const handleConfirm = () => {
        close();
        if (onConfirmCallback) {
            onConfirmCallback();
        }
    };

    const handleCancel = () => {
        close();
        if (onCancelCallback) {
            onCancelCallback();
        }
    };

    return {
        isOpen,
        title,
        message,
        confirmText,
        cancelText,
        alert,
        confirm,
        close,
        handleConfirm,
        handleCancel
    };
});
