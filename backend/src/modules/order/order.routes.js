import { Router } from "express";
import auth from "../../common/middlewares/auth.js";
import authorize from "../../common/middlewares/authorize.js";
import validate from "../../common/middlewares/validate.js";
import { ROLES } from "../../common/constants/roles.js";
import * as orderController from "./order.controller.js";
import {
    adminOrdersQuerySchema,
    cancelOrderSchema,
    createOrderSchema,
    myOrdersQuerySchema,
    sellerHistoryQuerySchema,
    sellerOrdersQuerySchema
} from "./order.schema.js";

/**
 * @swagger
 * tags:
 *   - name: Order
 *     description: Đặt hàng, theo dõi, hủy, lịch sử đơn (khách hàng)
 *   - name: Seller Order
 *     description: Quản lý và xử lý đơn hàng (người bán)
 *   - name: Admin Monitor
 *     description: Giám sát đơn hàng và giao dịch (quản trị viên, chỉ xem)
 * components:
 *   schemas:
 *     PaymentInfo:
 *       type: object
 *       nullable: true
 *       properties:
 *         id: { type: integer }
 *         method: { type: string, enum: [VNPAY, COD, MOCK] }
 *         status: { type: string, enum: [UNPAID, PAID, FAILED, REFUNDED] }
 *         amount: { type: number, example: 85000 }
 *         transactionId: { type: string, nullable: true }
 *         paidAt: { type: string, format: date-time, nullable: true }
 *     RefundInfo:
 *       type: object
 *       nullable: true
 *       properties:
 *         id: { type: integer }
 *         amount: { type: number, example: 85000 }
 *         reason: { type: string }
 *         refundedAt: { type: string, format: date-time }
 *     OrderItem:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         dishId: { type: integer }
 *         dishName: { type: string }
 *         image: { type: string, nullable: true }
 *         quantity: { type: integer }
 *         price: { type: number, description: Đơn giá tại thời điểm đặt }
 *         subtotal: { type: number }
 *     Order:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 15 }
 *         status: { type: string, enum: [PENDING, CONFIRMED, PREPARING, DELIVERING, COMPLETED, CANCELLED, REJECTED] }
 *         totalAmount: { type: number, example: 85000 }
 *         receiverName: { type: string }
 *         receiverPhone: { type: string }
 *         deliveryAddress: { type: string }
 *         note: { type: string, nullable: true }
 *         reason: { type: string, nullable: true, description: Lý do hủy hoặc từ chối }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *         customer: { type: object, properties: { id: { type: integer }, fullName: { type: string } } }
 *         shop: { type: object, properties: { id: { type: integer }, name: { type: string }, address: { type: string }, phone: { type: string } } }
 *         items: { type: array, items: { $ref: '#/components/schemas/OrderItem' } }
 *         payment: { $ref: '#/components/schemas/PaymentInfo' }
 *         refund: { $ref: '#/components/schemas/RefundInfo' }
 *     OrderSummary:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         status: { type: string }
 *         totalAmount: { type: number }
 *         receiverName: { type: string }
 *         createdAt: { type: string, format: date-time }
 *         shop: { type: object, properties: { id: { type: integer }, name: { type: string } } }
 *         itemCount: { type: integer }
 *         itemNames: { type: array, items: { type: string } }
 *         paymentMethod: { type: string, nullable: true }
 *         paymentStatus: { type: string, nullable: true }
 *     OrderPage:
 *       type: object
 *       properties:
 *         items: { type: array, items: { $ref: '#/components/schemas/OrderSummary' } }
 *         pagination:
 *           type: object
 *           properties:
 *             page: { type: integer }
 *             limit: { type: integer }
 *             total: { type: integer }
 *             totalPages: { type: integer }
 *   parameters:
 *     OrderId: { name: id, in: path, required: true, schema: { type: integer } }
 *     Page: { name: page, in: query, schema: { type: integer, default: 1 } }
 *     Limit: { name: limit, in: query, schema: { type: integer, default: 10, maximum: 50 } }
 *     From: { name: from, in: query, schema: { type: string, format: date }, description: "Từ ngày (YYYY-MM-DD)" }
 *     To: { name: to, in: query, schema: { type: string, format: date }, description: "Đến hết ngày (YYYY-MM-DD)" }
 */

