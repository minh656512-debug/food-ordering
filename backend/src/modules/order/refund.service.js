import prisma from "../../config/prisma.js";
import { ORDER_STATUS } from "../../common/constants/orderStatus.js";
import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";
import AppError from "../../common/utils/AppError.js";
import { assertSellerOwnsOrder } from "./order.access.js";
import * as orderMapper from "./order.mapper.js";
import * as orderRepository from "./order.repository.js";
import { SELLER_REJECTABLE } from "./order.rules.js";
import * as paymentRepository from "./payment.repository.js";
import * as refundRepository from "./refund.repository.js";

const MAX_REASON = 255;
const clip = (text) => (text.length > MAX_REASON ? text.slice(0, MAX_REASON) : text);

// Hoàn tiền cho một thanh toán. Phải gọi BÊN TRONG prisma.$transaction (truyền tx vào `db`)
// để đổi trạng thái đơn, tạo Refund và đổi PaymentStatus thành REFUNDED cùng thành công hoặc cùng thất bại.
// Chỉ hoàn khi đã thanh toán (PAID); đơn chưa trả tiền (UNPAID, FAILED, COD chưa thu) không có gì để hoàn.
// Số tiền hoàn bằng đúng số đã thanh toán.
// Lưu ý: đây là ghi nhận hoàn tiền trong hệ thống; chưa gọi API hoàn tiền thật của VNPay.
export const refundIfPaid = async (payment, reason, db) => {
    if (!payment || payment.status !== PAYMENT_STATUS.PAID) return null;

    const refund = await refundRepository.create(
        { amount: payment.amount, reason: clip(reason), paymentId: payment.id },
        db
    );
    await paymentRepository.update(payment.id, { status: PAYMENT_STATUS.REFUNDED }, db);
    return refund;
};

// Người bán từ chối đơn (PENDING hoặc CONFIRMED) kèm lý do; đơn đã thanh toán thì hoàn tiền đủ số tiền.
export const rejectOrder = async (sellerId, orderId, reason) => {
    const order = await prisma.$transaction(async (tx) => {
        const current = await orderRepository.findDetailById(orderId, tx);
        await assertSellerOwnsOrder(sellerId, current);

        const invalidStatus = new AppError(
            409,
            "ORDER_NOT_REJECTABLE",
            "Chỉ từ chối được đơn đang chờ xác nhận hoặc đã xác nhận"
        );
        if (!SELLER_REJECTABLE.includes(current.status)) throw invalidStatus;

        const changed = await orderRepository.updateStatusIf(
            orderId,
            SELLER_REJECTABLE,
            { status: ORDER_STATUS.REJECTED, reason },
            tx
        );
        if (changed === 0) throw invalidStatus;

        await refundIfPaid(current.payments[0], `Người bán từ chối đơn: ${reason}`, tx);
        return orderRepository.findDetailById(orderId, tx);
    });

    return orderMapper.toOrderResponse(order);
};
