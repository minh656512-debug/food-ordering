import { SHOP_STATUS } from "../../common/constants/shopStatus.js";
import AppError from "../../common/utils/AppError.js";
import * as sellerRepository from "./seller.repository.js";
import * as shopMapper from "./shop.mapper.js";
import { toPublicShop } from "./shop.public.mapper.js";
import { toPage } from "../order/order.mapper.js";
import * as shopRepository from "./shop.repository.js";

// Người bán gửi đăng ký cửa hàng. Cửa hàng mới luôn ở trạng thái chờ duyệt,
// nên chưa đăng món được cho tới khi quản trị viên duyệt.
export const registerShop = async (accountId, data) => {
    const seller = await sellerRepository.findByAccountId(accountId);
    if (!seller) {
        throw new AppError(404, "SELLER_NOT_FOUND", "Không tìm thấy hồ sơ người bán");
    }

    // Mỗi người bán một cửa hàng; chỉ được đăng ký lại khi lần trước bị từ chối
    const current = await shopRepository.findLatestBySellerId(seller.id);
    if (current && current.status !== SHOP_STATUS.REJECTED) {
        throw new AppError(409, "SHOP_ALREADY_EXISTS", "Bạn đã đăng ký cửa hàng rồi");
    }

    const shop = await shopRepository.create({
        ...data,
        sellerId: seller.id,
        status: SHOP_STATUS.PENDING_APPROVAL
    });
    return shopMapper.toShopResponse(shop);
};


export const searchShops = async ({ keyword, page, limit }) => {
    const { rows, total } = await shopRepository.searchOpen({ keyword }, (page - 1) * limit, limit);
    return toPage(rows, total, page, limit, toPublicShop);
};

export const getShopDetail = async (id) => {
    const shop = await shopRepository.findOpenById(id);
    if (!shop) {
        throw new AppError(404, "SHOP_NOT_FOUND", "Không tìm thấy cửa hàng");
    }
    return toPublicShop(shop);
};
