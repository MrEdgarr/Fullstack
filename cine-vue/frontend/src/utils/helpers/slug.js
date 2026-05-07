export const removeVietnameseTones = (str) => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/([^0-9a-z\s])/gi, "");
};

export const removeAccents = (str) => {
    if (!str) return "";
    return removeVietnameseTones(str)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Thay khoảng trắng bằng -
        .replace(/-+/g, "-") // Tránh gạch ngang kép
        .replace(/^-+|-+$/g, ""); // Xóa gạch ngang ở 2 đầu
};

export const extractId = (slug) => {
    if (!slug) return null;
    const cleanSlug = slug.split("?")[0].replace(/\/$/, "");
    const match = cleanSlug.match(/-i(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
};