// ---------------------------------------------------------------------
// /orders: khách hàng (và xem chi tiết cho cả người bán, quản trị viên)
// ---------------------------------------------------------------------
const router = Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Order]
 *     summary: Đặt hàng từ giỏ hàng hiện tại
 *     description: |
 *       Lấy giỏ hàng của khách, tạo đơn PENDING kèm đơn giá tại thời điểm đặt, tạo bản ghi thanh toán UNPAID, rồi xóa giỏ.
 *       Với VNPAY/MOCK, sau đó gọi `POST /payments` để thanh toán. Với COD không cần thanh toán trước.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverName, receiverPhone, deliveryAddress, paymentMethod]
 *             properties:
 *               receiverName: { type: string, example: Nguyễn Văn An }
 *               receiverPhone: { type: string, example: "0901000001" }
 *               deliveryAddress: { type: string, example: "12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội" }
 *               note: { type: string, example: Ít cơm }
 *               paymentMethod: { type: string, enum: [VNPAY, COD, MOCK] }
 *     responses:
 *       201:
 *         description: Đặt hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Order' }
 *       400: { description: "VALIDATION_ERROR, CART_EMPTY, CART_MULTIPLE_SHOPS" }
 *       401: { description: Chưa đăng nhập }
 *       403: { description: Không phải khách hàng }
 *       409: { description: "SHOP_CLOSED, DISH_OUT_OF_STOCK, CART_CHANGED" }
 */
router.post(
    "/",
    auth,
    authorize(ROLES.CUSTOMER),
    validate(createOrderSchema),
    orderController.create
);

/**
 * @swagger
 * /orders/my:
 *   get:
 *     tags: [Order]
 *     summary: Lịch sử đơn hàng của tôi (mới nhất trước)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - { name: status, in: query, schema: { type: string, enum: [PENDING, CONFIRMED, PREPARING, DELIVERING, COMPLETED, CANCELLED, REJECTED] } }
 *     responses:
 *       200:
 *         description: Danh sách đơn có phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/OrderPage' }
 *       401: { description: Chưa đăng nhập }
 *       403: { description: Không phải khách hàng }
 */
router.get(
    "/my",
    auth,
    authorize(ROLES.CUSTOMER),
    validate(myOrdersQuerySchema, "query"),
    orderController.listMy
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Order]
 *     summary: Chi tiết và theo dõi đơn hàng
 *     description: Khách xem đơn của mình, người bán xem đơn của cửa hàng mình, quản trị viên xem mọi đơn. Đơn không thuộc quyền xem trả 404.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     responses:
 *       200:
 *         description: Chi tiết đơn (kèm món, thanh toán, hoàn tiền)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Order' }
 *       401: { description: Chưa đăng nhập }
 *       404: { description: ORDER_NOT_FOUND }
 */
router.get(
    "/:id",
    auth,
    authorize(ROLES.CUSTOMER, ROLES.SELLER, ROLES.ADMIN),
    orderController.getById
);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     tags: [Order]
 *     summary: Khách hủy đơn (chỉ khi đơn còn PENDING)
 *     description: Đơn đã thanh toán sẽ được hoàn tiền đủ số tiền (tạo Refund, thanh toán chuyển REFUNDED).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, example: Tôi đổi ý }
 *     responses:
 *       200:
 *         description: Đã hủy đơn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Order' }
 *       404: { description: ORDER_NOT_FOUND }
 *       409: { description: ORDER_NOT_CANCELLABLE }
 */
router.patch(
    "/:id/cancel",
    auth,
    authorize(ROLES.CUSTOMER),
    validate(cancelOrderSchema),
    orderController.cancel
);

