import { z } from "zod";
import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";
import {
    assertDateRange,
    DATE_RANGE_MESSAGE,
    dateRangeShape,
    paginationShape
} from "./order.schema.js";
import { PAYMENT_METHOD } from "./order.rules.js";

// Thanh toán trực tuyến: MOMO, SEPAY, VIETQR, VNPAY hoặc MOCK
export const createPaymentSchema = z.object(
    {
        orderId: z.coerce
            .number({ error: "Mã đơn hàng là bắt buộc" })
            .int()
            .min(1, "Mã đơn hàng không hợp lệ"),
        method: z.enum(
            [
                PAYMENT_METHOD.MOMO,
                PAYMENT_METHOD.SEPAY,
                PAYMENT_METHOD.VIETQR,
                PAYMENT_METHOD.VNPAY,
                PAYMENT_METHOD.MOCK
            ],
            {
                error: "Phương thức thanh toán trực tuyến phải là MOMO, SEPAY, VIETQR, VNPAY hoặc MOCK"
            }
        ),
        simulate: z.enum(["SUCCESS", "FAILED"]).default("SUCCESS")
    },
    { error: "Dữ liệu thanh toán không hợp lệ" }
);

export const transactionsQuerySchema = z
    .object({
        ...paginationShape,
        ...dateRangeShape,
        status: z.enum(Object.values(PAYMENT_STATUS)).optional(),
        method: z.enum(Object.values(PAYMENT_METHOD)).optional(),
        shopId: z.coerce.number().int().min(1).optional()
    })
    .refine(assertDateRange, { message: DATE_RANGE_MESSAGE, path: ["from"] });

// Admin xác nhận đã nhận tiền mặt (COD). receivedAmount là số tiền Admin đã đếm, có thể bỏ trống;
// nếu có thì phải đúng bằng số tiền của đơn.
export const confirmCodSchema = z
    .object({
        receivedAmount: z.coerce
            .number({ error: "Số tiền đã nhận phải là số" })
            .int("Số tiền đã nhận phải là số nguyên")
            .min(0, "Số tiền đã nhận không hợp lệ")
            .optional()
    })
    .default({});

// GET /payments/:paymentId/status?refresh=true để hỏi lại MoMo trước khi trả kết quả
export const paymentStatusQuerySchema = z.object({
    refresh: z.enum(["true", "false"]).default("false")
});
