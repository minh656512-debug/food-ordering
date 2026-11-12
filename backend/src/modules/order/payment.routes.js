import { Router } from "express";
import auth from "../../common/middlewares/auth.js";
import authorize from "../../common/middlewares/authorize.js";
import validate from "../../common/middlewares/validate.js";
import { ROLES } from "../../common/constants/roles.js";
import * as paymentController from "./payment.controller.js";
import { createPaymentSchema, transactionsQuerySchema } from "./payment.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Payment
 *     description: Thanh toán trực tuyến (VNPay sandbox hoặc MOCK)
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     tags: [Payment]
 *     summary: Thanh toán trực tuyến cho đơn đang chờ xác nhận
 *     description: |
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
 *               method: { type: string, enum: [VNPAY, MOCK] }
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
 *                     paymentUrl: { type: string, description: Chỉ có với VNPAY }
 *       400: { description: VALIDATION_ERROR }
 *       404: { description: ORDER_NOT_FOUND }
 *       409: { description: "ORDER_NOT_PAYABLE, ALREADY_PAID, PAYMENT_IN_PROGRESS" }
 *       503: { description: PAYMENT_GATEWAY_NOT_CONFIGURED (chưa cấu hình VNPay) }
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
