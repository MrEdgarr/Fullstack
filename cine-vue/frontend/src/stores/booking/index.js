import { useSeatStore } from "./useSeatStore";
import { useComboStore } from "./useComboStore";
import { usePaymentStore } from "./usePaymentStore";
import { useStepStore } from "./useStepStore";
import { loadBookingData, saveBookingData, clearBookingData } from "@/utils/helpers/storage";

export const useBookingStore = defineStore("booking", () => {
    // ==================== STATE ======================
    const selectedShowtime = ref(loadBookingData()?.showtime || null);
    const seatStore = useSeatStore();
    const comboStore = useComboStore();
    const paymentStore = usePaymentStore();
    const stepStore = useStepStore();

    // ==================== GETTERS ====================
    // Tính tổng tiền dựa trên giá ghế và combo đã chọn
    const totalPrice = computed(
        () => seatStore.singleTotalPrice + seatStore.coupleTotalPrice + comboStore.totalFoodPrice,
    );
    const voucherPrice = computed(() =>
        Math.round(totalPrice.value * (paymentStore.discountPercent / 100)),
    );

    const finalPrice = computed(() =>
        Math.round(totalPrice.value * (1 - paymentStore.discountPercent / 100)),
    );
    // Tạo computed để hiển thị thông tin ghế đã chọn
    const selectedSeatsInfo = computed(() => {
        const parts = [];
        if (seatStore.singleSeatsCount > 0) parts.push(`${seatStore.singleSeatsCount}x Ghế đơn`);
        if (seatStore.coupleSeatsCount > 0) parts.push(`${seatStore.coupleSeatsCount}x Ghế đôi`);
        return parts.join(" + ") || "Chưa chọn ghế";
    });

    // ==================== ACTIONS ====================
    const setSelectedShowtime = (showtime) => {
        selectedShowtime.value = showtime;
    };

    const resetAll = async () => {
        selectedShowtime.value = null;
        seatStore.resetSeats();
        comboStore.resetCombos();
        paymentStore.resetPayment();
        stepStore.setStep(1);
        await nextTick();
        clearBookingData();
    };

    watch(
        selectedShowtime,
        (newShowtime) => {
            const current = loadBookingData() || {};
            current.showtime = newShowtime;
            saveBookingData(current);
        },
        { deep: true },
    );

    return {
        seatStore, //  expose toàn bộ seat
        comboStore, //  expose toàn bộ combo
        paymentStore, //  expose toàn bộ payment
        stepStore, //  expose toàn bộ step
        totalPrice,
        voucherPrice,
        finalPrice,
        selectedSeatsInfo,

        selectedShowtime,
        setSelectedShowtime,

        resetAll,
    };
});
