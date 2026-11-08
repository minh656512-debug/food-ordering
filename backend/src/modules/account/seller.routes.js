import { Router } from "express";
import auth from "../../common/middlewares/auth.js";
import authorize from "../../common/middlewares/authorize.js";
import validate from "../../common/middlewares/validate.js";
import { ROLES } from "../../common/constants/roles.js";
import * as sellerController from "./seller.controller.js";
import { updateSellerSchema } from "./seller.schema.js";

const router = Router();

// Mọi route trong file này chỉ dành cho người bán đã đăng nhập
router.use(auth, authorize(ROLES.SELLER));

/**
 * @swagger
 * tags:
 *   - name: Seller
 *     description: Hồ sơ người bán
 */

/**
 * @swagger
 * /sellers/me:
 *   get:
 *     tags: [Seller]
 *     summary: Xem hồ sơ của tôi (kèm trạng thái cửa hàng)
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
 *                 data: { $ref: '#/components/schemas/Seller' }
 *       401: { description: Chưa đăng nhập }
 *       403: { description: Không phải người bán }
 *   put:
 *     tags: [Seller]
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
 *     responses:
 *       200: { description: Cập nhật thành công }
 *       400: { description: VALIDATION_ERROR }
 *       409: { description: EMAIL_ALREADY_USED hoặc PHONE_ALREADY_USED }
 */
router.get("/me", sellerController.getMe);
router.put("/me", validate(updateSellerSchema), sellerController.updateMe);

export default router;
