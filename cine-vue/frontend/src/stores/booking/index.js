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
        calculatePromotionDiscount(
            totalPrice.value,
            paymentStore.promotion,
            paymentStore.discountPercent,
        ),
    );

    const finalPrice = computed(() => Math.max(totalPrice.value - voucherPrice.value, 0));
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

const calculatePromotionDiscount = (subtotal, promotion, fallbackPercent = 0) => {
    if (!subtotal) return 0;

    if (!promotion) {
        return Math.round(subtotal * (Number(fallbackPercent || 0) / 100));
    }

    if (subtotal < Number(promotion.min_order_amount || 0)) {
        return 0;
    }

    const rawDiscount =
        promotion.discount_type === "percent"
            ? subtotal * (Number(promotion.discount_value || 0) / 100)
            : Number(promotion.discount_value || 0);

    const maxDiscount =
        promotion.max_discount_amount === null || promotion.max_discount_amount === undefined
            ? rawDiscount
            : Number(promotion.max_discount_amount);

    return Math.round(Math.min(rawDiscount, maxDiscount, subtotal));
};
