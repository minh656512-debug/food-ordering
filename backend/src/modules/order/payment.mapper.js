import { toIso, toNumber, toPage, toPaymentInfo, toRefundInfo } from "./order.mapper.js";
import { PAYMENT_METHOD } from "./order.rules.js";
import { buildSepayQrUrl } from "./payment.sepay.js";

// Kết quả của POST /payments
export const toPaymentResult = (payment, order, paymentUrl) => {
    const orderId = order?.id ?? payment?.orderId;
    const amount = payment?.amount ?? order?.totalAmount;
    const qrUrl = (orderId && amount) ? buildSepayQrUrl(orderId, amount) : null;
    return {
        payment: toPaymentInfo(payment),
        order: { id: order?.id, status: order?.status },
        ...(paymentUrl && { paymentUrl }),
        qrUrl,
        qrCodeUrl: payment?.qrCodeUrl || qrUrl
    };
};

// Kết quả tạo giao dịch MoMo: thêm QR, liên kết thanh toán và hạn của giao dịch
export const toMomoPaymentResult = (
    payment,
    order,
    { payUrl, qrCodeUrl, deeplink, expiresAt }
) => ({
    ...toPaymentResult(payment, order, payUrl),
    qrCodeUrl: qrCodeUrl ?? null,
    deeplink: deeplink ?? null,
    expiresAt: toIso(expiresAt)
});

// Kết quả xác nhận COD của quản trị viên
export const toCodConfirmResult = (payment, order) => ({
    ...toPaymentResult(payment, order),
    confirmedBy: payment.confirmedBy ?? null
});

// Trạng thái thanh toán mới nhất (GET /payments/:paymentId/status).
// Chỉ trả liên kết/QR khi giao dịch MoMo còn chờ thanh toán và chưa hết hạn.
export const toPaymentStatus = (payment, now = new Date()) => {
    const waitingMomo =
        payment.method === PAYMENT_METHOD.MOMO && payment.status === "UNPAID" && payment.expiresAt;
    const expired = Boolean(waitingMomo && payment.expiresAt <= now);
    const showLink = Boolean(waitingMomo && !expired);
    const sepayQr = (payment.orderId && payment.amount)
        ? buildSepayQrUrl(payment.orderId, payment.amount)
        : null;
    return {
        paymentId: payment.id,
        orderId: payment.orderId,
        orderStatus: payment.order?.status ?? null,
        method: payment.method,
        status: payment.status,
        amount: toNumber(payment.amount),
        transactionId: payment.transactionId,
        paidAt: toIso(payment.paidAt),
        confirmedAt: toIso(payment.confirmedAt),
        expiresAt: toIso(payment.expiresAt),
        expired,
        paymentUrl: showLink ? payment.payUrl : null,
        qrCodeUrl: (showLink ? payment.qrCodeUrl : null) || sepayQr,
        qrUrl: sepayQr
    };
};

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
