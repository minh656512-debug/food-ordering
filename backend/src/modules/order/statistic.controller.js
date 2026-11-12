import { ok } from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";
import { getCurrentSellerId } from "../../common/utils/currentUser.js";
import { parseId } from "./order.schema.js";
import * as statisticService from "./statistic.service.js";

export const shopRevenue = asyncHandler(async (req, res) => {
    const sellerId = await getCurrentSellerId(req);
    const data = await statisticService.getShopRevenue(
        sellerId,
        parseId(req.params.shopId, "Mã cửa hàng"),
        req.query
    );
    res.json(ok(data));
});

export const system = asyncHandler(async (req, res) => {
    res.json(ok(await statisticService.getSystemStatistics(req.query)));
});
