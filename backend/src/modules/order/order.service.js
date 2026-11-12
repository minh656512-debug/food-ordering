import prisma from "../../config/prisma.js";
import { ORDER_STATUS } from "../../common/constants/orderStatus.js";
import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";
import { ROLES } from "../../common/constants/roles.js";
import { SHOP_STATUS } from "../../common/constants/shopStatus.js";
import AppError from "../../common/utils/AppError.js";
import {
    assertCustomerOwnsOrder,
    assertSellerOwnsOrder,
    getSellerShop,
    orderNotFound
} from "./order.access.js";
import * as orderMapper from "./order.mapper.js";
import * as orderRepository from "./order.repository.js";
import {
    ACTIVE_STATUSES,
    calculateLoyaltyPoints,
    calculateTotal,
    CUSTOMER_CANCELLABLE,
    DISH_AVAILABLE,
    HISTORY_STATUSES,
    PAYMENT_METHOD,
    SELLER_TRANSITIONS
} from "./order.rules.js";
import * as paymentRepository from "./payment.repository.js";
import { refundIfPaid } from "./refund.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// "YYYY-MM-DD" -> đầu ngày (UTC, cùng cách Prisma lưu DateTime)
const startOfDay = (value) => new Date(`${value}T00:00:00.000Z`);
// Ngày kết thúc tính cả ngày đó -> mốc loại trừ là đầu ngày hôm sau
const endExclusive = (value) => new Date(startOfDay(value).getTime() + DAY_MS);

export const dateFilters = ({ from, to }) => ({
    from: from ? startOfDay(from) : undefined,
    to: to ? endExclusive(to) : undefined
});

// ---------------------------------------------------------------------
// Khách hàng
// ---------------------------------------------------------------------

// Đặt hàng: lấy giỏ hàng của khách, kiểm tra, sao chép sang đơn kèm đơn giá tại thời điểm đặt,
// xóa giỏ, tất cả trong một giao dịch. Đơn mới ở PENDING, thanh toán mới ở UNPAID.
export const createOrder = async (customerId, data) => {
    const order = await prisma.$transaction(async (tx) => {
        const cart = await orderRepository.findCartWithItems(customerId, tx);
        if (!cart || cart.items.length === 0) {
            throw new AppError(400, "CART_EMPTY", "Giỏ hàng đang trống");
        }

        const shopIds = new Set(cart.items.map((item) => item.dish.shopId));
        if (shopIds.size > 1) {
            throw new AppError(
                400,
                "CART_MULTIPLE_SHOPS",
                "Giỏ hàng chỉ được chứa món của một cửa hàng"
            );
        }

        const { shop } = cart.items[0].dish;
        if (shop.status !== SHOP_STATUS.OPEN) {
            throw new AppError(409, "SHOP_CLOSED", `Cửa hàng "${shop.name}" hiện không nhận đơn`);
        }

        const unavailable = cart.items.find((item) => item.dish.status !== DISH_AVAILABLE);
        if (unavailable) {
            throw new AppError(
                409,
                "DISH_OUT_OF_STOCK",
                `Món "${unavailable.dish.name}" đã hết hàng`
            );
        }

        const items = cart.items.map((item) => ({
            dishId: item.dishId,
            quantity: item.quantity,
            price: item.dish.price // đơn giá chốt tại thời điểm đặt
        }));
        const totalAmount = calculateTotal(items);

        // Xóa giỏ trước khi tạo đơn. Nếu hai request đặt hàng chạy cùng lúc, request thứ hai
        // sẽ chờ khóa dòng rồi xóa được 0 món và bị từ chối, nên không bao giờ tạo hai đơn từ một giỏ.
        const deleted = await orderRepository.deleteCartItems(cart.id, tx);
        if (deleted.count !== items.length) {
            throw new AppError(409, "CART_CHANGED", "Giỏ hàng vừa thay đổi, vui lòng thử lại");
        }
        await orderRepository.resetCartSubtotal(cart.id, tx);

        return orderRepository.create(
            {
                customerId,
                shopId: shop.id,
                totalAmount,
                status: ORDER_STATUS.PENDING,
                receiverName: data.receiverName,
                receiverPhone: data.receiverPhone,
                deliveryAddr: data.deliveryAddress,
                note: data.note,
                items: { create: items },
                payments: {
                    create: {
                        method: data.paymentMethod,
                        amount: totalAmount,
                        status: PAYMENT_STATUS.UNPAID
                    }
                }
            },
            tx
        );
    });

    return orderMapper.toOrderResponse(order);
};

export const listMyOrders = async (customerId, query) => {
    const { rows, total } = await orderRepository.findPage(
        { customerId, statuses: query.status ? [query.status] : undefined },
        { page: query.page, limit: query.limit }
    );
    return orderMapper.toPage(rows, total, query.page, query.limit, orderMapper.toOrderSummary);
};

// Xem chi tiết/theo dõi: khách xem đơn của mình, người bán xem đơn của cửa hàng mình, quản trị viên xem tất cả.
// viewer = { role, customerId? , sellerId? }
export const getOrderDetail = async (viewer, orderId) => {
    const order = await orderRepository.findDetailById(orderId);
    if (!order) throw orderNotFound();

    if (viewer.role === ROLES.CUSTOMER) assertCustomerOwnsOrder(viewer.customerId, order);
    else if (viewer.role === ROLES.SELLER) await assertSellerOwnsOrder(viewer.sellerId, order);

    return orderMapper.toOrderResponse(order);
};

