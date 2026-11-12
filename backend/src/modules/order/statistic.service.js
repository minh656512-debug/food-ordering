import { getSellerShop } from "./order.access.js";
import AppError from "../../common/utils/AppError.js";
import { ORDER_STATUS } from "../../common/constants/orderStatus.js";
import { ROLES } from "../../common/constants/roles.js";
import { SHOP_STATUS } from "../../common/constants/shopStatus.js";
import * as statisticMapper from "./statistic.mapper.js";
import * as statisticRepository from "./statistic.repository.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = { day: 30, week: 84, month: 365 };
const TOP_LIMIT = 5;

const isoDate = (date) => date.toISOString().slice(0, 10);

// Đổi from/to (YYYY-MM-DD, "to" tính cả ngày đó) thành khoảng [from, toExclusive).
// Bỏ trống thì lấy khoảng mặc định kết thúc ở hết ngày hôm nay.
const resolveRange = ({ groupBy, from, to }) => {
    const toExclusive = to
        ? new Date(new Date(`${to}T00:00:00.000Z`).getTime() + DAY_MS)
        : new Date(new Date(`${isoDate(new Date())}T00:00:00.000Z`).getTime() + DAY_MS);
    const fromDate = from
        ? new Date(`${from}T00:00:00.000Z`)
        : new Date(toExclusive.getTime() - DEFAULT_RANGE_DAYS[groupBy] * DAY_MS);
    return {
        from: fromDate,
        to: toExclusive,
        label: { from: isoDate(fromDate), to: isoDate(new Date(toExclusive.getTime() - DAY_MS)) }
    };
};

// Thống kê doanh thu của một cửa hàng. Người bán chỉ xem được cửa hàng của mình.
export const getShopRevenue = async (sellerId, shopId, query) => {
    const shop = await getSellerShop(sellerId);
    if (shop.id !== shopId) {
        throw new AppError(403, "FORBIDDEN", "Bạn chỉ xem được thống kê của cửa hàng mình");
    }

    const range = resolveRange(query);
    const filters = { shopId, from: range.from, to: range.to };
    const [seriesRows, topDishes] = await Promise.all([
        statisticRepository.findRevenueSeries(filters, query.groupBy),
        statisticRepository.findTopDishes(filters, TOP_LIMIT)
    ]);
    const series = seriesRows.map(statisticMapper.toSeriesPoint);

    return {
        shopId,
        groupBy: query.groupBy,
        range: range.label,
        summary: statisticMapper.toSummary(series),
        series,
        topDishes: topDishes.map(statisticMapper.toTopDish)
    };
};

// Thống kê toàn hệ thống cho quản trị viên: số lượng người dùng/cửa hàng/đơn, doanh thu, cửa hàng nổi bật
export const getSystemStatistics = async (query) => {
    const range = resolveRange(query);
    const rangeFilters = { from: range.from, to: range.to };

    const [accounts, shops, orders, refunds, allTime, seriesRows, topShops] = await Promise.all([
        statisticRepository.countAccountsByRole(),
        statisticRepository.countShopsByStatus(),
        statisticRepository.countOrdersByStatus(),
        statisticRepository.sumRefunds(),
        statisticRepository.findRevenueTotals({}),
        statisticRepository.findRevenueSeries(rangeFilters, query.groupBy),
        statisticRepository.findTopShops(rangeFilters, TOP_LIMIT)
    ]);

    const accountCounts = statisticMapper.toCountMap(accounts, "role");
    const shopCounts = statisticMapper.toCountMap(shops, "status");
    const orderCounts = statisticMapper.toCountMap(orders, "status");
    const series = seriesRows.map(statisticMapper.toSeriesPoint);

    return {
        users: {
            customers: accountCounts[ROLES.CUSTOMER] ?? 0,
            sellers: accountCounts[ROLES.SELLER] ?? 0,
            admins: accountCounts[ROLES.ADMIN] ?? 0
        },
        shops: {
            total: Object.values(shopCounts).reduce((a, b) => a + b, 0),
            open: shopCounts[SHOP_STATUS.OPEN] ?? 0,
            closed: shopCounts[SHOP_STATUS.CLOSED] ?? 0,
            pendingApproval: shopCounts[SHOP_STATUS.PENDING_APPROVAL] ?? 0,
            rejected: shopCounts[SHOP_STATUS.REJECTED] ?? 0
        },
        orders: {
            total: Object.values(orderCounts).reduce((a, b) => a + b, 0),
            byStatus: Object.fromEntries(
                Object.values(ORDER_STATUS).map((status) => [status, orderCounts[status] ?? 0])
            )
        },
        revenue: {
            totalRevenue: Number(allTime.revenue),
            completedOrders: Number(allTime.orders),
            totalRefunded: Number(refunds._sum.amount ?? 0),
            refundCount: refunds._count._all
        },
        groupBy: query.groupBy,
        range: range.label,
        rangeSummary: statisticMapper.toSummary(series),
        series,
        topShops: topShops.map(statisticMapper.toTopShop)
    };
};
