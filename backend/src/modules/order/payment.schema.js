import { z } from "zod";
import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";
import {
    assertDateRange,
    DATE_RANGE_MESSAGE,
    dateRangeShape,
    paginationShape
} from "./order.schema.js";
import { PAYMENT_METHOD } from "./order.rules.js";

// Thanh toán trực tuyến: VNPAY (sandbox) hoặc MOCK (mô phỏng, `simulate` quyết định thành công hay thất bại)
export const createPaymentSchema = z.object(
    {
        orderId: z.coerce
            .number({ error: "Mã đơn hàng là bắt buộc" })
            .int()
            .min(1, "Mã đơn hàng không hợp lệ"),
        method: z.enum([PAYMENT_METHOD.VNPAY, PAYMENT_METHOD.MOCK], {
            error: "Phương thức thanh toán trực tuyến phải là VNPAY hoặc MOCK"
        }),
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
