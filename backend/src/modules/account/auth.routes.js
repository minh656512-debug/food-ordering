import { Router } from "express";
import validate from "../../common/middlewares/validate.js";
import * as authController from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Đăng ký, đăng nhập, đăng xuất (công khai)
 *   - name: Account
 *     description: Tài khoản của người đang đăng nhập
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản khách hàng hoặc người bán
 *     description: >
 *       Khách hàng dùng được ngay (ACTIVE). Người bán ở trạng thái PENDING_APPROVAL
 *       cho tới khi quản trị viên duyệt; vẫn đăng nhập và đăng ký cửa hàng được.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, role, fullName, email, phone]
 *             properties:
 *               username: { type: string, example: kh_moi }
 *               password: { type: string, example: "123456" }
 *               role: { type: string, enum: [CUSTOMER, SELLER] }
 *               fullName: { type: string, example: Nguyễn Văn A }
 *               email: { type: string, example: a@example.com }
 *               phone: { type: string, example: "0911000001" }
 *               address: { type: string, description: Chỉ dành cho khách hàng }
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu không hợp lệ (VALIDATION_ERROR)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       409:
 *         description: Trùng USERNAME_ALREADY_USED, EMAIL_ALREADY_USED hoặc PHONE_ALREADY_USED
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập, nhận JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, example: kh_an }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: Thành công, data là AuthResult
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/AuthResult' }
 *       401:
 *         description: INVALID_CREDENTIALS - sai tên đăng nhập hoặc mật khẩu
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       403:
 *         description: ACCOUNT_LOCKED - tài khoản bị khóa
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng xuất
 *     description: Với JWT, frontend tự xóa token. Endpoint luôn trả 200.
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.post("/logout", authController.logout);

export default router;