// Khách hủy đơn khi còn PENDING. Đã thanh toán thì đi qua luồng hoàn tiền.
export const cancelOrder = async (customerId, orderId, reason) => {
    const order = await prisma.$transaction(async (tx) => {
        const current = await orderRepository.findDetailById(orderId, tx);
        assertCustomerOwnsOrder(customerId, current);

        const notCancellable = new AppError(
            409,
            "ORDER_NOT_CANCELLABLE",
            "Chỉ hủy được đơn đang chờ xác nhận"
        );
        if (!CUSTOMER_CANCELLABLE.includes(current.status)) throw notCancellable;

        const finalReason = reason || "Khách hủy đơn";
        const changed = await orderRepository.updateStatusIf(
            orderId,
            CUSTOMER_CANCELLABLE,
            { status: ORDER_STATUS.CANCELLED, reason: finalReason },
            tx
        );
        if (changed === 0) throw notCancellable;

        await refundIfPaid(current.payments[0], `Khách hủy đơn: ${finalReason}`, tx);
        return orderRepository.findDetailById(orderId, tx);
    });

    return orderMapper.toOrderResponse(order);
};

// ---------------------------------------------------------------------
// Người bán
// ---------------------------------------------------------------------

// Đơn đang xử lý của cửa hàng (cũ nhất lên đầu để xử lý theo thứ tự)
export const listSellerOrders = async (sellerId, query) => {
    const shop = await getSellerShop(sellerId);
    const { rows, total } = await orderRepository.findPage(
        { shopId: shop.id, statuses: query.status ? [query.status] : ACTIVE_STATUSES },
        { page: query.page, limit: query.limit, sort: "asc" }
    );
    return orderMapper.toPage(rows, total, query.page, query.limit, orderMapper.toOrderSummary);
};

// Lịch sử đơn đã kết thúc: hoàn tất, bị từ chối, bị hủy
export const listSellerHistory = async (sellerId, query) => {
    const shop = await getSellerShop(sellerId);
    const { rows, total } = await orderRepository.findPage(
        {
            shopId: shop.id,
            statuses: query.status ? [query.status] : HISTORY_STATUSES,
            ...dateFilters(query)
        },
        { page: query.page, limit: query.limit }
    );
    return orderMapper.toPage(rows, total, query.page, query.limit, orderMapper.toOrderSummary);
};

// Chuyển trạng thái theo thứ tự PENDING -> CONFIRMED -> PREPARING -> DELIVERING -> COMPLETED.
// action: confirm | prepare | deliver | complete
export const changeOrderStatus = async (sellerId, orderId, action) => {
    const rule = SELLER_TRANSITIONS[action];

    const order = await prisma.$transaction(async (tx) => {
        const current = await orderRepository.findDetailById(orderId, tx);
        await assertSellerOwnsOrder(sellerId, current);

        const wrongStatus = new AppError(
            409,
            "INVALID_ORDER_STATUS",
            `Đơn đang ở trạng thái ${current.status}, không thể ${rule.label} (cần ${rule.from})`
        );
        if (current.status !== rule.from) throw wrongStatus;

        // Đơn thanh toán online phải trả tiền xong người bán mới nhận; đơn COD thì thu khi giao
        if (action === "confirm") {
            const payment = current.payments[0];
            const settled =
                payment &&
                (payment.status === PAYMENT_STATUS.PAID || payment.method === PAYMENT_METHOD.COD);
            if (!settled) {
                throw new AppError(
                    409,
                    "ORDER_NOT_PAID",
                    "Đơn chưa được thanh toán, chưa thể xác nhận"
                );
            }
        }

        const changed = await orderRepository.updateStatusIf(
            orderId,
            [rule.from],
            { status: rule.to },
            tx
        );
        if (changed === 0) throw wrongStatus;

        if (action === "complete") {
            // Đơn COD hoàn tất = đã thu tiền
            await paymentRepository.markCodPaidByOrderId(orderId, tx);
            // Cộng điểm tích lũy đúng một lần: bước DELIVERING -> COMPLETED chỉ thành công một lần cho mỗi đơn
            const points = calculateLoyaltyPoints(current.totalAmount);
            if (points > 0) await orderRepository.addLoyaltyPoints(current.customerId, points, tx);
        }

        return orderRepository.findDetailById(orderId, tx);
    });

    return orderMapper.toOrderResponse(order);
};

// ---------------------------------------------------------------------
// Quản trị viên: giám sát (chỉ xem)
// ---------------------------------------------------------------------

export const listAllOrders = async (query) => {
    const { rows, total } = await orderRepository.findPage(
        {
            shopId: query.shopId,
            customerId: query.customerId,
            statuses: query.status ? [query.status] : undefined,
            ...dateFilters(query)
        },
        { page: query.page, limit: query.limit }
    );
    return orderMapper.toPage(rows, total, query.page, query.limit, orderMapper.toOrderSummary);
};
