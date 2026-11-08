import prisma from "../../config/prisma.js";

// Repository của bảng TAI_KHOAN (Account).
// Tham số `db` mặc định là prisma; truyền `tx` của prisma.$transaction để chạy trong transaction.

// Lấy kèm hồ sơ để lúc đăng nhập biết tên hiển thị
export const findByUsername = (username, db = prisma) =>
    db.account.findUnique({
        where: { username },
        include: {
            customer: { select: { id: true, fullName: true } },
            seller: { select: { id: true, fullName: true } }
        }
    });

export const findById = (id, db = prisma) => db.account.findUnique({ where: { id } });

export const create = (data, db = prisma) => db.account.create({ data });

export const updatePassword = (id, passwordHash, db = prisma) =>
    db.account.update({ where: { id }, data: { password: passwordHash } });
