import prisma from "../../config/prisma.js";
import { ORDER_STATUS } from "../../common/constants/orderStatus.js";
import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";

// Repository thống kê. Truy vấn tổng hợp dùng SQL thô (nhóm theo ngày, tuần, tháng).
// Mọi giá trị từ người dùng đều đi qua tham số `?`; chỉ các đoạn SQL cố định bên dưới được nối vào câu lệnh.
// Kết quả SUM trả về Decimal, COUNT trả về BigInt: mapper đổi sang Number.

// Biểu thức nhóm thời gian theo ngày đặt đơn. Tuần tính từ thứ Hai, nhãn là ngày đầu tuần.
const PERIOD_SQL = Object.freeze({
    day: "DATE_FORMAT(o.NgayDat, '%Y-%m-%d')",
    week: "DATE_FORMAT(DATE_SUB(DATE(o.NgayDat), INTERVAL WEEKDAY(o.NgayDat) DAY), '%Y-%m-%d')",
    month: "DATE_FORMAT(o.NgayDat, '%Y-%m')"
});

// Doanh thu chỉ tính đơn COMPLETED và đã thanh toán (PAID). Đơn đã hoàn tiền có thanh toán REFUNDED nên tự bị loại.
// filters: { shopId, from, to } (from gồm, to loại trừ)
export const buildRevenueWhere = ({ shopId, from, to } = {}) => {
    let sql =
        "o.TrangThai = ? AND EXISTS (SELECT 1 FROM THANH_TOAN t WHERE t.DON_HANGMaDonHang = o.MaDonHang AND t.TrangThai = ?)";
    const params = [ORDER_STATUS.COMPLETED, PAYMENT_STATUS.PAID];
    if (shopId) {
        sql += " AND o.CUA_HANGMaCuaHang = ?";
        params.push(shopId);
    }
    if (from) {
        sql += " AND o.NgayDat >= ?";
        params.push(from);
    }
    if (to) {
        sql += " AND o.NgayDat < ?";
        params.push(to);
    }
    return { sql, params };
};

// Doanh thu và số đơn theo từng ngày/tuần/tháng. groupBy: day | week | month
export const findRevenueSeries = (filters, groupBy, db = prisma) => {
    const { sql, params } = buildRevenueWhere(filters);
    return db.$queryRawUnsafe(
        `SELECT ${PERIOD_SQL[groupBy]} AS period, COALESCE(SUM(o.TongTien), 0) AS revenue, COUNT(*) AS orders
         FROM DON_HANG o WHERE ${sql} GROUP BY period ORDER BY period ASC`,
        ...params
    );
};

// Tổng doanh thu và số đơn của một khoảng (không nhóm)
export const findRevenueTotals = async (filters, db = prisma) => {
    const { sql, params } = buildRevenueWhere(filters);
    const rows = await db.$queryRawUnsafe(
        `SELECT COALESCE(SUM(o.TongTien), 0) AS revenue, COUNT(*) AS orders FROM DON_HANG o WHERE ${sql}`,
        ...params
    );
    return rows[0];
};

// Món bán chạy nhất (theo số lượng) trong các đơn tính doanh thu
export const findTopDishes = (filters, limit, db = prisma) => {
    const { sql, params } = buildRevenueWhere(filters);
    return db.$queryRawUnsafe(
        `SELECT m.MaMonAn AS dishId, m.TenMonAn AS name,
                SUM(ct.SoLuong) AS quantity, SUM(ct.SoLuong * ct.DonGia) AS revenue
         FROM CHITIET_DON_HANG ct
         JOIN DON_HANG o ON o.MaDonHang = ct.DON_HANGMaDonHang
         JOIN MON_AN m ON m.MaMonAn = ct.MON_ANMaMonAn
         WHERE ${sql}
         GROUP BY m.MaMonAn, m.TenMonAn
         ORDER BY quantity DESC, revenue DESC
         LIMIT ${Number(limit)}`,
        ...params
    );
};

// Cửa hàng có doanh thu cao nhất (cho thống kê hệ thống)
export const findTopShops = (filters, limit, db = prisma) => {
    const { sql, params } = buildRevenueWhere(filters);
    return db.$queryRawUnsafe(
        `SELECT s.MaCuaHang AS shopId, s.TenCuaHang AS name,
                COALESCE(SUM(o.TongTien), 0) AS revenue, COUNT(*) AS orders
         FROM DON_HANG o JOIN CUA_HANG s ON s.MaCuaHang = o.CUA_HANGMaCuaHang
         WHERE ${sql}
         GROUP BY s.MaCuaHang, s.TenCuaHang
         ORDER BY revenue DESC
         LIMIT ${Number(limit)}`,
        ...params
    );
};

// ---- Đếm theo nhóm cho thống kê hệ thống ----

export const countAccountsByRole = (db = prisma) =>
    db.account.groupBy({ by: ["role"], _count: { _all: true } });

export const countShopsByStatus = (db = prisma) =>
    db.shop.groupBy({ by: ["status"], _count: { _all: true } });

export const countOrdersByStatus = (db = prisma) =>
    db.order.groupBy({ by: ["status"], _count: { _all: true } });

export const sumRefunds = (db = prisma) =>
    db.refund.aggregate({ _sum: { amount: true }, _count: { _all: true } });
