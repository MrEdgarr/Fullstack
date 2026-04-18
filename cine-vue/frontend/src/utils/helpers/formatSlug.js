export const toSlug = (str) => {
    if (!str) return "";
    return str
        .toLowerCase()
        .normalize("NFD") // Tách dấu
        .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "") // Xóa ký tự đặc biệt
        .replace(/(\s+)/g, "-") // Thay khoảng trắng bằng -
        .replace(/-+/g, "-") // Tránh gạch ngang kép
        .replace(/^-+|-+$/g, ""); // Xóa gạch ngang ở 2 đầu
};

export const extractId = (slug) => {
    if (!slug) return null;
    const cleanSlug = slug.split("?")[0].replace(/\/$/, "");
    const match = cleanSlug.match(/-i(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
};
