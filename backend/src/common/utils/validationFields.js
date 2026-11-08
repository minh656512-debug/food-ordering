import { z } from "zod";

// Các trường Zod dùng lại ở nhiều schema (đăng ký, hồ sơ, cửa hàng, đặt hàng...).
// Mỗi trường tự làm sạch dữ liệu (trim, viết thường email) và có thông báo lỗi tiếng Việt.

// Chuỗi bắt buộc, độ dài 1..max
export const requiredText = (label, max) =>
    z
        .string({ error: `${label} là bắt buộc` })
        .trim()
        .min(1, `${label} không được để trống`)
        .max(max, `${label} tối đa ${max} ký tự`);

// Chuỗi tùy chọn: bỏ trống hoặc chuỗi rỗng đều thành null
export const optionalText = (label, max) =>
    z
        .string()
        .trim()
        .max(max, `${label} tối đa ${max} ký tự`)
        .nullish()
        .transform((value) => value || null);

export const usernameField = z
    .string({ error: "Tên đăng nhập là bắt buộc" })
    .trim()
    .min(3, "Tên đăng nhập từ 3 đến 50 ký tự")
    .max(50, "Tên đăng nhập từ 3 đến 50 ký tự")
    .regex(/^[a-zA-Z0-9_.]+$/, "Tên đăng nhập chỉ gồm chữ, số, dấu gạch dưới và dấu chấm");

// bcrypt chỉ xét 72 byte đầu của mật khẩu nên giới hạn tối đa 72 ký tự
export const passwordField = z
    .string({ error: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .max(72, "Mật khẩu tối đa 72 ký tự");

export const emailField = z
    .string({ error: "Email là bắt buộc" })
    .trim()
    .toLowerCase()
    .max(255, "Email tối đa 255 ký tự")
    .pipe(z.email("Email không hợp lệ"));

// Số điện thoại Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx
export const phoneField = z
    .string({ error: "Số điện thoại là bắt buộc" })
    .trim()
    .regex(/^(0|\+84)\d{8,10}$/, "Số điện thoại không hợp lệ");
