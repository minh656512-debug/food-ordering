import prisma from "../../config/prisma.js";

// Repository của bảng CUA_HANG (Shop).

export const create = (data, db = prisma) => db.shop.create({ data });

export const findById = (id, db = prisma) => db.shop.findUnique({ where: { id } });

// Cửa hàng đăng ký gần nhất của một người bán
export const findLatestBySellerId = (sellerId, db = prisma) =>
    db.shop.findFirst({ where: { sellerId }, orderBy: { id: "desc" } });
