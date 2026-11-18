import { Router } from "express";
import auth from "../../common/middlewares/auth.js";
import authorize from "../../common/middlewares/authorize.js";
import validate from "../../common/middlewares/validate.js";
import { ROLES } from "../../common/constants/roles.js";
import * as paymentController from "./payment.controller.js";
import * as sepayController from "./sepay.controller.js";
import {
    confirmCodSchema,
    createPaymentSchema,
    paymentStatusQuerySchema,
    transactionsQuerySchema
} from "./payment.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Payment
 *     description: Thanh toán MoMo (QR), COD (Admin xác nhận), VNPay sandbox, MOCK
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     tags: [Payment]
 *     summary: Thanh toán trực tuyến cho đơn đang chờ xác nhận
 *     description: |
 *       - `MOMO`: gọi API MoMo, trả `qrCodeUrl` (mã QR), `paymentUrl`, `deeplink`, `expiresAt`. Kết quả về qua IPN `POST /payments/momo-ipn`; frontend hỏi `GET /payments/{paymentId}/status`. Giao dịch còn hạn thì gọi lại trả đúng QR cũ.
 *       - `MOCK`: có kết quả ngay; `simulate` = SUCCESS (mặc định) hoặc FAILED.
 *       - `VNPAY`: trả `paymentUrl`, frontend chuyển khách sang đó. Kết quả về qua `/payments/vnpay-return` và `/payments/vnpay-ipn`.
 *       Thanh toán thất bại thì đơn vẫn giữ, khách gọi lại để thanh toán lại.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, method]
 *             properties:
 *               orderId: { type: integer, example: 15 }
 *               method: { type: string, enum: [MOMO, VNPAY, MOCK] }
 *               simulate: { type: string, enum: [SUCCESS, FAILED], description: Chỉ dùng cho MOCK }
 *     responses:
 *       201:
 *         description: Kết quả thanh toán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment: { $ref: '#/components/schemas/PaymentInfo' }
 *                     order: { type: object, properties: { id: { type: integer }, status: { type: string } } }
 *                     paymentUrl: { type: string, description: Có với MOMO và VNPAY }
 *                     qrCodeUrl: { type: string, nullable: true, description: Chỉ có với MOMO }
 *                     deeplink: { type: string, nullable: true, description: Chỉ có với MOMO }
 *                     expiresAt: { type: string, format: date-time, nullable: true, description: Hạn của QR MoMo }
 *       400: { description: VALIDATION_ERROR }
 *       404: { description: ORDER_NOT_FOUND }
 *       409: { description: "ORDER_NOT_PAYABLE, ALREADY_PAID, PAYMENT_IN_PROGRESS" }
 *       502: { description: PAYMENT_GATEWAY_ERROR (MoMo từ chối hoặc không phản hồi) }
 *       503: { description: PAYMENT_GATEWAY_NOT_CONFIGURED (chưa cấu hình MoMo/VNPay) }
 */
router.post(
    "/",
    auth,
    authorize(ROLES.CUSTOMER),
    validate(createPaymentSchema),
    paymentController.create
);

/**
 * @swagger
 * /payments/vnpay-return:
 *   get:
 *     tags: [Payment]
 *     summary: VNPay chuyển khách về sau khi thanh toán (công khai, kiểm tra chữ ký)
 *     description: Nhận nguyên các tham số `vnp_*` của VNPay. Có `VNP_CLIENT_RETURN_URL` thì chuyển tiếp sang frontend kèm `orderId` và `status`, không thì trả JSON.
 *     responses:
 *       200: { description: Kết quả thanh toán }
 *       400: { description: INVALID_PAYMENT_CALLBACK (sai chữ ký hoặc không tìm thấy giao dịch) }
 * /payments/vnpay-ipn:
 *   get:
 *     tags: [Payment]
 *     summary: VNPay báo kết quả server-to-server (công khai, kiểm tra chữ ký)
 *     responses:
 *       200: { description: "{ RspCode, Message } theo quy định của VNPay" }
 */
router.get("/vnpay-return", paymentController.vnpayReturn);
router.get("/vnpay-ipn", paymentController.vnpayIpn);

/**
 * @swagger
 * /payments/momo-ipn:
 *   post:
 *     tags: [Payment]
 *     summary: MoMo gọi server-to-server báo kết quả (công khai, bắt buộc đúng chữ ký)
 *     description: |
 *       Không cần JWT. Backend xác minh chữ ký, mã giao dịch, số tiền, rồi mới ghi PAID/FAILED.
 *       Gọi lặp lại không ghi nhận trùng. Thành công trả 204; sai chữ ký, sai số tiền, không thấy giao dịch trả 400.
 *     responses:
 *       204: { description: Đã nhận }
 *       400: { description: "INVALID_SIGNATURE, INVALID_AMOUNT, ORDER_NOT_FOUND" }
 * /payments/momo-return:
 *   get:
 *     tags: [Payment]
 *     summary: Khách được MoMo chuyển về (chỉ đọc trạng thái trong database)
 *     description: Không cập nhật thanh toán từ dữ liệu trên URL. Nếu có `MOMO_CLIENT_RETURN_URL` thì chuyển tiếp sang frontend kèm `orderId`, `paymentId`, `status` (success, failed, pending).
 *     responses:
 *       200: { description: Trạng thái hiện có }
 *       302: { description: Chuyển sang trang kết quả của frontend }
 *       400: { description: INVALID_PAYMENT_CALLBACK }
 */
