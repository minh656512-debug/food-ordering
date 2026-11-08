import { Router } from "express";
import auth from "../../common/middlewares/auth.js";
import validate from "../../common/middlewares/validate.js";
import * as authController from "./auth.controller.js";
import { changePasswordSchema } from "./auth.schema.js";

const router = Router();

/**
 * @swagger
 * /accounts/me/password:
 *   patch:
 *     tags: [Account]
 *     summary: Đổi mật khẩu (mọi vai trò)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: VALIDATION_ERROR hoặc INVALID_CURRENT_PASSWORD
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       401:
 *         description: Chưa đăng nhập
 */
router.patch("/me/password", auth, validate(changePasswordSchema), authController.changePassword);

export default router;
