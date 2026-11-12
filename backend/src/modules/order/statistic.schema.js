import { z } from "zod";
import { assertDateRange, DATE_RANGE_MESSAGE, dateRangeShape } from "./order.schema.js";

// groupBy: nhóm theo ngày, tuần hoặc tháng. Bỏ trống from thì lấy một khoảng mặc định theo groupBy.
export const revenueQuerySchema = z
    .object({
        groupBy: z
            .enum(["day", "week", "month"], { error: "groupBy phải là day, week hoặc month" })
            .default("day"),
        ...dateRangeShape
    })
    .refine(assertDateRange, { message: DATE_RANGE_MESSAGE, path: ["from"] });
