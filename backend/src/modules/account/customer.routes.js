import { Router } from "express";
import auth from "../../common/middlewares/auth.js";
import authorize from "../../common/middlewares/authorize.js";
import validate from "../../common/middlewares/validate.js";
import { ROLES } from "../../common/constants/roles.js";
import * as customerController from "./customer.controller.js";
import { updateCustomerSchema } from "./customer.schema.js";

const router = Router();

// Mọi route trong file này chỉ dành cho khách hàng đã đăng nhập
router.use(auth, authorize(ROLES.CUSTOMER));

/**
 * @swagger
 * tags:
 *   - name: Customer
 *     description: Hồ sơ khách hàng
 */

/**
 * @swagger
 * /customers/me:
 *   get:
 *     tags: [Customer]
 *     summary: Xem hồ sơ của tôi (kèm điểm tích lũy)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Customer' }
 *       401: { description: Chưa đăng nhập }
 *       403: { description: Không phải khách hàng }
 *   put:
 *     tags: [Customer]
 *     summary: Sửa hồ sơ của tôi
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phone]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               address: { type: string, nullable: true }
 *     responses:
 *       200: { description: Cập nhật thành công }
 *       400: { description: VALIDATION_ERROR }
 *       409: { description: EMAIL_ALREADY_USED hoặc PHONE_ALREADY_USED }
 */
router.get("/me", customerController.getMe);
router.put("/me", validate(updateCustomerSchema), customerController.updateMe);

export default router;
