import * as sepay from "./payment.sepay.js";

/**
 * Endpoint nhận webhook từ SePay: POST /api/payment/sepay/webhook
 * 1. Kiểm tra header Authorization: "Apikey ${process.env.SEPAY_API_KEY}" -> Nếu sai trả 401.
 * 2. Đọc payload JSON: id, transferType, transferAmount, code, content, referenceCode.
 * 3. Trả về HTTP 200 { "success": true } khi thành công hoặc đã thanh toán trước đó.
 */
export const handleSepayWebhook = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        console.log(`[SEPAY WEBHOOK] Nhận yêu cầu webhook từ ${req.ip} | AuthHeader: ${authHeader ? 'Đã truyền' : 'Không truyền'}`);

        if (!sepay.verifySepayApiKey(authHeader)) {
            console.warn(`[SEPAY WEBHOOK] ❌ Lỗi xác thực: Header Authorization không hợp lệ (${authHeader})`);
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid API Key"
            });
        }

        const result = await sepay.handleSepayWebhookPayload(req.body);
        return res.status(200).json(result);
    } catch (err) {
        console.error(`[SEPAY WEBHOOK] ⚠️ Lỗi: ${err.message}`);
        if (err.statusCode) {
            return res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        }
        return next(err);
    }
};
