import { z } from "zod";
import { optionalText, phoneField, requiredText } from "../../common/utils/validationFields.js";

export const createShopSchema = z.object({
    name: requiredText("Tên cửa hàng", 150),
    address: requiredText("Địa chỉ", 255),
    phone: phoneField,
    description: optionalText("Mô tả", 2000),
    openingHours: optionalText("Giờ mở cửa", 50) // ví dụ: "07:00 - 21:00"
});
