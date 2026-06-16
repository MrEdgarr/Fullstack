export const getTodayDate = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    return localDate.toISOString().split("T")[0];
};

export const isShowtimePast = (date, time) => {
    const today = getTodayDate();

    if (date < today) return true;
    if (date > today) return false;

    const now = new Date();
    const [hour, minute] = String(time).split(":").map(Number);

    if (hour < now.getHours()) return true;
    if (hour === now.getHours() && minute < now.getMinutes()) return true;

    return false;
};

export const formatDuration = (minutes) => {
    const value = Number(minutes || 0);
    if (!value) return "Đang cập nhật";

    const hours = Math.floor(value / 60);
    const mins = value % 60;

    return `${hours}h${String(mins).padStart(2, "0")}'`;
};
