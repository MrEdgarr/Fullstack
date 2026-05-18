import { SEATS_DATA } from "@/utils/constants/seatsData";
import { saveBookingData, loadBookingData } from "@/utils/helpers/storage";

// Pre-build lookup maps (chạy 1 lần khi module load)
const seatById = new Map(SEATS_DATA.map((s) => [s.id, s]));
const couplePairs = new Map();
SEATS_DATA.filter((s) => s.type === "couple").forEach((s) => {
    const pairNumber = s.number % 2 === 1 ? s.number + 1 : s.number - 1;
    const pair = SEATS_DATA.find(
        (p) => p.row === s.row && p.number === pairNumber && p.type === "couple",
    );
    if (pair) couplePairs.set(s.id, pair.id);
});

const MAX_SEATS = 10;

export const useSeatStore = defineStore("seat", () => {
    // ==================== STATE ======================
    const selectedSeats = ref(loadBookingData()?.seats || []);

    // Set để kiểm tra ghế đã chọn O(1)
    const selectedIds = computed(() => new Set(selectedSeats.value.map((s) => s.id)));

    // ==================== GETTERS ====================
    // Nhóm ghế đã chọn theo loại (computed duy nhất, các getter khác derive từ đây)
    const groupedSelectedSeats = computed(() => {
        const singles = [];
        const couples = [];
        for (const s of selectedSeats.value) {
            if (s.type === "single" || s.type === "vip") {
                singles.push(s);
            } else if (s.type === "couple") {
                couples.push(s);
            }
        }
        return { singles, couples };
    });

    // Đếm số lượng ghế theo loại
    const singleSeatsCount = computed(() => groupedSelectedSeats.value.singles.length);
    const coupleSeatsCount = computed(() =>
        Math.floor(groupedSelectedSeats.value.couples.length / 2),
    );

    // Tổng ghế đã chọn (ghế đơn + ghế đôi tính là 1)
    const totalSeatsSelected = computed(() => singleSeatsCount.value + coupleSeatsCount.value * 2);

    // Danh sách ghế đã chọn dạng text
    const singleSeatsList = computed(() =>
        groupedSelectedSeats.value.singles.map((s) => `${s.row}${s.number}`).join(", "),
    );
    const coupleSeatsList = computed(() =>
        groupedSelectedSeats.value.couples.map((s) => `${s.row}${s.number}`).join(", "),
    );

    // Tổng tiền theo loại ghế
    const singleTotalPrice = computed(() =>
        groupedSelectedSeats.value.singles.reduce((sum, s) => sum + s.price, 0),
    );
    const coupleTotalPrice = computed(() =>
        groupedSelectedSeats.value.couples.reduce((sum, s) => sum + s.price, 0),
    );

    // ==================== ACTIONS ====================
    const isSeatSelected = (seatId) => selectedIds.value.has(seatId);

    const toggleSeat = (seat) => {
        if (!seat.isAvailable) return;

        const isSelected = isSeatSelected(seat.id);
        const remaining = MAX_SEATS - totalSeatsSelected.value;

        if (seat.type === "single" || seat.type === "vip") {
            if (isSelected) {
                selectedSeats.value = selectedSeats.value.filter((s) => s.id !== seat.id);
            } else {
                if (remaining < 1) {
                    return alert("Bạn chỉ được chọn tối đa 10 ghế (ghế đơn + ghế đôi)!");
                }
                selectedSeats.value.push({ ...seat });
            }
        } else {
            // Ghế đôi: tự động chọn/bỏ cả cặp
            const pairId = couplePairs.get(seat.id);
            if (!pairId) return;

            const pairSeat = seatById.get(pairId);
            if (!pairSeat?.isAvailable) return;

            const bothSelected = isSeatSelected(seat.id) && isSeatSelected(pairId);

            if (bothSelected) {
                const removeIds = new Set([seat.id, pairId]);
                selectedSeats.value = selectedSeats.value.filter((s) => !removeIds.has(s.id));
            } else {
                if (remaining < 2) {
                    return alert("Bạn chỉ được chọn tối đa 10 ghế! Ghế đôi cần 2 chỗ trống.");
                }
                if (!isSeatSelected(seat.id)) selectedSeats.value.push({ ...seat });
                if (!isSeatSelected(pairId)) selectedSeats.value.push({ ...pairSeat });
            }
        }
    };

    const resetSeats = () => {
        selectedSeats.value = [];
    };

    watch(
        selectedSeats,
        (newSeats) => {
            const current = loadBookingData() || {};
            current.seats = newSeats;
            saveBookingData(current);
        },
        { deep: true },
    );

    return {
        // STATE
        selectedSeats,
        // GETTERS
        singleSeatsCount,
        coupleSeatsCount,
        totalSeatsSelected,
        singleSeatsList,
        coupleSeatsList,
        singleTotalPrice,
        coupleTotalPrice,
        // ACTIONS
        isSeatSelected,
        toggleSeat,
        resetSeats,
    };
});
