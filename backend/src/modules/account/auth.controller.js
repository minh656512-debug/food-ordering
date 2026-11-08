import { ok } from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
    const data = await authService.register(req.body);
    res.status(201).json(ok(data, "Đăng ký thành công"));
});

export const login = asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);
    res.json(ok(data, "Đăng nhập thành công"));
});

// JWT không lưu trạng thái trên server nên đăng xuất thực chất do frontend xóa token.
// Endpoint này chỉ để frontend có một chỗ gọi thống nhất (và chỗ mở rộng danh sách thu hồi sau này).
export const logout = (req, res) => {
    res.json(ok(null, "Đăng xuất thành công"));
};

export const changePassword = asyncHandler(async (req, res) => {
    await authService.changePassword(req.user.accountId, req.body);
    res.json(ok(null, "Đổi mật khẩu thành công"));
});
