import prisma from "../../config/prisma.js";

// Repository của HOAN_TIEN (Refund). Mỗi thanh toán chỉ có tối đa một hoàn tiền (UNIQUE).

export const create = (data, db = prisma) => db.refund.create({ data });

export const findByPaymentId = (paymentId, db = prisma) =>
    db.refund.findUnique({ where: { paymentId } });
