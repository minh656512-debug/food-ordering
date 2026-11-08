import AppError from "../../common/utils/AppError.js";
import { assertContactAvailable } from "./profile.service.js";
import * as sellerMapper from "./seller.mapper.js";
import * as sellerRepository from "./seller.repository.js";
import * as shopRepository from "./shop.repository.js";

const findSellerOrFail = async (accountId) => {
    const seller = await sellerRepository.findByAccountId(accountId);
    if (!seller) {
        throw new AppError(404, "SELLER_NOT_FOUND", "Không tìm thấy hồ sơ người bán");
    }
    return seller;
};

export const getProfile = async (accountId) => {
    const seller = await findSellerOrFail(accountId);
    const shop = await shopRepository.findLatestBySellerId(seller.id);
    return sellerMapper.toSellerResponse(seller, shop);
};

export const updateProfile = async (accountId, data) => {
    const seller = await findSellerOrFail(accountId);
    await assertContactAvailable(sellerRepository, data, seller.id);

    const updated = await sellerRepository.update(seller.id, data);
    const shop = await shopRepository.findLatestBySellerId(seller.id);
    return sellerMapper.toSellerResponse(updated, shop);
};
