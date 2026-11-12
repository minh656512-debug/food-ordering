import prisma from "../../config/prisma.js";
import { ORDER_STATUS } from "../../common/constants/orderStatus.js";
import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";
import AppError from "../../common/utils/AppError.js";
import { assertCustomerOwnsOrder } from "./order.access.js";
import * as orderRepository from "./order.repository.js";
import { PAYMENT_METHOD } from "./order.rules.js";
import { dateFilters } from "./order.service.js";
import * as paymentMapper from "./payment.mapper.js";
import * as paymentRepository from "./payment.repository.js";
import * as vnpay from "./payment.vnpay.js";
import { refundIfPaid } from "./refund.service.js";

const RETRYABLE = [PAYMENT_STATUS.UNPAID, PAYMENT_STATUS.FAILED];

// Khách thanh toán trực tuyến cho đơn của mình.
// - MOCK: có kết quả ngay (simulate = SUCCESS | FAILED).
// - VNPAY: trả paymentUrl để frontend chuyển khách sang VNPay; kết quả về qua return/IPN.
// Thanh toán thất bại thì đơn vẫn giữ nguyên PENDING để khách thanh toán lại.
export const createPayment = async (customerId, { orderId, method, simulate }, clientIp) => {
    if (method === PAYMENT_METHOD.VNPAY && !vnpay.isConfigured()) {
        throw new AppError(
            503,
            "PAYMENT_GATEWAY_NOT_CONFIGURED",
            "Chưa cấu hình VNPay, vui lòng dùng phương thức MOCK hoặc COD"
        );
    }

    return prisma.$transaction(async (tx) => {
        const order = await orderRepository.findDetailById(orderId, tx);
        assertCustomerOwnsOrder(customerId, order);

        if (order.status !== ORDER_STATUS.PENDING) {
            throw new AppError(
                409,
                "ORDER_NOT_PAYABLE",
                "Chỉ thanh toán được đơn đang chờ xác nhận"
            );
        }

        // Mỗi đơn dùng một bản ghi thanh toán, được tạo lúc đặt hàng; các lần thử lại ghi đè lên đó
        let payment =
            order.payments[0] ??
            (await paymentRepository.create(
                { method, amount: order.totalAmount, status: PAYMENT_STATUS.UNPAID, orderId },
                tx
            ));
        if (payment.status === PAYMENT_STATUS.PAID) {
            throw new AppError(409, "ALREADY_PAID", "Đơn hàng đã được thanh toán");
        }
        if (payment.status === PAYMENT_STATUS.REFUNDED) {
            throw new AppError(409, "ORDER_NOT_PAYABLE", "Đơn hàng đã được hoàn tiền");
        }

        const busy = new AppError(
            409,
            "PAYMENT_IN_PROGRESS",
            "Đơn hàng vừa được cập nhật, vui lòng thử lại"
        );

        if (method === PAYMENT_METHOD.MOCK) {
            const success = simulate === "SUCCESS";
            const changed = await paymentRepository.updateIf(
                payment.id,
                RETRYABLE,
                {
                    method,
                    transactionId: `MOCK-${payment.id}-${Date.now()}`,
                    status: success ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED,
                    paidAt: success ? new Date() : null
                },
                tx
            );
            if (changed === 0) throw busy;
            payment = await paymentRepository.findById(payment.id, tx);
            return paymentMapper.toPaymentResult(payment, order);
        }

        // VNPAY: ghi nhận phương thức rồi tạo URL thanh toán
        const txnRef = vnpay.makeTxnRef(payment.id);
        const changed = await paymentRepository.updateIf(
            payment.id,
            RETRYABLE,
            { method, transactionId: txnRef, status: PAYMENT_STATUS.UNPAID, paidAt: null },
            tx
        );
        if (changed === 0) throw busy;
        payment = await paymentRepository.findById(payment.id, tx);

        const paymentUrl = vnpay.buildPaymentUrl({
            txnRef,
            amount: payment.amount,
            orderInfo: `Thanh toan don hang ${order.id}`,
            ipAddr: clientIp
        });
        return paymentMapper.toPaymentResult(payment, order, paymentUrl);
    });
};

// Xử lý dữ liệu VNPay gửi về (dùng chung cho return và IPN).
// Trả { code, message, orderId?, paymentStatus? }; code theo quy định RspCode của VNPay.
export const handleVnpayCallback = async (query) => {
    if (!vnpay.verifyCallback(query)) {
        return { code: "97", message: "Invalid signature" };
    }

    const paymentId = vnpay.parseTxnRef(query.vnp_TxnRef);
    const payment = paymentId ? await paymentRepository.findById(paymentId) : null;
    if (!payment) {
        return { code: "01", message: "Order not found" };
    }
    if (Number(query.vnp_Amount) !== Math.round(Number(payment.amount)) * 100) {
        return { code: "04", message: "Invalid amount", orderId: payment.orderId };
    }
    if (!RETRYABLE.includes(payment.status)) {
        // Đã xử lý trước đó (IPN và return thường đến hai lần cho cùng một giao dịch)
        return {
            code: "02",
            message: "Order already confirmed",
            orderId: payment.orderId,
            paymentStatus: payment.status
        };
    }

    const success = vnpay.isSuccess(query);
    const newStatus = success ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED;

    const outcome = await prisma.$transaction(async (tx) => {
        const changed = await paymentRepository.updateIf(
            payment.id,
            RETRYABLE,
            {
                status: newStatus,
                transactionId: query.vnp_TxnRef,
                paidAt: success ? new Date() : null
            },
            tx
        );
        if (changed === 0) return null;

        // Khách trả tiền sau khi đơn đã bị hủy hoặc từ chối: hoàn lại ngay, không giữ tiền
        const closed = [ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED].includes(
            payment.order.status
        );
        if (success && closed) {
            const paid = await paymentRepository.findById(payment.id, tx);
            await refundIfPaid(paid, "Thanh toán sau khi đơn đã bị hủy hoặc từ chối", tx);
            return PAYMENT_STATUS.REFUNDED;
        }
        return newStatus;
    });

    if (outcome === null) {
        return { code: "02", message: "Order already confirmed", orderId: payment.orderId };
    }
    return {
        code: "00",
        message: "Confirm Success",
        orderId: payment.orderId,
        paymentStatus: outcome
    };
};

// Quản trị viên xem danh sách giao dịch (chỉ xem)
export const listTransactions = async (query) => {
    const { rows, total } = await paymentRepository.findPage(
        { status: query.status, method: query.method, shopId: query.shopId, ...dateFilters(query) },
        { page: query.page, limit: query.limit }
    );
    return paymentMapper.toPage(
        rows,
        total,
        query.page,
        query.limit,
        paymentMapper.toTransactionResponse
    );
};
