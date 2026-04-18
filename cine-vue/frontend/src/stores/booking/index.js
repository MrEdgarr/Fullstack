import { useSeatStore } from "./useSeatStore";
import { useStepStore } from "./useStepStore";

export const useBookingStore = defineStore("booking", () => {
    // ==================== STATE ======================
    const seatStore = useSeatStore();
    const stepStore = useStepStore();
    // ==================== GETTERS ====================
    // Tính tổng tiền dựa trên giá ghế và combo đã chọn
    const totalPrice = computed(() => seatStore.singleTotalPrice + seatStore.coupleTotalPrice);
    // Tạo computed để hiển thị thông tin ghế đã chọn
    const selectedSeatsInfo = computed(() => {
        const parts = [];
        if (seatStore.singleSeatsCount > 0) parts.push(`${seatStore.singleSeatsCount}x Ghế đơn`);
        if (seatStore.coupleSeatsCount > 0) parts.push(`${seatStore.coupleSeatsCount}x Ghế đôi`);
        return parts.join(" + ") || "Chưa chọn ghế";
    });

    // ==================== ACTIONS ====================
    const resetAll = () => {
        seatStore.resetSeats();
        stepStore.setStep(1);
    };

    return {
        seatStore,
        stepStore,
        totalPrice,
        selectedSeatsInfo,
        resetAll,
    };
});