router.post("/momo-ipn", paymentController.momoIpn);
router.get("/momo-return", paymentController.momoReturn);

/**
 * @swagger
 * /payments/{paymentId}/status:
 *   get:
 *     tags: [Payment]
 *     summary: Trạng thái thanh toán mới nhất
 *     description: |
 *       Khách chỉ xem được giao dịch của mình, người bán chỉ xem đơn của cửa hàng mình, admin xem tất cả
 *       (giao dịch ngoài quyền xem trả 404). Mặc định đọc từ database; với `refresh=true` và giao dịch MoMo đang chờ,
 *       backend hỏi MoMo trước (dùng khi khách đã trả tiền nhưng frontend chưa nhận được kết quả).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: paymentId, in: path, required: true, schema: { type: integer } }
 *       - { name: refresh, in: query, schema: { type: string, enum: ["true", "false"], default: "false" } }
 *     responses:
 *       200: { description: "paymentId, orderId, orderStatus, method, status, amount, transactionId, paidAt, confirmedAt, expiresAt, expired, paymentUrl, qrCodeUrl" }
 *       404: { description: PAYMENT_NOT_FOUND }
 * /payments/{paymentId}/cancel:
 *   patch:
 *     tags: [Payment]
 *     summary: Khách hủy giao dịch MoMo đang chờ (để thanh toán lại)
 *     description: MoMo không có API hủy cho QR đang chờ. Backend hỏi MoMo trước; đã trả tiền thì giữ PAID (409 ALREADY_PAID), chưa trả thì đánh dấu FAILED.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: paymentId, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Trạng thái sau khi hủy }
 *       404: { description: PAYMENT_NOT_FOUND }
 *       409: { description: "ALREADY_PAID, PAYMENT_NOT_CANCELLABLE" }
 * /payments/{paymentId}/confirm:
 *   patch:
 *     tags: [Payment]
 *     summary: Admin xác nhận đã nhận tiền mặt (COD)
 *     description: Chỉ ADMIN. Chỉ với thanh toán COD đang UNPAID và đơn chưa bị hủy/từ chối; lưu người xác nhận và thời gian; không xác nhận được lần hai.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: paymentId, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receivedAmount: { type: integer, example: 75000, description: Số tiền Admin đã nhận; nếu gửi phải khớp số tiền của đơn }
 *     responses:
 *       200: { description: Đã xác nhận (payment, order, confirmedBy) }
 *       400: { description: "VALIDATION_ERROR, AMOUNT_MISMATCH" }
 *       403: { description: Không phải ADMIN }
 *       404: { description: PAYMENT_NOT_FOUND }
 *       409: { description: "ALREADY_PAID, PAYMENT_NOT_COD, ORDER_NOT_PAYABLE" }
 */
router.get(
    "/:paymentId/status",
    auth,
    authorize(ROLES.CUSTOMER, ROLES.SELLER, ROLES.ADMIN),
    validate(paymentStatusQuerySchema, "query"),
    paymentController.getStatus
);
router.patch("/:paymentId/cancel", auth, authorize(ROLES.CUSTOMER), paymentController.cancel);
router.patch("/:paymentId/scan-success", auth, authorize(ROLES.CUSTOMER), paymentController.scanSuccess);
router.post("/webhook", paymentController.webhook);
router.post("/sepay/webhook", sepayController.handleSepayWebhook);
router.post("/sepay-webhook", sepayController.handleSepayWebhook);
router.patch(
    "/:paymentId/confirm",
    auth,
    authorize(ROLES.ADMIN),
    validate(confirmCodSchema),
    paymentController.confirmCod
);

export default router;

// ---------------------------------------------------------------------
// /admin/transactions: giám sát giao dịch (chỉ xem)
// ---------------------------------------------------------------------
export const adminTransactionRoutes = Router();

/**
 * @swagger
 * /admin/transactions:
 *   get:
 *     tags: [Admin Monitor]
 *     summary: Giám sát giao dịch thanh toán (lọc theo ngày, trạng thái, phương thức, cửa hàng, phân trang)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/From'
 *       - $ref: '#/components/parameters/To'
 *       - { name: status, in: query, schema: { type: string, enum: [UNPAID, PAID, FAILED, REFUNDED] } }
 *       - { name: method, in: query, schema: { type: string, enum: [VNPAY, COD, MOCK] } }
 *       - { name: shopId, in: query, schema: { type: integer } }
 *     responses:
 *       200: { description: "Danh sách giao dịch { items, pagination }, mỗi dòng kèm đơn, cửa hàng và hoàn tiền" }
 *       403: { description: Không phải quản trị viên }
 */
adminTransactionRoutes.get(
    "/",
    auth,
    authorize(ROLES.ADMIN),
    validate(transactionsQuerySchema, "query"),
    paymentController.listTransactions
);
