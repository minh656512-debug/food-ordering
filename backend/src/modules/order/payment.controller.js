import { fail, ok } from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";
import { getCurrentCustomerId } from "../../common/utils/currentUser.js";
import * as paymentService from "./payment.service.js";

export const create = asyncHandler(async (req, res) => {
    const customerId = await getCurrentCustomerId(req);
    const data = await paymentService.createPayment(customerId, req.body, req.ip);
    const message =
        data.payment.status === "FAILED"
            ? "Thanh toán thất bại, bạn có thể thử lại"
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
