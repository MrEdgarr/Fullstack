import { COMBOS_DATA } from "@/utils/constants/combosData";
import { saveBookingData, loadBookingData } from "@/utils/helpers/storage";
export const useComboStore = defineStore("combo", () => {
    const selectedCombos = ref({});

    // Tăng giảm số lượng combo
    const increaseCombo = (comboId) => {
        const current = selectedCombos.value[comboId] || 0;
        if (current < 10) {
            selectedCombos.value[comboId] = current + 1;
        }
    };
    const decreaseCombo = (comboId) => {
        const current = selectedCombos.value[comboId] || 0;
        if (current > 0) {
            selectedCombos.value[comboId] = current - 1;
            if (selectedCombos.value[comboId] === 0) {
                delete selectedCombos.value[comboId];
            }
        }
    };

    // Dùng computed để tạo danh sách combo đã chọn với thông tin chi tiết
    const singleCombosList = computed(() => {
        return Object.entries(selectedCombos.value)
            .filter(([id, qty]) => qty > 0)
            .map(([id, qty]) => {
                const comboInfo = COMBOS_DATA.find((c) => c.id === Number(id));
                return { ...comboInfo, qty };
            });
    });
    // Tính tổng tiền của các combo đã chọn
    const totalFoodPrice = computed(() => {
        return Object.entries(selectedCombos.value).reduce((sum, [id, qty]) => {
            const combo = COMBOS_DATA.find((c) => c.id === Number(id));
            return sum + (combo ? combo.price * qty : 0);
        }, 0);
    });

    const resetCombos = () => {
        selectedCombos.value = {};
        singleCombosList.value = [];
    };

    onMounted(() => {
        const saved = loadBookingData();
        if (saved?.combos) selectedCombos.value = saved.combos;
    });

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
        selectedCombos,
        increaseCombo,
        decreaseCombo,
        totalFoodPrice,
        resetCombos,
        singleCombosList,
    };
});
