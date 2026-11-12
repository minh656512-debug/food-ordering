import { Router } from "express";
import auth from "../../common/middlewares/auth.js";
import authorize from "../../common/middlewares/authorize.js";
import validate from "../../common/middlewares/validate.js";
import { ROLES } from "../../common/constants/roles.js";
import * as statisticController from "./statistic.controller.js";
import { revenueQuerySchema } from "./statistic.schema.js";

// Gắn vào /shops trong routes.js
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Statistic
 *     description: Thống kê doanh thu (người bán) và thống kê hệ thống (quản trị viên)
 */

/**
 * @swagger
 * /shops/{shopId}/statistics/revenue:
 *   get:
 *     tags: [Statistic]
 *     summary: Thống kê doanh thu của cửa hàng theo ngày, tuần hoặc tháng, kèm món bán chạy
 *     description: |
 *       Chỉ tính đơn COMPLETED đã thanh toán (đơn hoàn tiền bị loại). Nhóm theo ngày đặt đơn (giờ lưu trong database).
 *       Bỏ trống `from`/`to` thì lấy 30 ngày (day), 12 tuần (week) hoặc 12 tháng (month) gần nhất. Tuần bắt đầu từ thứ Hai.
 *       Người bán chỉ xem được cửa hàng của mình.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: shopId, in: path, required: true, schema: { type: integer } }
 *       - { name: groupBy, in: query, schema: { type: string, enum: [day, week, month], default: day } }
 *       - $ref: '#/components/parameters/From'
 *       - $ref: '#/components/parameters/To'
 *     responses:
 *       200:
 *         description: Thống kê doanh thu
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
 *                     shopId: { type: integer }
 *                     groupBy: { type: string }
 *                     range: { type: object, properties: { from: { type: string }, to: { type: string } } }
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRevenue: { type: number }
 *                         totalOrders: { type: integer }
 *                         averageOrderValue: { type: number }
 *                     series:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period: { type: string, example: "2026-11-06" }
 *                           revenue: { type: number }
 *                           orders: { type: integer }
 *                     topDishes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           dishId: { type: integer }
 *                           name: { type: string }
 *                           quantity: { type: integer }
 *                           revenue: { type: number }
 *       400: { description: VALIDATION_ERROR }
 *       403: { description: Không phải cửa hàng của bạn }
 */
router.get(
    "/:shopId/statistics/revenue",
    auth,
    authorize(ROLES.SELLER),
    validate(revenueQuerySchema, "query"),
    statisticController.shopRevenue
);

export default router;

// ---------------------------------------------------------------------
// /admin/statistics: thống kê hệ thống
// ---------------------------------------------------------------------
export const adminStatisticRoutes = Router();

/**
 * @swagger
 * /admin/statistics:
 *   get:
 *     tags: [Statistic]
 *     summary: Thống kê hệ thống (người dùng, cửa hàng, đơn, doanh thu, cửa hàng nổi bật)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: groupBy, in: query, schema: { type: string, enum: [day, week, month], default: day } }
 *       - $ref: '#/components/parameters/From'
 *       - $ref: '#/components/parameters/To'
 *     responses:
 *       200:
 *         description: "{ users, shops, orders, revenue, groupBy, range, rangeSummary, series, topShops }"
 *       403: { description: Không phải quản trị viên }
 */
adminStatisticRoutes.get(
    "/",
    auth,
    authorize(ROLES.ADMIN),
    validate(revenueQuerySchema, "query"),
    statisticController.system
);
