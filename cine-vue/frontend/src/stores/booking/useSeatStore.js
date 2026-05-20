import api from "@/_services/api";
import { saveBookingData, loadBookingData } from "@/utils/helpers/storage";

const MAX_SEATS = 10;

const normalizeSeat = (seat) => {
    const status = seat.status || "available";
    const type = seat.seat_type === "standard" ? "single" : seat.seat_type;
    const heldUntil = seat.held_until || null;
    const heldExpired = status === "held" && heldUntil && new Date(heldUntil) <= new Date();

    return {
        id: Number(seat.showtime_seat_id),
        showtimeSeatId: Number(seat.showtime_seat_id),
        showtime_seat_id: Number(seat.showtime_seat_id),
        showtimeId: Number(seat.showtime_id),
        showtime_id: Number(seat.showtime_id),
        seatId: Number(seat.seat_id),
        seat_id: Number(seat.seat_id),
        row: seat.row_letter,
        number: Number(seat.seat_number),
        type,
        backendType: seat.seat_type,
        status: heldExpired ? "available" : status,
        heldUntil,
        price: Number(seat.price || 0),
        isAvailable: heldExpired || status === "available",
    };
};

export const useSeatStore = defineStore("seat", () => {
    const seats = ref([]);
    const selectedSeats = ref(loadBookingData()?.seats || []);
    const isLoading = ref(false);
    const error = ref("");

    const seatById = computed(() => new Map(seats.value.map((seat) => [seat.id, seat])));
    const selectedIds = computed(() => new Set(selectedSeats.value.map((seat) => seat.id)));

    const couplePairs = computed(() => {
        const pairs = new Map();
        const coupleSeats = seats.value.filter((seat) => seat.type === "couple");

        coupleSeats.forEach((seat) => {
            const pairNumber = seat.number % 2 === 1 ? seat.number + 1 : seat.number - 1;
            const pair = coupleSeats.find(
                (candidate) => candidate.row === seat.row && candidate.number === pairNumber,
            );

            if (pair) pairs.set(seat.id, pair.id);
        });

        return pairs;
    });

    const groupedSelectedSeats = computed(() => {
        const singles = [];
        const couples = [];

        for (const seat of selectedSeats.value) {
            if (seat.type === "single" || seat.type === "vip") {
                singles.push(seat);
            } else if (seat.type === "couple") {
                couples.push(seat);
            }
        }

        return { singles, couples };
    });

    const singleSeatsCount = computed(() => groupedSelectedSeats.value.singles.length);
    const coupleSeatsCount = computed(() =>
        Math.floor(groupedSelectedSeats.value.couples.length / 2),
    );
    const totalSeatsSelected = computed(() => singleSeatsCount.value + coupleSeatsCount.value * 2);

    const singleSeatsList = computed(() =>
        groupedSelectedSeats.value.singles.map((seat) => `${seat.row}${seat.number}`).join(", "),
    );
    const coupleSeatsList = computed(() =>
        groupedSelectedSeats.value.couples.map((seat) => `${seat.row}${seat.number}`).join(", "),
    );

    const singleTotalPrice = computed(() =>
        groupedSelectedSeats.value.singles.reduce((sum, seat) => sum + Number(seat.price || 0), 0),
    );
    const coupleTotalPrice = computed(() =>
        groupedSelectedSeats.value.couples.reduce((sum, seat) => sum + Number(seat.price || 0), 0),
    );

    const fetchSeats = async (showtimeId) => {
        if (!showtimeId) {
            seats.value = [];
            selectedSeats.value = [];
            return [];
        }

        isLoading.value = true;
        error.value = "";

        try {
            const res = await api.get(`/showtimes/${showtimeId}/seats`);
            seats.value = (res.data.data || []).map(normalizeSeat);
            syncSelectedSeatsWithSeatMap();
            return seats.value;
        } catch (err) {
            error.value = err.response?.data?.message || "Không thể tải sơ đồ ghế";
            seats.value = [];
            selectedSeats.value = [];
            return [];
        } finally {
            isLoading.value = false;
        }
    };

    const syncSelectedSeatsWithSeatMap = () => {
        if (seatById.value.size === 0) return;

        selectedSeats.value = selectedSeats.value
            .map((selectedSeat) => seatById.value.get(Number(selectedSeat.id)))
            .filter((seat) => seat?.isAvailable);
    };

    const isSeatSelected = (seatId) => selectedIds.value.has(Number(seatId));

    const toggleSeat = (seat) => {
        if (!seat?.isAvailable) return;

        const isSelected = isSeatSelected(seat.id);
        const remaining = MAX_SEATS - totalSeatsSelected.value;

        if (seat.type === "single" || seat.type === "vip") {
            if (isSelected) {
                selectedSeats.value = selectedSeats.value.filter((item) => item.id !== seat.id);
                return;
            }

            if (remaining < 1) {
                alert("Bạn chỉ được chọn tối đa 10 ghế.");
                return;
            }

            selectedSeats.value.push({ ...seat });
            return;
        }

        const pairId = couplePairs.value.get(seat.id);
        if (!pairId) return;

        const pairSeat = seatById.value.get(pairId);
        if (!pairSeat?.isAvailable) return;

        const bothSelected = isSeatSelected(seat.id) && isSeatSelected(pairId);

        if (bothSelected) {
            const removeIds = new Set([seat.id, pairId]);
            selectedSeats.value = selectedSeats.value.filter((item) => !removeIds.has(item.id));
            return;
        }

        if (remaining < 2) {
            alert("Ghế đôi cần 2 chỗ trống. Bạn chỉ được chọn tối đa 10 ghế.");
            return;
        }

        if (!isSeatSelected(seat.id)) selectedSeats.value.push({ ...seat });
        if (!isSeatSelected(pairId)) selectedSeats.value.push({ ...pairSeat });
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
        seats,
        selectedSeats,
        isLoading,
        error,
        singleSeatsCount,
        coupleSeatsCount,
        totalSeatsSelected,
        singleSeatsList,
        coupleSeatsList,
        singleTotalPrice,
        coupleTotalPrice,
        fetchSeats,
        isSeatSelected,
        toggleSeat,
        resetSeats,
    };
});
