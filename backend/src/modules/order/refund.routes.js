import { Router } from "express";
import auth from "../../common/middlewares/auth.js";
import authorize from "../../common/middlewares/authorize.js";
import validate from "../../common/middlewares/validate.js";
import { ROLES } from "../../common/constants/roles.js";
import * as refundController from "./refund.controller.js";
import { rejectOrderSchema } from "./refund.schema.js";

// Gắn vào /orders trong routes.js (cùng tiền tố với order.routes.js)
const router = Router();

/**
 * @swagger
 * /orders/{id}/reject:
 *   patch:
 *     tags: [Seller Order]
 *     summary: Người bán từ chối đơn (PENDING hoặc CONFIRMED) kèm lý do, hoàn tiền nếu đã thanh toán
 *     description: |
 *       Bắt buộc nhập lý do. Đơn đã thanh toán: tạo Refund với số tiền bằng số đã thanh toán,
 *       thanh toán chuyển REFUNDED, đơn chuyển REJECTED. Đơn chưa thanh toán chỉ chuyển REJECTED.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string, example: Quán hết nguyên liệu }
 *     responses:
 *       200:
 *         description: Đã từ chối đơn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Order' }
 *       400: { description: VALIDATION_ERROR (thiếu lý do) }
 *       404: { description: ORDER_NOT_FOUND }
 *       409: { description: ORDER_NOT_REJECTABLE }
 */
router.patch(
    "/:id/reject",
    auth,
    authorize(ROLES.SELLER),
    validate(rejectOrderSchema),
    refundController.reject
);

export default router;
