// Mapper của module order: quyết định dữ liệu trả về, không bao giờ trả thẳng bản ghi Prisma.
// Decimal -> Number, Date -> chuỗi ISO.

export const toIso = (date) => (date ? date.toISOString() : null);
export const toNumber = (value) => (value === null || value === undefined ? null : Number(value));

export const toPaymentInfo = (payment) =>
    payment
        ? {
              id: payment.id,
              method: payment.method,
              status: payment.status,
              amount: toNumber(payment.amount),
              transactionId: payment.transactionId,
              paidAt: toIso(payment.paidAt)
          }
        : null;

export const toRefundInfo = (refund) =>
    refund
        ? {
              id: refund.id,
              amount: toNumber(refund.amount),
              reason: refund.reason,
              refundedAt: toIso(refund.refundedAt)
          }
        : null;

export const toOrderItemResponse = (item) => ({
    id: item.id,
    dishId: item.dishId,
    dishName: item.dish?.name ?? null,
    image: item.dish?.image ?? null,
    quantity: item.quantity,
    price: toNumber(item.price),
    subtotal: toNumber(item.price) * item.quantity
});

// Chi tiết một đơn hàng (kèm món, thanh toán mới nhất, hoàn tiền nếu có)
export const toOrderResponse = (order) => {
    const payment = order.payments?.[0] ?? null;
    return {
        id: order.id,
        status: order.status,
        totalAmount: toNumber(order.totalAmount),
        receiverName: order.receiverName,
        receiverPhone: order.receiverPhone,
        deliveryAddress: order.deliveryAddr,
        note: order.note,
        reason: order.reason,
        createdAt: toIso(order.createdAt),
        updatedAt: toIso(order.updatedAt),
        customer: order.customer
            ? { id: order.customer.id, fullName: order.customer.fullName }
            : null,
        shop: order.shop
            ? {
                  id: order.shop.id,
                  name: order.shop.name,
                  address: order.shop.address,
                  phone: order.shop.phone
              }
            : null,
        items: (order.items ?? []).map(toOrderItemResponse),
        payment: toPaymentInfo(payment),
        refund: toRefundInfo(payment?.refund)
    };
};

// Bản gọn cho danh sách
export const toOrderSummary = (order) => {
    const payment = order.payments?.[0] ?? null;
    return {
        id: order.id,
        status: order.status,
        totalAmount: toNumber(order.totalAmount),
        receiverName: order.receiverName,
        createdAt: toIso(order.createdAt),
        shop: order.shop ? { id: order.shop.id, name: order.shop.name } : null,
        itemCount: (order.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
        itemNames: (order.items ?? []).map((item) => item.dish?.name).filter(Boolean),
        paymentMethod: payment?.method ?? null,
        paymentStatus: payment?.status ?? null
    };
};

// Danh sách có phân trang
export const toPage = (rows, total, page, limit, mapRow) => ({
    items: rows.map(mapRow),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
});
