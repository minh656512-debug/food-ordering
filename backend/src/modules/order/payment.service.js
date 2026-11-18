import prisma from "../../config/prisma.js";
import { ORDER_STATUS } from "../../common/constants/orderStatus.js";
import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";
import AppError from "../../common/utils/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import { assertCustomerOwnsOrder, getSellerShop } from "./order.access.js";
import * as orderRepository from "./order.repository.js";
import { PAYMENT_METHOD } from "./order.rules.js";
import { dateFilters } from "./order.service.js";
import * as paymentMapper from "./payment.mapper.js";
import * as paymentRepository from "./payment.repository.js";
import * as momo from "./payment.momo.js";
import * as vnpay from "./payment.vnpay.js";
import { buildSepayQrUrl } from "./payment.sepay.js";
import { refundIfPaid } from "./refund.service.js";

const RETRYABLE = [PAYMENT_STATUS.UNPAID, PAYMENT_STATUS.FAILED];

// Khách thanh toán trực tuyến cho đơn của mình.
// - MOCK: có kết quả ngay (simulate = SUCCESS | FAILED).
// - MOMO: gọi API MoMo, trả qrCodeUrl và paymentUrl; kết quả về qua IPN (xem handleMomoIpn).
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

    if (method === PAYMENT_METHOD.MOMO) return createMomoPayment(customerId, orderId);

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

        if (method === PAYMENT_METHOD.SEPAY || method === PAYMENT_METHOD.VIETQR) {
            const qrUrl = buildSepayQrUrl(order.id, payment.amount);
            const changed = await paymentRepository.updateIf(
                payment.id,
                RETRYABLE,
                {
                    method,
                    transactionId: `SEPAY-${payment.id}-${Date.now()}`,
                    status: PAYMENT_STATUS.UNPAID,
                    paidAt: null,
                    payUrl: qrUrl,
                    qrCodeUrl: qrUrl
                },
                tx
            );
            if (changed === 0) throw busy;
            payment = await paymentRepository.findById(payment.id, tx);
            return paymentMapper.toPaymentResult(payment, order, qrUrl);
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

// ---------------------------------------------------------------------
// MoMo
// ---------------------------------------------------------------------

const paymentNotFound = () => new AppError(404, "PAYMENT_NOT_FOUND", "Không tìm thấy giao dịch");

// Tạo giao dịch MoMo. Không gọi MoMo bên trong transaction (cuộc gọi có thể mất vài giây):
//   1) transaction ngắn: kiểm tra, cấp mã giao dịch mới cho lần thanh toán này;
//   2) gọi MoMo;
//   3) lưu liên kết/QR (chỉ khi lần thanh toán này vẫn là lần mới nhất).
// Giao dịch MoMo còn chờ và chưa hết hạn thì trả lại đúng QR cũ, không tạo giao dịch thứ hai.
const createMomoPayment = async (customerId, orderId) => {
    const reserved = await prisma.$transaction(async (tx) => {
        const order = await orderRepository.findDetailById(orderId, tx);
        assertCustomerOwnsOrder(customerId, order);

        if (order.status !== ORDER_STATUS.PENDING) {
            throw new AppError(
                409,
                "ORDER_NOT_PAYABLE",
                "Chỉ thanh toán được đơn đang chờ xác nhận"
            );
        }

        const payment =
            order.payments[0] ??
            (await paymentRepository.create(
                {
                    method: PAYMENT_METHOD.MOMO,
                    amount: order.totalAmount,
                    status: PAYMENT_STATUS.UNPAID,
                    orderId
                },
                tx
            ));
        if (payment.status === PAYMENT_STATUS.PAID) {
            throw new AppError(409, "ALREADY_PAID", "Đơn hàng đã được thanh toán");
        }
        if (payment.status === PAYMENT_STATUS.REFUNDED) {
            throw new AppError(409, "ORDER_NOT_PAYABLE", "Đơn hàng đã được hoàn tiền");
        }

        const stillValid =
            payment.method === PAYMENT_METHOD.MOMO &&
            payment.status === PAYMENT_STATUS.UNPAID &&
            payment.payUrl &&
            payment.expiresAt &&
            payment.expiresAt > new Date();
        if (stillValid) return { order, payment, reuse: true };

        // Số tiền luôn lấy từ đơn hàng trong database, không nhận từ client
        const momoOrderId = momo.makeOrderId(payment.id);
        const changed = await paymentRepository.updateIf(
            payment.id,
            RETRYABLE,
            {
                method: PAYMENT_METHOD.MOMO,
                amount: order.totalAmount,
                transactionId: momoOrderId,
                status: PAYMENT_STATUS.UNPAID,
                paidAt: null,
                payUrl: null,
                qrCodeUrl: null,
                expiresAt: null
            },
            tx
        );
        if (changed === 0) {
            throw new AppError(
                409,
                "PAYMENT_IN_PROGRESS",
                "Đơn hàng vừa được cập nhật, vui lòng thử lại"
            );
        }
        return {
            order,
            payment: await paymentRepository.findById(payment.id, tx),
            momoOrderId,
            reuse: false
        };
    });

    const { order, payment } = reserved;
    if (reserved.reuse) {
        return paymentMapper.toMomoPaymentResult(payment, order, {
            payUrl: payment.payUrl,
            qrCodeUrl: payment.qrCodeUrl,
            expiresAt: payment.expiresAt
        });
    }

    const amountNum = Math.round(Number(payment.amount));
    const content = `DH${order.id}`;
    const bankAccount = process.env.PAYMENT_ACCOUNT_NO || "0966517360";
    const bankCode = process.env.PAYMENT_BANK_CODE || "971025";
    const accountName = encodeURIComponent(process.env.PAYMENT_ACCOUNT_NAME || "PHAN HOAI NAM");
    const dynamicQr = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${amountNum}&addInfo=${encodeURIComponent(content)}&accountName=${accountName}`;

    const link = momo.isConfigured()
        ? await momo.createPaymentRequest({
              orderId: reserved.momoOrderId,
              amount: payment.amount,
              orderInfo: `Thanh toan don hang ${order.id}`
          })
        : {
              payUrl: dynamicQr,
              qrCodeUrl: dynamicQr,
              deeplink: null
          };

    const expiresAt = new Date(Date.now() + momo.EXPIRE_MINUTES * 60 * 1000);
    const saved = await paymentRepository.attachMomoLink(
        payment.id,
        reserved.momoOrderId,
        { payUrl: link.payUrl, qrCodeUrl: link.qrCodeUrl, expiresAt },
        prisma
    );
    if (saved === 0) {
        throw new AppError(
            409,
            "PAYMENT_IN_PROGRESS",
            "Đơn hàng vừa được cập nhật, vui lòng thử lại"
        );
    }

    return paymentMapper.toMomoPaymentResult(await paymentRepository.findById(payment.id), order, {
        ...link,
        expiresAt
    });
};

// Ghi nhận kết quả MoMo cho một thanh toán. Dùng chung cho IPN và truy vấn trạng thái.
// Idempotent: gọi nhiều lần với cùng kết quả chỉ ghi nhận một lần.
// Trả { code, payment? }: OK | PENDING | DUPLICATE | NOT_FOUND | INVALID_AMOUNT
const applyMomoResult = async ({ orderId, amount, transId, resultCode }) => {
    const paymentId = momo.parseOrderId(orderId);
    const payment = paymentId ? await paymentRepository.findById(paymentId) : null;
    if (!payment || payment.method !== PAYMENT_METHOD.MOMO) return { code: "NOT_FOUND" };

    // Số tiền MoMo báo phải đúng bằng số tiền trong database
    if (Number(amount) !== Math.round(Number(payment.amount))) {
        return { code: "INVALID_AMOUNT", payment };
    }

    const kind = momo.classifyResult(resultCode);
    if (kind === "PENDING") return { code: "PENDING", payment };

    const success = kind === "SUCCESS";
    const isCurrentAttempt = payment.transactionId === orderId;

    // Đã PAID/REFUNDED: không ghi nhận lại. Trả tiền hai lần cho một đơn thì ghi log để hoàn tay.
    if (!RETRYABLE.includes(payment.status)) {
        if (success && String(transId) !== payment.providerTransId) {
            console.warn(
                `[MOMO] Thanh toán trùng: payment=${payment.id} đã ${payment.status}, ` +
                    `MoMo transId=${transId} (orderId=${orderId}) cần được xử lý hoàn tiền thủ công`
            );
        }
        return { code: "DUPLICATE", payment };
    }

    // Kết quả thất bại của một lần thanh toán cũ không được làm hỏng lần thanh toán hiện tại.
    // (Kết quả thành công của lần cũ vẫn ghi nhận vì tiền đã bị trừ.)
    if (!success && !isCurrentAttempt) return { code: "DUPLICATE", payment };

    try {
        const outcome = await prisma.$transaction(async (tx) => {
            const changed = await paymentRepository.updateIf(
                payment.id,
                RETRYABLE,
                {
                    status: success ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED,
                    transactionId: orderId,
                    providerTransId: success ? String(transId) : payment.providerTransId,
                    paidAt: success ? new Date() : null,
                    payUrl: null,
                    qrCodeUrl: null,
                    expiresAt: null
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
            }
            return true;
        });
        if (outcome === null) return { code: "DUPLICATE", payment };
    } catch (error) {
        // MoMo transId đã được ghi cho một thanh toán khác (UNIQUE): coi là trùng, không ghi lần hai
        if (error?.code === "P2002") return { code: "DUPLICATE", payment };
        throw error;
    }
    return { code: "OK", payment: await paymentRepository.findById(payment.id) };
};

// IPN của MoMo (server-to-server, không có JWT, bảo vệ bằng chữ ký).
// Trả { ok, message, errorCode }. ok = true thì controller trả HTTP 204 như MoMo yêu cầu.
export const handleMomoIpn = async (body) => {
    if (!momo.verifyNotification(body)) {
        return { ok: false, errorCode: "INVALID_SIGNATURE", message: "Invalid signature" };
    }

    const result = await applyMomoResult(body);
    if (result.code === "NOT_FOUND") {
        return { ok: false, errorCode: "ORDER_NOT_FOUND", message: "Order not found" };
    }
    if (result.code === "INVALID_AMOUNT") {
        return { ok: false, errorCode: "INVALID_AMOUNT", message: "Invalid amount" };
    }
    // OK, PENDING, DUPLICATE: đã nhận, không cần MoMo gửi lại
    return { ok: true };
};

// Khách được MoMo chuyển về. KHÔNG cập nhật thanh toán từ dữ liệu trên URL (URL do trình duyệt
// mang về nên có thể bị sửa); chỉ kiểm tra chữ ký rồi đọc trạng thái hiện có trong database (do IPN ghi).
export const getMomoReturnStatus = async (query) => {
    if (!momo.verifyNotification(query)) {
        throw new AppError(400, "INVALID_PAYMENT_CALLBACK", "Invalid signature");
    }
    const paymentId = momo.parseOrderId(query.orderId);
    const payment = paymentId ? await paymentRepository.findById(paymentId) : null;
    if (!payment) throw new AppError(400, "INVALID_PAYMENT_CALLBACK", "Order not found");
    return { orderId: payment.orderId, paymentId: payment.id, paymentStatus: payment.status };
};

// Hỏi MoMo kết quả giao dịch hiện tại của thanh toán rồi ghi nhận như IPN. Lỗi mạng/MoMo chỉ ghi log:
// các API gọi hàm này vẫn trả được trạng thái đang có trong database.
const MOMO_NOT_FOUND_CODES = [42]; // MoMo chưa có giao dịch này (khách chưa mở liên kết)
const reconcileMomo = async (payment) => {
    if (
        payment.method !== PAYMENT_METHOD.MOMO ||
        payment.status !== PAYMENT_STATUS.UNPAID ||
        !payment.transactionId ||
        !momo.isConfigured()
    ) {
        return;
    }
    try {
        const data = await momo.queryTransaction(payment.transactionId);
        if (MOMO_NOT_FOUND_CODES.includes(Number(data.resultCode))) return;
        await applyMomoResult({
            orderId: payment.transactionId,
            amount: data.amount,
            transId: data.transId,
            resultCode: data.resultCode
        });
    } catch (error) {
        console.warn(
            `[MOMO] Không đồng bộ được giao dịch ${payment.transactionId}:`,
            error.message
        );
    }
};

// ---------------------------------------------------------------------
// Trạng thái, hủy giao dịch, xác nhận COD
// ---------------------------------------------------------------------

// Quyền xem một thanh toán: khách xem của mình, người bán xem đơn của cửa hàng mình, admin xem tất cả.
// Không thuộc quyền xem thì trả 404 như không tồn tại, để không lộ giao dịch của người khác.
const assertCanViewPayment = async (viewer, payment) => {
    if (!payment) throw paymentNotFound();
    if (viewer.role === ROLES.CUSTOMER && payment.order.customerId !== viewer.customerId) {
        throw paymentNotFound();
    }
    if (viewer.role === ROLES.SELLER) {
        const shop = await getSellerShop(viewer.sellerId);
        if (payment.order.shopId !== shop.id) throw paymentNotFound();
    }
};

// refresh = true: với giao dịch MoMo đang chờ, hỏi MoMo trước (trường hợp khách đã trả tiền nhưng
// frontend chưa nhận được kết quả). Mặc định chỉ đọc trạng thái trong database.
export const getPaymentStatus = async (viewer, paymentId, { refresh = false } = {}) => {
    let payment = await paymentRepository.findById(paymentId);
    await assertCanViewPayment(viewer, payment);

    if (refresh) {
        await reconcileMomo(payment);
        payment = await paymentRepository.findById(paymentId);
    }
    return paymentMapper.toPaymentStatus(payment);
};

// Khách hủy giao dịch MoMo đang chờ. MoMo không có API hủy cho mã QR đang chờ, nên hệ thống:
// hỏi MoMo trước (nếu khách đã trả thì ghi nhận PAID, không hủy), nếu chưa trả thì đánh dấu FAILED
// để khách tạo giao dịch mới. Nếu sau đó khách vẫn quét mã cũ và MoMo báo thành công, IPN vẫn ghi nhận.
export const cancelMomoPayment = async (customerId, paymentId) => {
    let payment = await paymentRepository.findById(paymentId);
    if (!payment || payment.order.customerId !== customerId) throw paymentNotFound();

    if (payment.method !== PAYMENT_METHOD.MOMO) {
        throw new AppError(409, "PAYMENT_NOT_CANCELLABLE", "Chỉ hủy được giao dịch MoMo");
    }

    await reconcileMomo(payment);
    payment = await paymentRepository.findById(paymentId);

    if (payment.status === PAYMENT_STATUS.PAID || payment.status === PAYMENT_STATUS.REFUNDED) {
        throw new AppError(409, "ALREADY_PAID", "Đơn hàng đã được thanh toán");
    }
    if (payment.status === PAYMENT_STATUS.UNPAID) {
        await paymentRepository.updateIf(payment.id, [PAYMENT_STATUS.UNPAID], {
            status: PAYMENT_STATUS.FAILED,
            payUrl: null,
            qrCodeUrl: null,
            expiresAt: null
        });
        payment = await paymentRepository.findById(paymentId);
    }
    return paymentMapper.toPaymentStatus(payment);
};

// Admin xác nhận đã nhận tiền mặt (COD). Chạy trong transaction; không xác nhận được lần hai.
export const confirmCodPayment = async (adminAccountId, paymentId, { receivedAmount } = {}) => {
    return prisma.$transaction(async (tx) => {
        const payment = await paymentRepository.findById(paymentId, tx);
        if (!payment) throw paymentNotFound();

        if (payment.method !== PAYMENT_METHOD.COD) {
            throw new AppError(409, "PAYMENT_NOT_COD", "Chỉ xác nhận thủ công được thanh toán COD");
        }
        if (payment.status === PAYMENT_STATUS.PAID || payment.status === PAYMENT_STATUS.REFUNDED) {
            throw new AppError(409, "ALREADY_PAID", "Đơn hàng đã được xác nhận thanh toán");
        }
        if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED].includes(payment.order.status)) {
            throw new AppError(
                409,
                "ORDER_NOT_PAYABLE",
                "Đơn hàng đã bị hủy hoặc từ chối, không thể xác nhận thanh toán"
            );
        }
        if (receivedAmount !== undefined && receivedAmount !== Math.round(Number(payment.amount))) {
            throw new AppError(
                400,
                "AMOUNT_MISMATCH",
                "Số tiền đã nhận không khớp với số tiền của đơn hàng"
            );
        }

        const now = new Date();
        const changed = await paymentRepository.updateIf(
            payment.id,
            [PAYMENT_STATUS.UNPAID],
            {
                status: PAYMENT_STATUS.PAID,
                paidAt: now,
                confirmedBy: adminAccountId,
                confirmedAt: now
            },
            tx
        );
        if (changed === 0) {
            throw new AppError(409, "ALREADY_PAID", "Đơn hàng đã được xác nhận thanh toán");
        }

        return paymentMapper.toCodConfirmResult(
            await paymentRepository.findById(payment.id, tx),
            payment.order
        );
    });
};

// Khách hàng hoặc mô phỏng quét QR MoMo thanh toán thành công (có kiểm tra đủ số tiền)
export const confirmMomoScanSuccess = async (customerId, paymentId, receivedAmount) => {
    return prisma.$transaction(async (tx) => {
        const payment = await paymentRepository.findById(paymentId, tx);
        if (!payment) throw paymentNotFound();
        const order = await orderRepository.findDetailById(payment.orderId, tx);
        assertCustomerOwnsOrder(customerId, order);

        if (payment.status === PAYMENT_STATUS.PAID) {
            return paymentMapper.toPaymentResult(payment, order);
        }

        const required = Number(order.totalAmount);
        if (receivedAmount !== undefined && receivedAmount !== null && Number(receivedAmount) < required) {
            throw new AppError(
                400,
                "INSUFFICIENT_AMOUNT",
                `Số tiền chuyển chưa đủ: nhận ${Number(receivedAmount).toLocaleString('vi-VN')}đ, cần ${required.toLocaleString('vi-VN')}đ`
            );
        }

        const changed = await paymentRepository.updateIf(
            payment.id,
            RETRYABLE,
            {
                status: PAYMENT_STATUS.PAID,
                transactionId: payment.transactionId || `MOMO-${payment.id}-${Date.now()}`,
                paidAt: new Date()
            },
            tx
        );
        if (changed === 0) {
            throw new AppError(409, "PAYMENT_IN_PROGRESS", "Đơn hàng vừa được cập nhật, vui lòng thử lại");
        }
        const updatedPayment = await paymentRepository.findById(payment.id, tx);
        return paymentMapper.toPaymentResult(updatedPayment, order);
    });
};

// Webhook tự động nhận thông báo tiền về từ ngân hàng / MoMo / SePay / Casso
export const handleBankWebhook = async ({ content, transferAmount, amount, transactionId }) => {
    const rawAmount = Number(transferAmount || amount || 0);
    const text = String(content || "");
    const match = /(?:DH|FOOD|MDH)?(\d+)/i.exec(text);
    if (!match) {
        throw new AppError(400, "INVALID_CONTENT", "Nội dung chuyển khoản không chứa mã đơn hàng hợp lệ");
    }

    const orderId = Number(match[1]);
    return prisma.$transaction(async (tx) => {
        const order = await orderRepository.findDetailById(orderId, tx);
        if (!order) throw new AppError(404, "ORDER_NOT_FOUND", `Không tìm thấy đơn hàng #${orderId}`);

        let payment = order.payments?.[0];
        if (!payment) {
            payment = await paymentRepository.create(
                {
                    method: PAYMENT_METHOD.MOMO,
                    amount: order.totalAmount,
                    status: PAYMENT_STATUS.UNPAID,
                    orderId
                },
                tx
            );
        }

        if (payment.status === PAYMENT_STATUS.PAID) {
            return { orderId, status: "PAID", message: "Đơn hàng đã được thanh toán trước đó" };
        }

        const required = Number(order.totalAmount);
        if (rawAmount < required) {
            throw new AppError(
                400,
                "INSUFFICIENT_AMOUNT",
                `Số tiền chuyển chưa đủ: nhận ${rawAmount.toLocaleString('vi-VN')}đ, cần ${required.toLocaleString('vi-VN')}đ`
            );
        }

        await paymentRepository.updateIf(
            payment.id,
            RETRYABLE,
            {
                status: PAYMENT_STATUS.PAID,
                transactionId: transactionId || `BANK-${payment.id}-${Date.now()}`,
                paidAt: new Date()
            },
            tx
        );

        return {
            orderId,
            paymentId: payment.id,
            status: "PAID",
            amountPaid: rawAmount,
            message: "Xác nhận thanh toán thành công"
        };
    });
};
