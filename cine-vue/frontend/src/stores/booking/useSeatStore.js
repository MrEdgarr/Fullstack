// stores/useSeatStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { SEATS_DATA } from "@/utils/constants/seatsData";
import { saveBookingData, loadBookingData } from "@/utils/helpers/storage";
export const useSeatStore = defineStore("seat", () => {
    const selectedSeats = ref([]);

    // ==================== GROUPED SEATS ====================
    // Tạo computed để nhóm ghế đã chọn theo loại
    const groupedSelectedSeats = computed(() => {
        const singles = selectedSeats.value.filter((s) => s.type === "single");
        // .sort((a, b) => a.id - b.id)
        const couples = selectedSeats.value.filter((s) => s.type === "couple");
        // .sort((a, b) => a.id - b.id)
        return { singles, couples };
    });

    const totalSeatsSelected = computed(() => {
        const singles = selectedSeats.value.filter((s) => s.type === "single").length;
        const couples = Math.floor(selectedSeats.value.filter((s) => s.type === "couple").length);
        return singles + couples;
    });

    // Tạo computed để đếm số lượng và hiển thị danh sách ghế đã chọn theo loại
    const singleSeatsCount = computed(() => groupedSelectedSeats.value.singles.length);
    const coupleSeatsCount = computed(() =>
        Math.floor(groupedSelectedSeats.value.couples.length / 2),
    );

    // Tạo computed để hiển thị danh sách ghế đã chọn theo loại
    const singleSeatsList = computed(
        () => groupedSelectedSeats.value.singles.map((s) => `${s.row}${s.number}`).join(", ") || "",
    );

    const coupleSeatsList = computed(
        () =>
            groupedSelectedSeats.value.couples
                .map((s) => `${s.row}${s.number}`)
                // .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
                .join(", ") || "",
    );

    // Tính tổng tiền của ghế đã chọn theo loại
    const singleTotalPrice = computed(() =>
        groupedSelectedSeats.value.singles.reduce((sum, s) => sum + s.price, 0),
    );
    const coupleTotalPrice = computed(() =>
        groupedSelectedSeats.value.couples.reduce((sum, s) => sum + s.price, 0),
    );
    // Helper tìm ghế đôi
    const getPairSeat = (seat) => {
        if (seat.type !== "couple") return null;
        const n = seat.number;
        const pairNumber = n % 2 === 1 ? n + 1 : n - 1;
        return SEATS_DATA.find(
            (s) => s.row === seat.row && s.number === pairNumber && s.type === "couple",
        );
    };

    // Toggle chọn/bỏ ghế
    const toggleSeat = (seat) => {
        if (!seat.isAvailable) return;

        const isSelectedNow = selectedSeats.value.some((s) => s.id === seat.id);
        if (
            (!isSelectedNow && totalSeatsSelected.value >= 10) ||
            (totalSeatsSelected.value == 9 && seat.type === "couple")
        )
            return alert("Bạn chỉ được chọn tối đa 10 ghế (ghế đơn + ghế đôi)!");

        if (seat.type === "single" || seat.type === "vip") {
            const index = selectedSeats.value.findIndex((s) => s.id === seat.id);
            if (index !== -1) {
                selectedSeats.value.splice(index, 1);
            } else {
                selectedSeats.value.push({ ...seat });
            }
        } else {
            // Ghế đôi: tự động chọn/bỏ cả cặp
            const pair = getPairSeat(seat);
            if (!pair || !pair.isAvailable) return;

            const seatIds = [seat.id, pair.id];
            const bothSelected = seatIds.every((id) =>
                selectedSeats.value.some((s) => s.id === id),
            );

            if (bothSelected) {
                selectedSeats.value = selectedSeats.value.filter((s) => !seatIds.includes(s.id));
            } else {
                [seat, pair].forEach((s) => {
                    if (!selectedSeats.value.some((sel) => sel.id === s.id)) {
                        selectedSeats.value.push({ ...s });
                    }
                });
            }
        }
    };
    const resetSeats = () => {
        selectedSeats.value = [];
    };

    onMounted(() => {
        const saved = loadBookingData();
        if (saved?.seats) selectedSeats.value = saved.seats;
    });

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
        selectedSeats,
        toggleSeat,
        singleSeatsCount,
        coupleSeatsCount,
        singleSeatsList,
        coupleSeatsList,
        singleTotalPrice,
        coupleTotalPrice,
        resetSeats,
    };
});
