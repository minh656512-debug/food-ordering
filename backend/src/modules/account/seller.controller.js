import { ok } from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";
import * as sellerService from "./seller.service.js";

export const getMe = asyncHandler(async (req, res) => {
    const data = await sellerService.getProfile(req.user.accountId);
    res.json(ok(data));
});

export const updateMe = asyncHandler(async (req, res) => {
    const data = await sellerService.updateProfile(req.user.accountId, req.body);
    res.json(ok(data, "Cập nhật thông tin thành công"));
});
