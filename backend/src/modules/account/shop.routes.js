import { Router } from "express";
import auth from "../../common/middlewares/auth.js";
import authorize from "../../common/middlewares/authorize.js";
import validate from "../../common/middlewares/validate.js";
import { ROLES } from "../../common/constants/roles.js";
import * as shopController from "./shop.controller.js";
import { createShopSchema } from "./shop.schema.js";
import { searchShopQuerySchema } from "../menu/dish.schema.js";

const router = Router();

// POST /shops (người bán đăng ký) và GET /shops, GET /shops/:id (công khai, chỉ cửa hàng OPEN).

/**
 * @swagger
 * tags:
 *   - name: Shop
 *     description: Cửa hàng
 */

/**
 * @swagger
 * /shops:
 *   post:
 *     tags: [Shop]
 *     summary: Người bán đăng ký cửa hàng (trạng thái PENDING_APPROVAL)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, phone]
 *             properties:
 *               name: { type: string, example: Bánh Mì Chảo Minh Béo }
 *               address: { type: string, example: "7 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội" }
 *               phone: { type: string, example: "0243000009" }
 *               description: { type: string }
 *               openingHours: { type: string, example: "06:30 - 14:00" }
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Shop' }
 *       400: { description: VALIDATION_ERROR }
 *       401: { description: Chưa đăng nhập }
 *       403: { description: Không phải người bán }
 *       409: { description: SHOP_ALREADY_EXISTS - đã đăng ký cửa hàng }
 */
router.post(
    "/",
    auth,
    authorize(ROLES.SELLER),
    validate(createShopSchema),
    shopController.register
);

/**
 * @swagger
 * /shops:
 *   get:
 *     tags: [Shop]
 *     summary: Danh sách cửa hàng đang mở (công khai)
 *     parameters:
 *       - { in: query, name: keyword, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10, maximum: 50 } }
 *     responses:
 *       200: { description: "data: { items: [Shop], pagination }" }
 * /shops/{id}:
 *   get:
 *     tags: [Shop]
 *     summary: Chi tiết cửa hàng đang mở (công khai)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Thành công }
 *       404: { description: SHOP_NOT_FOUND }
 */
router.get("/", validate(searchShopQuerySchema, "query"), shopController.getAll);
router.get("/:id", shopController.getById);

export default router;
