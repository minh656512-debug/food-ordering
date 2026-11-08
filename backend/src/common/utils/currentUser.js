import * as customerRepository from "../../modules/account/customer.repository.js";
import * as sellerRepository from "../../modules/account/seller.repository.js";
import AppError from "./AppError.js";

// Nguồn danh tính của người đang đăng nhập cho BE2, BE3 (không tự giải mã token).
// Điều kiện: route đã đi qua middleware `auth` (để có req.user).
// LƯU Ý: các hàm này async, phải dùng `await`.
//
//   const customerId = await getCurrentCustomerId(req);
//   const cart = await cartRepository.findByCustomerId(customerId);

export const getCurrentCustomerId = async (req) => {
    const customer = await customerRepository.findIdByAccountId(req.user.accountId);
    if (!customer) {
        throw new AppError(403, "CUSTOMER_NOT_FOUND", "Tài khoản này không phải khách hàng");
    }
    return customer.id;
};

export const getCurrentSellerId = async (req) => {
    const seller = await sellerRepository.findIdByAccountId(req.user.accountId);
    if (!seller) {
        throw new AppError(403, "SELLER_NOT_FOUND", "Tài khoản này không phải người bán");
    }
    return seller.id;
};
