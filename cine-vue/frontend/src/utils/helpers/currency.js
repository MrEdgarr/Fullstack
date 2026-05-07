// Định dạng tiền tệ
export const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
        return '0 ₫'
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(Number(value))
}
