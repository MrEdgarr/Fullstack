import api from "@/_services/api";
import { saveBookingData, loadBookingData } from "@/utils/helpers/storage";
import { PAYMENT_DATA, resolvePaymentIcon } from "@/utils/constants/paymentData";

export const usePaymentStore = defineStore("payment", () => {
    const savedPayment = loadBookingData()?.payment || {};

    const promoCode = ref(savedPayment.promoCode || "");
    const promotion = ref(savedPayment.promotion || null);
    const discountPercent = ref(savedPayment.discountPercent || 0);
    const selectedMethod = ref(savedPayment.selectedMethod || 1);
    const paymentMethods = ref(PAYMENT_DATA);
    const isLoadingMethods = ref(false);
    const methodsError = ref("");
    const promoError = ref("");
    const isApplyingPromo = ref(false);
    const isTicketInfo = ref(false);
    const lastTicket = ref(null);

    const paymentMethod = computed(
        () =>
            paymentMethods.value.find((p) => Number(p.id) === Number(selectedMethod.value)) ||
            paymentMethods.value[0] ||
            null,
    );

    const fetchPaymentMethods = async () => {
        if (isLoadingMethods.value) return;

        isLoadingMethods.value = true;
        methodsError.value = "";

        try {
            const res = await api.get("/payments/methods");
            const methods = (res.data.data || []).map(normalizePaymentMethod);

            paymentMethods.value = methods.length ? methods : PAYMENT_DATA;
            ensureSelectedMethod();
        } catch (err) {
            paymentMethods.value = PAYMENT_DATA;
            methodsError.value =
                err.response?.data?.message ||
                "Không thể tải phương thức thanh toán. Đang dùng dữ liệu mặc định.";
            ensureSelectedMethod();
        } finally {
            isLoadingMethods.value = false;
        }
    };

    const normalizePaymentMethod = (method) => ({
        id: Number(method.payment_method_id || method.id),
        payment_method_id: Number(method.payment_method_id || method.id),
        code: method.code,
        name: method.name,
        payment_method: method.payment_method,
        icon_key: method.icon_key,
        image: method.icon_url || resolvePaymentIcon(method.icon_key),
        description: method.description || "",
        sort_order: Number(method.sort_order || 0),
    });

    const ensureSelectedMethod = () => {
        const hasSelectedMethod = paymentMethods.value.some(
            (method) => Number(method.id) === Number(selectedMethod.value),
        );

        if (!hasSelectedMethod) {
            selectedMethod.value = paymentMethods.value[0]?.id || 1;
        }
    };

    const openTicketModal = () => {
        isTicketInfo.value = true;
    };

    const closeTicketModal = () => {
        isTicketInfo.value = false;
    };

    const applyPromo = async (code) => {
        if (!validatePromoCode(code)) return false;

        const upperCode = code.trim().toUpperCase();
        isApplyingPromo.value = true;

        try {
            const res = await api.get(`/promotions/${upperCode}/validate`);
            const promo = res.data.data;

            promotion.value = promo;
            discountPercent.value =
                promo.discount_type === "percent" ? Number(promo.discount_value || 0) : 0;
            promoCode.value = upperCode;
            promoError.value = "";

            return true;
        } catch (err) {
            promotion.value = null;
            discountPercent.value = 0;
            promoError.value =
                err.response?.data?.message || "Mã khuyến mãi không tồn tại hoặc đã hết hạn";
            return false;
        } finally {
            isApplyingPromo.value = false;
        }
    };

    const validatePromoCode = (code) => {
        const trimmed = code.trim().toUpperCase();

        if (trimmed === "") {
            promoError.value = "";
            return false;
        }

        if (trimmed.length < 4 || trimmed.length > 50) {
            promoError.value = "Mã khuyến mãi phải từ 4 đến 50 ký tự";
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
        promotion.value = null;
        discountPercent.value = 0;
        promoError.value = "";
    };

    const setPaymentMethod = (methodId) => {
        selectedMethod.value = methodId;
    };

    const setLastTicket = (ticket) => {
        lastTicket.value = ticket;
    };

    const resetPayment = () => {
        promoCode.value = "";
        promotion.value = null;
        discountPercent.value = 0;
        selectedMethod.value = paymentMethods.value[0]?.id || 1;
        promoError.value = "";
        isTicketInfo.value = false;
        lastTicket.value = null;
    };

    watch(
        [promoCode, promotion, discountPercent, selectedMethod],
        ([newPromoCode, newPromotion, newDiscount, newMethod]) => {
            if (newPromoCode === "" && (newDiscount !== 0 || newPromotion)) {
                promotion.value = null;
                discountPercent.value = 0;
                promoError.value = "";
                return;
            }

            const current = loadBookingData() || {};
            current.payment = {
                promoCode: newPromoCode,
                promotion: newPromotion,
                discountPercent: newDiscount,
                selectedMethod: newMethod,
            };
            saveBookingData(current);
        },
        { deep: true },
    );

    return {
        promoCode,
        promotion,
        discountPercent,
        selectedMethod,
        paymentMethods,
        isLoadingMethods,
        methodsError,
        promoError,
        isApplyingPromo,
        isTicketInfo,
        lastTicket,
        paymentMethod,
        fetchPaymentMethods,
        openTicketModal,
        closeTicketModal,
        validatePromoCode,
        applyPromo,
        removePromo,
        setPaymentMethod,
        setLastTicket,
        resetPayment,
    };
});