// Người bán chuyển trạng thái theo thứ tự, không nhảy cóc (xem order.rules.js)
/**
 * @swagger
 * /orders/{id}/confirm:
 *   patch:
 *     tags: [Seller Order]
 *     summary: "Người bán xác nhận đơn: PENDING -> CONFIRMED"
 *     description: Đơn thanh toán online phải đã PAID mới xác nhận được; đơn COD xác nhận thẳng.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     responses:
 *       200: { description: Đã xác nhận (trả Order) }
 *       404: { description: ORDER_NOT_FOUND }
 *       409: { description: "INVALID_ORDER_STATUS hoặc ORDER_NOT_PAID" }
 * /orders/{id}/prepare:
 *   patch:
 *     tags: [Seller Order]
 *     summary: "Người bán chuẩn bị món: CONFIRMED -> PREPARING"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     responses:
 *       200: { description: Đã chuyển sang PREPARING (trả Order) }
 *       404: { description: ORDER_NOT_FOUND }
 *       409: { description: INVALID_ORDER_STATUS }
 * /orders/{id}/deliver:
 *   patch:
 *     tags: [Seller Order]
 *     summary: "Người bán giao hàng: PREPARING -> DELIVERING"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     responses:
 *       200: { description: Đã chuyển sang DELIVERING (trả Order) }
 *       404: { description: ORDER_NOT_FOUND }
 *       409: { description: INVALID_ORDER_STATUS }
 * /orders/{id}/complete:
 *   patch:
 *     tags: [Seller Order]
 *     summary: "Người bán hoàn tất đơn: DELIVERING -> COMPLETED"
 *     description: Đơn COD được ghi nhận đã thu tiền. Khách được cộng 1 điểm tích lũy cho mỗi 10.000 đồng (một lần cho mỗi đơn).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     responses:
 *       200: { description: Đã hoàn tất (trả Order) }
 *       404: { description: ORDER_NOT_FOUND }
 *       409: { description: INVALID_ORDER_STATUS }
 */
router.patch("/:id/confirm", auth, authorize(ROLES.SELLER), orderController.confirm);
router.patch("/:id/prepare", auth, authorize(ROLES.SELLER), orderController.prepare);
router.patch("/:id/deliver", auth, authorize(ROLES.SELLER), orderController.deliver);
router.patch("/:id/complete", auth, authorize(ROLES.SELLER), orderController.complete);

export default router;

// ---------------------------------------------------------------------
// /seller/orders: danh sách đơn của cửa hàng (routes.js đã chặn chỉ SELLER cho /seller/**)
// ---------------------------------------------------------------------
export const sellerOrderRoutes = Router();

/**
 * @swagger
 * /seller/orders:
 *   get:
 *     tags: [Seller Order]
 *     summary: Đơn đang xử lý của cửa hàng (PENDING đến DELIVERING, cũ nhất trước)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - { name: status, in: query, schema: { type: string, enum: [PENDING, CONFIRMED, PREPARING, DELIVERING] } }
 *     responses:
 *       200:
 *         description: Danh sách đơn có phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/OrderPage' }
 *       403: { description: "Không phải người bán hoặc SHOP_NOT_APPROVED" }
 *       404: { description: SHOP_NOT_FOUND }
 */
sellerOrderRoutes.get(
    "/",
    auth,
    authorize(ROLES.SELLER),
    validate(sellerOrdersQuerySchema, "query"),
    orderController.listSeller
);

/**
 * @swagger
 * /seller/orders/history:
 *   get:
 *     tags: [Seller Order]
 *     summary: Lịch sử đơn đã kết thúc (COMPLETED, CANCELLED, REJECTED), lọc theo trạng thái và ngày
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/From'
 *       - $ref: '#/components/parameters/To'
 *       - { name: status, in: query, schema: { type: string, enum: [COMPLETED, CANCELLED, REJECTED] } }
 *     responses:
 *       200:
 *         description: Danh sách đơn có phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/OrderPage' }
 *       403: { description: "Không phải người bán hoặc SHOP_NOT_APPROVED" }
 *       404: { description: SHOP_NOT_FOUND }
 */
sellerOrderRoutes.get(
    "/history",
    auth,
    authorize(ROLES.SELLER),
    validate(sellerHistoryQuerySchema, "query"),
    orderController.listSellerHistory
);

// ---------------------------------------------------------------------
// /admin/orders: giám sát đơn hàng (chỉ xem)
// ---------------------------------------------------------------------
export const adminOrderRoutes = Router();

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     tags: [Admin Monitor]
 *     summary: Giám sát đơn hàng toàn hệ thống (lọc theo ngày, trạng thái, cửa hàng, phân trang)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/From'
 *       - $ref: '#/components/parameters/To'
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: shopId, in: query, schema: { type: integer } }
 *       - { name: customerId, in: query, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Danh sách đơn có phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/OrderPage' }
 *       403: { description: Không phải quản trị viên }
 */
adminOrderRoutes.get(
    "/",
    auth,
    authorize(ROLES.ADMIN),
    validate(adminOrdersQuerySchema, "query"),
    orderController.listAll
);
