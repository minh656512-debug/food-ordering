import { ROLES } from "../../common/constants/roles.js";
import { ok } from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";
import { getCurrentCustomerId, getCurrentSellerId } from "../../common/utils/currentUser.js";
import { parseId } from "./order.schema.js";
import * as orderService from "./order.service.js";

// Xác định người đang xem đơn theo vai trò
const getViewer = async (req) => {
    const { role } = req.user;
    if (role === ROLES.CUSTOMER) return { role, customerId: await getCurrentCustomerId(req) };
    if (role === ROLES.SELLER) return { role, sellerId: await getCurrentSellerId(req) };
    return { role };
};

// ---- Khách hàng ----

export const create = asyncHandler(async (req, res) => {
    const customerId = await getCurrentCustomerId(req);
    const data = await orderService.createOrder(customerId, req.body);
    res.status(201).json(ok(data, "Đặt hàng thành công"));
});

export const listMy = asyncHandler(async (req, res) => {
    const customerId = await getCurrentCustomerId(req);
    res.json(ok(await orderService.listMyOrders(customerId, req.query)));
});

export const getById = asyncHandler(async (req, res) => {
    const viewer = await getViewer(req);
    res.json(ok(await orderService.getOrderDetail(viewer, parseId(req.params.id, "Mã đơn hàng"))));
});

export const cancel = asyncHandler(async (req, res) => {
    const customerId = await getCurrentCustomerId(req);
    const data = await orderService.cancelOrder(
        customerId,
        parseId(req.params.id, "Mã đơn hàng"),
        req.body.reason
    );
    res.json(ok(data, "Đã hủy đơn hàng"));
});

// ---- Người bán ----

export const listSeller = asyncHandler(async (req, res) => {
    const sellerId = await getCurrentSellerId(req);
    res.json(ok(await orderService.listSellerOrders(sellerId, req.query)));
});

export const listSellerHistory = asyncHandler(async (req, res) => {
    const sellerId = await getCurrentSellerId(req);
    res.json(ok(await orderService.listSellerHistory(sellerId, req.query)));
});

// Tạo controller chuyển trạng thái cho từng bước: confirm, prepare, deliver, complete
const transition = (action, message) =>
    asyncHandler(async (req, res) => {
        const sellerId = await getCurrentSellerId(req);
        const data = await orderService.changeOrderStatus(
            sellerId,
            parseId(req.params.id, "Mã đơn hàng"),
            action
        );
        res.json(ok(data, message));
    });

export const confirm = transition("confirm", "Đã xác nhận đơn hàng");
export const prepare = transition("prepare", "Đơn hàng đang được chuẩn bị");
export const deliver = transition("deliver", "Đơn hàng đang được giao");
export const complete = transition("complete", "Đơn hàng đã hoàn tất");

// ---- Quản trị viên ----

export const listAll = asyncHandler(async (req, res) => {
    res.json(ok(await orderService.listAllOrders(req.query)));
});
