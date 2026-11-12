import { z } from "zod";
import AppError from "../../common/utils/AppError.js";
import { optionalText, phoneField, requiredText } from "../../common/utils/validationFields.js";
import { ORDER_STATUS } from "../../common/constants/orderStatus.js";
import { ACTIVE_STATUSES, HISTORY_STATUSES, PAYMENT_METHOD } from "./order.rules.js";

// Đọc mã (id) trên URL: phải là số nguyên dương, sai thì trả 400.
export const parseId = (value, label = "Mã") => {
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) {
        throw new AppError(400, "VALIDATION_ERROR", `${label} không hợp lệ`);
    }
    return id;
};

// ---- Các trường dùng chung cho query string (dùng lại ở payment, statistic) ----

export const paginationShape = {
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10)
};

const dateField = z.iso.date("Ngày phải có dạng YYYY-MM-DD").optional();

export const dateRangeShape = { from: dateField, to: dateField };

// Dùng cho schema có from/to: bắt buộc from <= to
export const assertDateRange = (query) => !query.from || !query.to || query.from <= query.to;
export const DATE_RANGE_MESSAGE = "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc";

const orderStatusEnum = (values) =>
    z.enum(values, { error: `Trạng thái phải là một trong: ${values.join(", ")}` });

// ---- Body ----

export const createOrderSchema = z.object(
    {
        receiverName: requiredText("Tên người nhận", 100),
        receiverPhone: phoneField,
        deliveryAddress: requiredText("Địa chỉ giao hàng", 255),
        note: optionalText("Ghi chú", 500),
        paymentMethod: z.enum(Object.values(PAYMENT_METHOD), {
            error: `Phương thức thanh toán phải là một trong: ${Object.values(PAYMENT_METHOD).join(", ")}`
        })
    },
    { error: "Dữ liệu đặt hàng không hợp lệ" }
);

// Body có thể bỏ trống
export const cancelOrderSchema = z.object({ reason: optionalText("Lý do hủy", 255) }).default({});

// ---- Query string ----

export const myOrdersQuerySchema = z.object({
    ...paginationShape,
    status: orderStatusEnum(Object.values(ORDER_STATUS)).optional()
});

export const sellerOrdersQuerySchema = z.object({
    ...paginationShape,
    status: orderStatusEnum(ACTIVE_STATUSES).optional()
});

export const sellerHistoryQuerySchema = z
    .object({
        ...paginationShape,
        ...dateRangeShape,
        status: orderStatusEnum(HISTORY_STATUSES).optional()
    })
    .refine(assertDateRange, { message: DATE_RANGE_MESSAGE, path: ["from"] });

export const adminOrdersQuerySchema = z
    .object({
        ...paginationShape,
        ...dateRangeShape,
        status: orderStatusEnum(Object.values(ORDER_STATUS)).optional(),
        shopId: z.coerce.number().int().min(1).optional(),
        customerId: z.coerce.number().int().min(1).optional()
    })
    .refine(assertDateRange, { message: DATE_RANGE_MESSAGE, path: ["from"] });
