import prisma from "../../config/prisma.js";

// Repository của bảng KHACH_HANG (Customer).

const withAccount = { account: { select: { username: true, status: true } } };

export const findByAccountId = (accountId, db = prisma) =>
    db.customer.findUnique({ where: { accountId }, include: withAccount });

// Bản nhẹ, chỉ lấy id (dùng cho getCurrentCustomerId)
export const findIdByAccountId = (accountId, db = prisma) =>
    db.customer.findUnique({ where: { accountId }, select: { id: true } });

export const findByEmail = (email, db = prisma) =>
    db.customer.findUnique({ where: { email }, select: { id: true } });

export const findByPhone = (phone, db = prisma) =>
    db.customer.findUnique({ where: { phone }, select: { id: true } });

export const create = (data, db = prisma) => db.customer.create({ data });

export const update = (id, data, db = prisma) =>
    db.customer.update({ where: { id }, data, include: withAccount });
