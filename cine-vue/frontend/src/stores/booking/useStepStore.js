import { defineStore } from "pinia";
import { saveBookingData, loadBookingData } from "@/utils/helpers/storage";

const STEP_LABELS = [
    { id: 1, label: "Chọn ghế" },
    { id: 2, label: "Bắp nước" },
    { id: 3, label: "Thanh toán" },
];

export const useStepStore = defineStore("step", () => {
    // ==================== STATE ======================
    const currentStep = ref(loadBookingData()?.currentStep || 1);
    const stepLabels = STEP_LABELS;
    const totalSteps = STEP_LABELS.length;

    // ==================== GETTERS ====================
    const isFirstStep = computed(() => currentStep.value === 1);
    const isLastStep = computed(() => currentStep.value === totalSteps);

    const progressPercentage = computed(() => {
        return (currentStep.value / totalSteps) * 100;
    });

    // ==================== ACTIONS ====================
    const nextStep = () => {
        if (currentStep.value < totalSteps) currentStep.value++;
    };
    const prevStep = () => {
        if (currentStep.value > 1) currentStep.value--;
    };
    const setStep = (stepNumber) => {
        currentStep.value = stepNumber;
    };

    watch(currentStep, (newStep) => {
        const current = loadBookingData() || {};
        current.currentStep = newStep;
        saveBookingData(current);
    });

    return {
        // STATE
        currentStep,
        stepLabels,
        totalSteps,
        // GETTERS
        isFirstStep,
        isLastStep,
        progressPercentage,
        // ACTIONS
        nextStep,
        prevStep,
        setStep,
    };
});
