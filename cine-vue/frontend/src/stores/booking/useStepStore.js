import { defineStore } from "pinia";
import { saveBookingData, loadBookingData } from "@/utils/helpers/storage";

export const useStepStore = defineStore("step", () => {
    // ==================== STATE ======================
    const currentStep = ref(1);

    const stepLabels = reactive([
        { id: 1, label: "Chọn ghế" },
        { id: 2, label: "Bắp nước" },
        { id: 3, label: "Thanh toán" },
    ]);
    const totalSteps = ref(stepLabels.length);

    // ==================== GETTERS ====================
    const isFirstStep = computed(() => currentStep.value === 1);

    const isLastStep = computed(() => currentStep.value === totalSteps.value);

    const progressPercentage = computed(() => {
        return (currentStep.value / totalSteps.value) * 100;
    });

    // ==================== ACTIONS ====================
    const nextStep = () => {
        if (currentStep.value < totalSteps.value) currentStep.value++;
    };
    const prevStep = () => {
        if (currentStep.value > 1) currentStep.value--;
    };
    const setStep = (stepNumber) => {
        currentStep.value = stepNumber;
    };

    onMounted(() => {
        const saved = loadBookingData();
        if (saved?.currentStep) currentStep.value = saved.currentStep;
    });

    watch(
        currentStep,
        (newStep) => {
            const current = loadBookingData() || {};
            current.currentStep = newStep;
            saveBookingData(current);
        },
        { deep: true },
    );

    return {
        stepLabels,
        currentStep,
        totalSteps,
        isFirstStep,
        isLastStep,
        progressPercentage,
        nextStep,
        prevStep,
        setStep,
    };
});
