import { SHOP_STATUS } from "../../common/constants/shopStatus.js";
import AppError from "../../common/utils/AppError.js";
import * as shopRepository from "../account/shop.repository.js";

// Kiểm tra quyền sở hữu đơn hàng, dùng chung cho order.service và refund.service.

export const orderNotFound = () => new AppError(404, "ORDER_NOT_FOUND", "Không tìm thấy đơn hàng");

// Cửa hàng hiện tại của người bán. Chưa được duyệt thì chưa có đơn để xử lý.
export const getSellerShop = async (sellerId) => {
    const shop = await shopRepository.findLatestBySellerId(sellerId);
    if (!shop) {
        throw new AppError(404, "SHOP_NOT_FOUND", "Bạn chưa đăng ký cửa hàng");
    }
    if (shop.status === SHOP_STATUS.PENDING_APPROVAL || shop.status === SHOP_STATUS.REJECTED) {
        throw new AppError(403, "SHOP_NOT_APPROVED", "Cửa hàng của bạn chưa được duyệt");
    }
    return shop;
};

// Đơn của cửa hàng khác trả 404 như không tồn tại, để không lộ đơn của người khác.
export const assertSellerOwnsOrder = async (sellerId, order) => {
    if (!order) throw orderNotFound();
    const shop = await getSellerShop(sellerId);
    if (order.shopId !== shop.id) throw orderNotFound();
    return shop;
};

export const assertCustomerOwnsOrder = (customerId, order) => {
    if (!order || order.customerId !== customerId) throw orderNotFound();
};
