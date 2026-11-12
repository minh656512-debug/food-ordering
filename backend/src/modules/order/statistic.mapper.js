import { toNumber } from "./order.mapper.js";

export const toSeriesPoint = (row) => ({
    period: row.period,
    revenue: toNumber(row.revenue),
    orders: toNumber(row.orders)
});

export const toTopDish = (row) => ({
    dishId: toNumber(row.dishId),
    name: row.name,
    quantity: toNumber(row.quantity),
    revenue: toNumber(row.revenue)
});

export const toTopShop = (row) => ({
    shopId: toNumber(row.shopId),
    name: row.name,
    revenue: toNumber(row.revenue),
    orders: toNumber(row.orders)
});

// Tổng hợp từ chuỗi theo kỳ
export const toSummary = (series) => {
    const totalRevenue = series.reduce((sum, point) => sum + point.revenue, 0);
    const totalOrders = series.reduce((sum, point) => sum + point.orders, 0);
    return {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
    };
};

// [{ role: "CUSTOMER", _count: { _all: 3 } }] -> { CUSTOMER: 3 }
export const toCountMap = (rows, key) =>
    Object.fromEntries(rows.map((row) => [row[key], row._count._all]));
