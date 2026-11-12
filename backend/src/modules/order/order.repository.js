import prisma from "../../config/prisma.js";

// Repository của DON_HANG (Order) và CHITIET_DON_HANG (OrderItem).
// Đây là nơi duy nhất của module order gọi Prisma cho hai bảng này.
// Tham số `db` cho phép chạy trong prisma.$transaction (truyền tx vào).

const detailInclude = {
    shop: { select: { id: true, name: true, address: true, phone: true } },
    customer: { select: { id: true, fullName: true } },
    items: {
        include: { dish: { select: { id: true, name: true, image: true } } },
        orderBy: { id: "asc" }
    },
    payments: { orderBy: { id: "desc" }, take: 1, include: { refund: true } }
};

const summaryInclude = {
    shop: { select: { id: true, name: true } },
    items: { select: { quantity: true, dish: { select: { name: true } } }, orderBy: { id: "asc" } },
    payments: { orderBy: { id: "desc" }, take: 1, select: { method: true, status: true } }
};

export const findDetailById = (id, db = prisma) =>
    db.order.findUnique({ where: { id }, include: detailInclude });

// Tạo đơn kèm món và bản ghi thanh toán trong một lần (data có items.create, payments.create)
export const create = (data, db = prisma) => db.order.create({ data, include: detailInclude });

// Đổi trạng thái có điều kiện: chỉ cập nhật khi đơn đang ở một trong các trạng thái `fromStatuses`.
// Trả về số dòng đã sửa (0 = đơn vừa bị người khác đổi trạng thái, không được ghi đè).
export const updateStatusIf = async (id, fromStatuses, data, db = prisma) => {
    const result = await db.order.updateMany({
        where: { id, status: { in: fromStatuses } },
        data
    });
    return result.count;
};

// Danh sách đơn có lọc và phân trang. filters: { customerId, shopId, statuses, from, to }
// `to` là mốc loại trừ (đầu ngày hôm sau của ngày kết thúc).
export const findPage = async (filters, { page, limit, sort = "desc" }, db = prisma) => {
    const where = {};
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.shopId) where.shopId = filters.shopId;
    if (filters.statuses?.length) where.status = { in: filters.statuses };
    if (filters.from || filters.to) {
        where.createdAt = {
            ...(filters.from && { gte: filters.from }),
            ...(filters.to && { lt: filters.to })
        };
    }

    const [rows, total] = await Promise.all([
        db.order.findMany({
            where,
            include: summaryInclude,
            orderBy: [{ createdAt: sort }, { id: sort }],
            skip: (page - 1) * limit,
            take: limit
        }),
        db.order.count({ where })
    ]);
    return { rows, total };
};

// ---- Phần chạm vào bảng của module khác (đọc/ghi tối thiểu phục vụ đặt hàng) ----

// Giỏ hàng của khách kèm món và cửa hàng của từng món (bảng của BE2)
export const findCartWithItems = (customerId, db = prisma) =>
    db.cart.findUnique({
        where: { customerId },
        include: {
            items: {
                include: { dish: { include: { shop: true } } },
                orderBy: { id: "asc" }
            }
        }
    });

export const deleteCartItems = (cartId, db = prisma) =>
    db.cartItem.deleteMany({ where: { cartId } });

export const resetCartSubtotal = (cartId, db = prisma) =>
    db.cart.update({ where: { id: cartId }, data: { subtotal: 0 } });

// Cộng điểm tích lũy cho khách (cột KHACH_HANG.DiemTichLuy, bảng của BE1).
// Kế hoạch giao BE1 cung cấp hàm cộng điểm; BE1 chưa có nên tạm đặt ở đây.
// Khi BE1 có hàm riêng, chỉ cần đổi nơi gọi trong order.service.js.
export const addLoyaltyPoints = (customerId, points, db = prisma) =>
    db.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: points } }
    });
