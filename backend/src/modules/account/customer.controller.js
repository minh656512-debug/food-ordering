import { ok } from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";
import * as customerService from "./customer.service.js";

export const getMe = asyncHandler(async (req, res) => {
    const data = await customerService.getProfile(req.user.accountId);
    res.json(ok(data));
});

export const updateMe = asyncHandler(async (req, res) => {
    const data = await customerService.updateProfile(req.user.accountId, req.body);
    res.json(ok(data, "Cập nhật thông tin thành công"));
});
