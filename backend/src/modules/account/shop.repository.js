import prisma from "../../config/prisma.js";

// Repository của bảng CUA_HANG (Shop).

export const create = (data, db = prisma) => db.shop.create({ data });

export const findById = (id, db = prisma) => db.shop.findUnique({ where: { id } });

// Cửa hàng đăng ký gần nhất của một người bán
export const findLatestBySellerId = (sellerId, db = prisma) =>
    db.shop.findFirst({ where: { sellerId }, orderBy: { id: "desc" } });


// ---- API công khai: chỉ cửa hàng đang mở (OPEN) ----
export const searchOpen = async ({ keyword }, skip, take, db = prisma) => {
    const where = { status: "OPEN", ...(keyword && { name: { contains: keyword } }) };
    const [rows, total] = await Promise.all([
        db.shop.findMany({ where, orderBy: { id: "asc" }, skip, take }),
        db.shop.count({ where })
    ]);
    return { rows, total };
};

export const findOpenById = (id, db = prisma) => db.shop.findFirst({ where: { id, status: "OPEN" } });
