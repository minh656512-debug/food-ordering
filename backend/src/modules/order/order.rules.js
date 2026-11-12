import { ORDER_STATUS } from "../../common/constants/orderStatus.js";

// Quy tắc nghiệp vụ thuần của module order (không đụng database) để dễ kiểm thử đơn vị.

// Phương thức thanh toán (cột THANH_TOAN.PhuongThuc)
export const PAYMENT_METHOD = Object.freeze({
    VNPAY: "VNPAY",
    COD: "COD",
    MOCK: "MOCK" // cổng thanh toán mô phỏng, dùng khi chưa có tài khoản VNPay sandbox
});

// Trạng thái món ăn (cột MON_AN.TrangThai, do BE2 quản lý). Chỉ món AVAILABLE mới đặt được.
export const DISH_AVAILABLE = "AVAILABLE";

// Tích điểm: mỗi 10.000 đồng của TongTien được 1 điểm (làm tròn xuống). Nhóm có thể đổi tỉ lệ ở đây.
export const LOYALTY_VND_PER_POINT = 10000;

// Đơn còn đang xử lý và đơn đã kết thúc (dùng cho màn quản lý và lịch sử của người bán)
export const ACTIVE_STATUSES = Object.freeze([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.DELIVERING
]);
export const HISTORY_STATUSES = Object.freeze([
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REJECTED
]);

// Khách chỉ hủy được khi đơn còn chờ xác nhận
export const CUSTOMER_CANCELLABLE = Object.freeze([ORDER_STATUS.PENDING]);

// Người bán chỉ từ chối được đơn chưa bắt đầu chuẩn bị
export const SELLER_REJECTABLE = Object.freeze([ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED]);

// Người bán chuyển trạng thái theo đúng thứ tự, không nhảy cóc
export const SELLER_TRANSITIONS = Object.freeze({
    confirm: { from: ORDER_STATUS.PENDING, to: ORDER_STATUS.CONFIRMED, label: "xác nhận" },
    prepare: { from: ORDER_STATUS.CONFIRMED, to: ORDER_STATUS.PREPARING, label: "chuẩn bị" },
    deliver: { from: ORDER_STATUS.PREPARING, to: ORDER_STATUS.DELIVERING, label: "giao" },
    complete: { from: ORDER_STATUS.DELIVERING, to: ORDER_STATUS.COMPLETED, label: "hoàn tất" }
});

// Tổng tiền = tổng (đơn giá x số lượng). Tính bằng số nguyên đồng (cột DECIMAL(19,0)).
// items: [{ price, quantity }] với price có thể là Number hoặc Decimal của Prisma.
export const calculateTotal = (items) =>
    items.reduce((sum, item) => {
        const price = Number(item.price);
        const { quantity } = item;
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new RangeError("Số lượng phải là số nguyên từ 1 trở lên");
        }
        if (!Number.isFinite(price) || price < 0) {
            throw new RangeError("Đơn giá không hợp lệ");
        }
        return sum + price * quantity;
    }, 0);

// Điểm tích lũy khi đơn hoàn tất
export const calculateLoyaltyPoints = (totalAmount) =>
    Math.max(0, Math.floor(Number(totalAmount) / LOYALTY_VND_PER_POINT));
