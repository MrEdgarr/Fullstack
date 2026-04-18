import { PROMO_CODE_DATA } from "@/utils/constants/promoCodes";
import { saveBookingData, loadBookingData } from "@/utils/helpers/storage";
import { PAYMENT_DATA } from "@/utils/constants/paymentData";
export const usePaymentStore = defineStore("payment", () => {
    // State
    const promoCode = ref("");
    const discountPercent = ref(0);
    const selectedMethod = ref(1);
    const promoError = ref("");

    const paymentMethod = computed(() => {
        return PAYMENT_DATA.find((p) => p.id === selectedMethod.value);
    });

    // Actions
    const applyPromo = (code) => {
        if (!validatePromoCode(code)) return false;
        const upperCode = code.trim().toUpperCase();

        const found = PROMO_CODE_DATA.find((p) => p.code === upperCode);

        if (found) {
            discountPercent.value = found.discount;
            promoCode.value = upperCode;
            promoError.value = "";
            return true;
        } else {
            promoError.value = "Mã khuyến mãi không tồn tại hoặc đã hết hạn";
            return false;
        }
    };

    const validatePromoCode = (code) => {
        const trimmed = code.trim().toUpperCase();

        if (trimmed === "") {
            promoError.value = "";
            return false;
        }
        if (trimmed.length < 4 || trimmed.length > 10) {
            promoError.value = "Mã khuyến mãi phải từ 4 đến 10 ký tự";
            return false;
        }
        if (!/^[A-Z0-9]+$/.test(trimmed)) {
            promoError.value = "Chỉ được dùng chữ cái (A-Z) và số (0-9)";
            return false;
        }

        promoError.value = "";
        return true;
    };

    const removePromo = () => {
        promoCode.value = "";
        discountPercent.value = 0;
        promoError.value = "";
    };

    const setPaymentMethod = (methodId) => {
        selectedMethod.value = methodId;
    };

    const resetPayment = () => {
        promoCode.value = "";
        discountPercent.value = 0;
        selectedMethod.value = 1;
    };

    onMounted(() => {
        const saved = loadBookingData();
        if (saved?.payment) {
            promoCode.value = saved.payment.promoCode || "";
            discountPercent.value = saved.payment.discountPercent || 0;
            selectedMethod.value = saved.payment.selectedMethod || 1;
        }
    });

    watch(
        [promoCode, discountPercent, selectedMethod],
        () => {
            const current = loadBookingData() || {};
            current.payment = {
                promoCode: promoCode.value,
                discountPercent: discountPercent.value,
                selectedMethod: selectedMethod.value,
            };
            if (promoCode.value === "") removePromo();
            saveBookingData(current);
        },
        { deep: true },
    );

    return {
        promoCode,
        discountPercent,
        selectedMethod,
        promoError,
        paymentMethod,

        validatePromoCode,
        applyPromo,
        removePromo,
        setPaymentMethod,
        resetPayment,
    };
});
