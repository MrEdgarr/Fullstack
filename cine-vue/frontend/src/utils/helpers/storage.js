const PREFIX = "";

const KEYS = {
    BOOKING: `${PREFIX}booking`,
    MOVIE: `${PREFIX}movie`,
    COUNTDOWN: `${PREFIX}countdown`,
};

const DEFAULT_EXPIRY = {
    BOOKING: 30 * 60 * 1000, // 30 phút
    MOVIE: 60 * 60 * 1000, // 60 phút
    COUNTDOWN: 15 * 60 * 1000, // 15 phút
};

const memoryCache = new Map();

/**
 * Lưu dữ liệu với timestamp
 */
const save = (key, data, expiryMs = null) => {
    try {
        const payload = {
            data,
            timestamp: Date.now(),
            expiry: expiryMs,
        };
        memoryCache.set(key, payload);
        localStorage.setItem(key, JSON.stringify(payload));
        return true;
    } catch (error) {
        console.error(`[Storage] Lỗi khi lưu key ${key}:`, error);
        return false;
    }
};

/**
 * Đọc dữ liệu và kiểm tra expiration
 */
const load = (key, defaultValue = null) => {
    try {
        let payload = memoryCache.get(key);

        if (!payload) {
            const saved = localStorage.getItem(key);
            if (!saved) return defaultValue;
            payload = JSON.parse(saved);
            memoryCache.set(key, payload);
        }

        const { data, timestamp, expiry } = payload;

        if (expiry && Date.now() - timestamp > expiry) {
            console.warn(`[Storage] Dữ liệu ${key} đã hết hạn, tự động xóa`);
            remove(key);
            return defaultValue;
        }

        return data;
    } catch (error) {
        console.error(`[Storage] Lỗi khi đọc key ${key}:`, error);
        remove(key);
        return defaultValue;
    }
};

const remove = (key) => {
    try {
        memoryCache.delete(key);
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`[Storage] Lỗi khi xóa key ${key}:`, error);
    }
};

// ==================== BOOKING ====================

export const saveBookingData = (data) => {
    return save(KEYS.BOOKING, data, DEFAULT_EXPIRY.BOOKING);
};

export const loadBookingData = () => load(KEYS.BOOKING);

export const clearBookingData = () => remove(KEYS.BOOKING);

// ==================== COUNTDOWN ====================

export const saveCountdownExpiry = (expiryTimestamp) => {
    return save(KEYS.COUNTDOWN, expiryTimestamp);
};

export const loadCountdownExpiry = () => load(KEYS.COUNTDOWN);

export const clearCountdown = () => remove(KEYS.COUNTDOWN);

// ==================== UTILITY ====================

export const clearAllBookingStorage = () => {
    remove(KEYS.BOOKING);
    remove(KEYS.COUNTDOWN);
};

export const clearAllStorage = () => {
    Object.values(KEYS).forEach((key) => remove(key));
};

/**
 * Xóa dữ liệu hết hạn
 */
export const clearExpiredData = () => {
    const now = Date.now();

    Object.entries(KEYS).forEach(([name, key]) => {
        const saved = localStorage.getItem(key);
        if (!saved) return;

        try {
            const { timestamp, expiry } = JSON.parse(saved);
            if (expiry && now - timestamp > expiry) {
                remove(key);
            }
        } catch (e) {
            remove(key);
        }
    });
};

// Export để debug
export { KEYS, DEFAULT_EXPIRY };
