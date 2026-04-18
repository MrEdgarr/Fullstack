import { useStepStore } from "./useStepStore";

export const useBookingStore = defineStore("booking", () => {
    // ==================== STATE ======================
    const stepStore = useStepStore();
    // ==================== GETTERS ====================

    // ==================== ACTIONS ====================
    const resetAll = () => {
        stepStore.setStep(1);
    };

    return {
        stepStore,

        resetAll,
    };
});
