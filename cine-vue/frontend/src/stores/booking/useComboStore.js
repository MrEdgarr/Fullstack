import api from "@/_services/api";
import { saveBookingData, loadBookingData } from "@/utils/helpers/storage";

const normalizeCombo = (combo) => ({
    id: Number(combo.food_combo_id),
    food_combo_id: Number(combo.food_combo_id),
    cinema_id: Number(combo.cinema_id),
    name: combo.combo_name,
    description: combo.description,
    image_url: combo.image_url,
    price: Number(combo.price || 0),
});

export const useComboStore = defineStore("combo", () => {
    const combos = ref([]);
    const selectedCombos = ref(loadBookingData()?.combos || {});
    const isLoading = ref(false);
    const error = ref("");

    const singleCombosList = computed(() => {
        return Object.entries(selectedCombos.value)
            .filter(([_id, qty]) => qty > 0)
            .map(([id, qty]) => {
                const comboInfo = combos.value.find((combo) => combo.id === Number(id));
                return comboInfo ? { ...comboInfo, qty } : null;
            })
            .filter(Boolean);
    });

    const totalFoodPrice = computed(() => {
        return Object.entries(selectedCombos.value).reduce((sum, [id, qty]) => {
            const combo = combos.value.find((item) => item.id === Number(id));
            return sum + (combo ? combo.price * qty : 0);
        }, 0);
    });

    const fetchCombos = async (cinemaId) => {
        if (!cinemaId) {
            combos.value = [];
            selectedCombos.value = {};
            return [];
        }

        isLoading.value = true;
        error.value = "";

        try {
            const res = await api.get("/combos");
            combos.value = (res.data.data || [])
                .map(normalizeCombo)
                .filter((combo) => combo.cinema_id === Number(cinemaId));
            removeUnavailableSelectedCombos();
            return combos.value;
        } catch (err) {
            error.value = err.response?.data?.message || "Không thể tải combo";
            combos.value = [];
            selectedCombos.value = {};
            return [];
        } finally {
            isLoading.value = false;
        }
    };

    const removeUnavailableSelectedCombos = () => {
        const validIds = new Set(combos.value.map((combo) => String(combo.id)));
        selectedCombos.value = Object.fromEntries(
            Object.entries(selectedCombos.value).filter(([id, qty]) => validIds.has(id) && qty > 0),
        );
    };

    const increaseCombo = (comboId) => {
        if (!combos.value.some((combo) => combo.id === Number(comboId))) return;

        const current = selectedCombos.value[comboId] || 0;
        if (current < 10) selectedCombos.value[comboId] = current + 1;
    };

    const decreaseCombo = (comboId) => {
        const current = selectedCombos.value[comboId] || 0;
        if (current > 0) {
            selectedCombos.value[comboId] = current - 1;
            if (selectedCombos.value[comboId] === 0) delete selectedCombos.value[comboId];
        }
    };

    const resetCombos = () => {
        selectedCombos.value = {};
    };

    watch(
        selectedCombos,
        (newCombos) => {
            const current = loadBookingData() || {};
            current.combos = newCombos;
            saveBookingData(current);
        },
        { deep: true },
    );

    return {
        combos,
        selectedCombos,
        isLoading,
        error,
        fetchCombos,
        increaseCombo,
        decreaseCombo,
        totalFoodPrice,
        resetCombos,
        singleCombosList,
    };
});
