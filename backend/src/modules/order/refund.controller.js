import { ok } from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";
import { getCurrentSellerId } from "../../common/utils/currentUser.js";
import { parseId } from "./order.schema.js";
import * as refundService from "./refund.service.js";

export const reject = asyncHandler(async (req, res) => {
    const sellerId = await getCurrentSellerId(req);
    const data = await refundService.rejectOrder(
        sellerId,
        parseId(req.params.id, "Mã đơn hàng"),
        req.body.reason
    );
    res.json(ok(data, "Đã từ chối đơn hàng"));
});
