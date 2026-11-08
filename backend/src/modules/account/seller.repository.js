import prisma from "../../config/prisma.js";

// Repository của bảng NGUOI_BAN (Seller).

const withAccount = { account: { select: { username: true, status: true } } };

export const findByAccountId = (accountId, db = prisma) =>
    db.seller.findUnique({ where: { accountId }, include: withAccount });

// Bản nhẹ, chỉ lấy id (dùng cho getCurrentSellerId)
export const findIdByAccountId = (accountId, db = prisma) =>
    db.seller.findUnique({ where: { accountId }, select: { id: true } });

export const findByEmail = (email, db = prisma) =>
    db.seller.findUnique({ where: { email }, select: { id: true } });

export const findByPhone = (phone, db = prisma) =>
    db.seller.findUnique({ where: { phone }, select: { id: true } });

export const create = (data, db = prisma) => db.seller.create({ data });

export const update = (id, data, db = prisma) =>
    db.seller.update({ where: { id }, data, include: withAccount });
