import { toIso, toNumber, toPage, toPaymentInfo, toRefundInfo } from "./order.mapper.js";

// Kết quả của POST /payments
export const toPaymentResult = (payment, order, paymentUrl) => ({
    payment: toPaymentInfo(payment),
    order: { id: order.id, status: order.status },
    ...(paymentUrl && { paymentUrl })
});

// Một dòng trong danh sách giao dịch của quản trị viên
export const toTransactionResponse = (payment) => ({
    ...toPaymentInfo(payment),
    order: payment.order
        ? {
              id: payment.order.id,
              status: payment.order.status,
              totalAmount: toNumber(payment.order.totalAmount),
              createdAt: toIso(payment.order.createdAt),
              shop: payment.order.shop
                  ? { id: payment.order.shop.id, name: payment.order.shop.name }
                  : null
          }
        : null,
    refund: toRefundInfo(payment.refund)
});

export { toPage };
