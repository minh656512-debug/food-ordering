import prisma from "../../config/prisma.js";

// Repository của THANH_TOAN (Payment).

export const findById = (id, db = prisma) =>
    db.payment.findUnique({ where: { id }, include: { order: true } });

export const findLatestByOrderId = (orderId, db = prisma) =>
    db.payment.findFirst({ where: { orderId }, orderBy: { id: "desc" } });

export const create = (data, db = prisma) => db.payment.create({ data });

export const update = (id, data, db = prisma) => db.payment.update({ where: { id }, data });

// Chỉ cập nhật khi thanh toán đang ở một trong các trạng thái `fromStatuses`
// (chống ghi đè khi IPN và return của VNPay đến cùng lúc). Trả về số dòng đã sửa.
export const updateIf = async (id, fromStatuses, data, db = prisma) => {
    const result = await db.payment.updateMany({
        where: { id, status: { in: fromStatuses } },
        data
    });
    return result.count;
};

// Đơn thu tiền mặt (COD) hoàn tất thì coi như đã thu tiền
export const markCodPaidByOrderId = async (orderId, db = prisma) => {
    const result = await db.payment.updateMany({
        where: { orderId, method: "COD", status: "UNPAID" },
        data: { status: "PAID", paidAt: new Date() }
    });
    return result.count;
};

// Danh sách giao dịch cho quản trị viên. filters: { status, method, shopId, from, to }
export const findPage = async (filters, { page, limit }, db = prisma) => {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.method) where.method = filters.method;
    if (filters.shopId || filters.from || filters.to) {
        where.order = {
            ...(filters.shopId && { shopId: filters.shopId }),
            ...((filters.from || filters.to) && {
                createdAt: {
                    ...(filters.from && { gte: filters.from }),
                    ...(filters.to && { lt: filters.to })
                }
            })
        };
    }

    const [rows, total] = await Promise.all([
        db.payment.findMany({
            where,
            include: {
                refund: true,
                order: {
                    select: {
                        id: true,
                        status: true,
                        totalAmount: true,
                        createdAt: true,
                        shop: { select: { id: true, name: true } }
                    }
                }
            },
            orderBy: { id: "desc" },
            skip: (page - 1) * limit,
            take: limit
        }),
        db.payment.count({ where })
    ]);
    return { rows, total };
};
