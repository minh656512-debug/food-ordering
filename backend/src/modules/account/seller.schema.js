import { z } from "zod";
import { emailField, phoneField, requiredText } from "../../common/utils/validationFields.js";

export const updateSellerSchema = z.object({
    fullName: requiredText("Họ tên", 100),
    email: emailField,
    phone: phoneField
});
