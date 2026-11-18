import prisma from "../../config/prisma.js";
import { ORDER_STATUS } from "../../common/constants/orderStatus.js";
import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";
import AppError from "../../common/utils/AppError.js";

/**
 * Lấy cấu hình SePay từ biến môi trường
 */
export const getSepayConfig = () => ({
    apiKey: (process.env.SEPAY_API_KEY || "").trim(),
    bankName: (process.env.SEPAY_BANK_NAME || "MBBank").trim(),
    accountNumber: (process.env.SEPAY_ACCOUNT_NUMBER || "0966517360").trim()
});

/**
 * Tạo link ảnh VietQR động của SePay:
 * https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankName}&amount=${totalAmount}&des=DH${orderId}
 */
export const buildSepayQrUrl = (orderId, totalAmount) => {
    const { accountNumber, bankName } = getSepayConfig();
    const amount = Math.round(Number(totalAmount) || 0);
    return `https://qr.sepay.vn/img?acc=${encodeURIComponent(accountNumber)}&bank=${encodeURIComponent(bankName)}&amount=${amount}&des=DH${orderId}`;
};

/**
 * Kiểm tra header Authorization có đúng định dạng "Apikey ${process.env.SEPAY_API_KEY}"
 * Chấp nhận linh hoạt các biến thể hoa/thường: "Apikey ...", "ApiKey ...", "apikey ..." hoặc trực tiếp API Key
 */
export const verifySepayApiKey = (authHeader) => {
    const { apiKey } = getSepayConfig();
    // Nếu chưa thiết lập SEPAY_API_KEY trên môi trường dev/local thì cho phép để test
    if (!apiKey) return true;
    if (!authHeader) return false;

    const trimmed = String(authHeader).trim();
    const match = /^(?:apikey|bearer)?\s*(.+)$/i.exec(trimmed);
    const token = match ? match[1].trim() : trimmed;
    return token === apiKey;
};

/**
 * Xử lý webhook từ SePay:
 * Payload: { id, transferType, transferAmount, code, content, referenceCode }
 */
export const handleSepayWebhookPayload = async (payload) => {
    const { id, transferType, transferAmount, code, content, referenceCode } = payload || {};

    console.log(
        `[SEPAY WEBHOOK] 📥 Nhận payload: ID=${id}, Type=${transferType}, Amount=${transferAmount}, Code="${code}", Content="${content}", Ref="${referenceCode}"`
    );

    // 1. Chỉ xử lý khi tiền vào (transferType === 'in')
    if (transferType && transferType !== "in") {
        console.log(`[SEPAY WEBHOOK] ℹ️ Bỏ qua giao dịch không phải tiền vào (transferType = "${transferType}")`);
        return { success: true, message: "Bỏ qua giao dịch không phải tiền vào (transferType != 'in')" };
    }

    // 2. Lấy mã đơn hàng từ trường code (ví dụ "DH15" -> 15), nếu rỗng tìm regex DH(\d+) trong content
    let orderId = null;
    if (code) {
        const match = /(?:DH)?(\d+)/i.exec(String(code).trim());
        if (match) orderId = Number(match[1]);
    }
    if (!orderId && content) {
        const match = /DH(\d+)/i.exec(String(content));
        if (match) orderId = Number(match[1]);
    }

    if (!orderId || isNaN(orderId)) {
        console.warn(`[SEPAY WEBHOOK] ❌ Không thể trích xuất mã đơn hàng DH từ code="${code}" hoặc content="${content}"`);
        throw new AppError(400, "INVALID_ORDER_CODE", "Không tìm thấy mã đơn hàng DH trong code hoặc content");
    }

    // 3. Tìm đơn hàng trong DB qua Prisma
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payments: true }
    });

    if (!order) {
        console.warn(`[SEPAY WEBHOOK] ❌ Không tìm thấy đơn hàng #${orderId} trong hệ thống`);
        throw new AppError(404, "ORDER_NOT_FOUND", `Không tìm thấy đơn hàng #${orderId}`);
    }

    // 4. Kiểm tra tính lũy đẳng (Idempotency): Nếu đơn đã ở trạng thái đã thanh toán thì trả về success: true ngay
    const isAlreadyPaid =
        order.payments?.some((p) => p.status === PAYMENT_STATUS.PAID) ||
        order.status === "PAID";

    if (isAlreadyPaid) {
        console.log(`[SEPAY WEBHOOK] ℹ️ Đơn hàng #${order.id} đã ở trạng thái PAID trước đó. Trả về thành công ngay.`);
        return { success: true, message: "Đơn hàng đã được thanh toán trước đó" };
    }

    // 5. Kiểm tra số tiền chuyển
    const receivedAmount = Number(transferAmount || 0);
    const requiredAmount = Number(order.totalAmount);
    if (receivedAmount < requiredAmount) {
        console.warn(
            `[SEPAY WEBHOOK] ❌ Số tiền chuyển không đủ cho đơn #${order.id}: Nhận ${receivedAmount.toLocaleString("vi-VN")}đ, Cần ${requiredAmount.toLocaleString("vi-VN")}đ`
        );
        throw new AppError(
            400,
            "INSUFFICIENT_AMOUNT",
            `Số tiền chuyển không đủ: nhận ${receivedAmount.toLocaleString("vi-VN")}đ, cần ${requiredAmount.toLocaleString("vi-VN")}đ`
        );
    }

    // 6. Dùng prisma.$transaction để cập nhật trạng thái
    const transId = String(referenceCode || id || `SEPAY-${order.id}-${Date.now()}`);
    const providerTransId = String(id || referenceCode || "");

    await prisma.$transaction(async (tx) => {
        const existingPayment = order.payments?.[0];
        if (existingPayment) {
            await tx.payment.update({
                where: { id: existingPayment.id },
                data: {
                    status: PAYMENT_STATUS.PAID,
                    transactionId: transId,
                    providerTransId,
                    paidAt: new Date(),
                    method: existingPayment.method === "COD" ? "SEPAY" : existingPayment.method
                }
            });
        } else {
            await tx.payment.create({
                data: {
                    orderId: order.id,
                    method: "SEPAY",
                    amount: order.totalAmount,
                    status: PAYMENT_STATUS.PAID,
                    transactionId: transId,
                    providerTransId,
                    paidAt: new Date()
                }
            });
        }

        // Cập nhật trạng thái đơn hàng sang CONFIRMED nếu đang ở PENDING
        if (order.status === ORDER_STATUS.PENDING) {
            await tx.order.update({
                where: { id: order.id },
                data: { status: ORDER_STATUS.CONFIRMED }
            });
        }
    });

    console.log(
        `[SEPAY WEBHOOK] ✅ ĐÃ CẬP NHẬT ĐƠN HÀNG #${order.id} SANG PAID THÀNH CÔNG! Số tiền: ${receivedAmount.toLocaleString("vi-VN")}đ, Mã GD: ${transId}`
    );

    return { success: true };
};
