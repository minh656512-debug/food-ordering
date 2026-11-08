import { z } from "zod";
import { ROLES } from "../../common/constants/roles.js";
import {
    emailField,
    optionalText,
    passwordField,
    phoneField,
    requiredText,
    usernameField
} from "../../common/utils/validationFields.js";

// Chỉ cho đăng ký khách hàng hoặc người bán; tài khoản ADMIN do hệ thống tạo sẵn.
export const registerSchema = z.object({
    username: usernameField,
    password: passwordField,
    role: z.enum([ROLES.CUSTOMER, ROLES.SELLER], {
        error: "Vai trò phải là CUSTOMER hoặc SELLER"
    }),
    fullName: requiredText("Họ tên", 100),
    email: emailField,
    phone: phoneField,
    address: optionalText("Địa chỉ", 255) // chỉ khách hàng dùng, người bán bỏ qua
});

export const loginSchema = z.object({
    username: requiredText("Tên đăng nhập", 50),
    password: z.string({ error: "Mật khẩu là bắt buộc" }).min(1, "Mật khẩu không được để trống")
});

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string({ error: "Mật khẩu hiện tại là bắt buộc" })
            .min(1, "Mật khẩu hiện tại không được để trống"),
        newPassword: passwordField
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        path: ["newPassword"],
        message: "Mật khẩu mới phải khác mật khẩu hiện tại"
    });
