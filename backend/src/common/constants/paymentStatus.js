// Trạng thái thanh toán (cột THANH_TOAN.TrangThai)
export const PAYMENT_STATUS = Object.freeze({
    UNPAID: "UNPAID",
    PAID: "PAID",
    FAILED: "FAILED",
    REFUNDED: "REFUNDED"
});

// Phương thức thanh toán (cột THANH_TOAN.PhuongThuc)
export const PAYMENT_METHOD = Object.freeze({
    COD: "COD",
    MOMO: "MOMO",
    VNPAY: "VNPAY",
    MOCK: "MOCK",
    SEPAY: "SEPAY",
    VIETQR: "VIETQR"
});