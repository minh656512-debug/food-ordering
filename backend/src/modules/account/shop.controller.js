import { ok } from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";
import { parseId } from "../menu/dish.schema.js";
import * as shopService from "./shop.service.js";

export const register = asyncHandler(async (req, res) => {
    const data = await shopService.registerShop(req.user.accountId, req.body);
    res.status(201).json(ok(data, "Đăng ký cửa hàng thành công, vui lòng chờ quản trị viên duyệt"));
});


export const getAll = asyncHandler(async (req, res) => {
    res.json(ok(await shopService.searchShops(req.query)));
});

export const getById = asyncHandler(async (req, res) => {
    res.json(ok(await shopService.getShopDetail(parseId(req.params.id, "Mã cửa hàng"))));
});
