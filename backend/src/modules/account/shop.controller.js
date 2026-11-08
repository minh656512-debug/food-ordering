import { ok } from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";
import * as shopService from "./shop.service.js";

export const register = asyncHandler(async (req, res) => {
    const data = await shopService.registerShop(req.user.accountId, req.body);
    res.status(201).json(ok(data, "Đăng ký cửa hàng thành công, vui lòng chờ quản trị viên duyệt"));
});
