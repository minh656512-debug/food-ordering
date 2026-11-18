import { fail, ok } from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";
import { ROLES } from "../../common/constants/roles.js";
import { getCurrentCustomerId, getCurrentSellerId } from "../../common/utils/currentUser.js";
import { parseId } from "./order.schema.js";
import * as paymentService from "./payment.service.js";

export const create = asyncHandler(async (req, res) => {
    const customerId = await getCurrentCustomerId(req);
    const data = await paymentService.createPayment(customerId, req.body, req.ip);
    const message =
        data.payment.status === "FAILED"
            ? "Thanh toán thất bại, bạn có thể thử lại"
            : data.qrCodeUrl || data.payment.method === "MOMO"
              ? "Đã tạo giao dịch thanh toán MoMo"
              : data.paymentUrl
                ? "Đã tạo liên kết thanh toán VNPay"
                : "Thanh toán thành công";
    res.status(201).json(ok(data, message));
});

// VNPay gọi server-to-server để báo kết quả (công khai, bảo vệ bằng chữ ký). Phải trả đúng định dạng của VNPay.
export const vnpayIpn = asyncHandler(async (req, res) => {
    const result = await paymentService.handleVnpayCallback(req.query);
    res.json({ RspCode: result.code, Message: result.message });
});

// Khách được VNPay chuyển về sau khi thanh toán.
// Nếu có VNP_CLIENT_RETURN_URL thì chuyển tiếp sang trang kết quả của frontend, không thì trả JSON.
export const vnpayReturn = asyncHandler(async (req, res) => {
    const result = await paymentService.handleVnpayCallback(req.query);

    if (result.code === "97" || result.code === "01") {
        return res.status(400).json(fail(result.message, "INVALID_PAYMENT_CALLBACK"));
    }

    const paid = result.paymentStatus === "PAID";
    const clientUrl = process.env.VNP_CLIENT_RETURN_URL;
    if (clientUrl) {
        const target = new URL(clientUrl);
        target.searchParams.set("orderId", String(result.orderId));
        target.searchParams.set("status", paid ? "success" : "failed");
        return res.redirect(target.toString());
    }
    return res.json(
        ok(
            { orderId: result.orderId, paymentStatus: result.paymentStatus ?? null, success: paid },
            paid ? "Thanh toán thành công" : "Thanh toán không thành công"
        )
    );
});

export const listTransactions = asyncHandler(async (req, res) => {
    res.json(ok(await paymentService.listTransactions(req.query)));
});

// ---- MoMo ----

// MoMo gọi server-to-server để báo kết quả (công khai, bảo vệ bằng chữ ký).
// Thành công phải trả HTTP 204 (không nội dung) như tài liệu MoMo.
export const momoIpn = asyncHandler(async (req, res) => {
    const result = await paymentService.handleMomoIpn(req.body);
    if (result.ok) return res.status(204).end();
    return res.status(400).json(fail(result.message, result.errorCode));
});

// Khách được MoMo chuyển về. Chỉ ĐỌC trạng thái trong database (IPN mới là nơi ghi PAID).
// Nếu có MOMO_CLIENT_RETURN_URL thì chuyển tiếp sang trang kết quả của frontend, không thì trả JSON.
export const momoReturn = asyncHandler(async (req, res) => {
    const result = await paymentService.getMomoReturnStatus(req.query);
    const status =
        result.paymentStatus === "PAID"
            ? "success"
            : result.paymentStatus === "FAILED"
              ? "failed"
              : "pending";

    const clientUrl = process.env.MOMO_CLIENT_RETURN_URL;
    if (clientUrl) {
        const target = new URL(clientUrl);
        target.searchParams.set("orderId", String(result.orderId));
        target.searchParams.set("paymentId", String(result.paymentId));
        target.searchParams.set("status", status);
        return res.redirect(target.toString());
    }
    return res.json(
        ok(
            {
                orderId: result.orderId,
                paymentId: result.paymentId,
                paymentStatus: result.paymentStatus
            },
            status === "success" ? "Thanh toán thành công" : "Đang chờ kết quả thanh toán"
        )
    );
});

// ---- Trạng thái, hủy, xác nhận COD ----

// Người đang xem theo vai trò (customerId/sellerId lấy từ database, không tin client)
const getViewer = async (req) => {
    const { role } = req.user;
    if (role === ROLES.CUSTOMER) return { role, customerId: await getCurrentCustomerId(req) };
    if (role === ROLES.SELLER) return { role, sellerId: await getCurrentSellerId(req) };
    return { role };
};

export const getStatus = asyncHandler(async (req, res) => {
    const viewer = await getViewer(req);
    const data = await paymentService.getPaymentStatus(
        viewer,
        parseId(req.params.paymentId, "Mã thanh toán"),
        { refresh: req.query.refresh === "true" }
    );
    res.json(ok(data));
});

export const cancel = asyncHandler(async (req, res) => {
    const customerId = await getCurrentCustomerId(req);
    const data = await paymentService.cancelMomoPayment(
        customerId,
        parseId(req.params.paymentId, "Mã thanh toán")
    );
    res.json(ok(data, "Đã hủy giao dịch, bạn có thể thanh toán lại"));
});

export const confirmCod = asyncHandler(async (req, res) => {
    const data = await paymentService.confirmCodPayment(
        req.user.accountId,
        parseId(req.params.paymentId, "Mã thanh toán"),
        req.body
    );
    res.json(ok(data, "Đã xác nhận nhận tiền mặt"));
});

export const scanSuccess = asyncHandler(async (req, res) => {
    const customerId = await getCurrentCustomerId(req);
    const data = await paymentService.confirmMomoScanSuccess(
        customerId,
        parseId(req.params.paymentId, "Mã thanh toán"),
        req.body?.receivedAmount
    );
    res.json(ok(data, "Thanh toán quét mã MoMo thành công"));
});

export const webhook = asyncHandler(async (req, res) => {
    const result = await paymentService.handleBankWebhook(req.body);
    res.json(ok(result, "Đã xử lý thông báo chuyển khoản"));
});
