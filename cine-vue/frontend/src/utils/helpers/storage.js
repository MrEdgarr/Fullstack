const BOOKING_KEY = "bookingData";
const EXPIRY_MINUTES = 1;

export const saveBookingData = (data) => {
    const dataWithTimestamp = {
        ...data,
        timestamp: Date.now(), // lưu thời gian hiện tại
    };
    localStorage.setItem(BOOKING_KEY, JSON.stringify(dataWithTimestamp));
};
export const loadBookingData = () => {
    const saved = localStorage.getItem(BOOKING_KEY);
    if (!saved) return null;
    const data = JSON.parse(saved);

    const now = Date.now();
    const expiryTime = EXPIRY_MINUTES * 60 * 1000;
    if (now - (data.timestamp || 0) > expiryTime) {
        clearBookingData();
        return null;
    }
    return data;
};

export const clearBookingData = () => {
    localStorage.removeItem(BOOKING_KEY);
};
