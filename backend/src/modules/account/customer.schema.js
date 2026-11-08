import { z } from "zod";
import {
    emailField,
    optionalText,
    phoneField,
    requiredText
} from "../../common/utils/validationFields.js";

// PUT = gửi đủ thông tin hồ sơ; địa chỉ bỏ trống nghĩa là xóa địa chỉ.
export const updateCustomerSchema = z.object({
    fullName: requiredText("Họ tên", 100),
    email: emailField,
    phone: phoneField,
    address: optionalText("Địa chỉ", 255)
});
