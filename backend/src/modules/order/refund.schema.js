import { z } from "zod";
import { requiredText } from "../../common/utils/validationFields.js";

// Người bán từ chối đơn: bắt buộc nhập lý do
export const rejectOrderSchema = z.object(
    { reason: requiredText("Lý do từ chối", 255) },
    { error: "Vui lòng nhập lý do từ chối" }
);
