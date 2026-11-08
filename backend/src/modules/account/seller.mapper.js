import { toShopSummary } from "./shop.mapper.js";

// Hồ sơ người bán kèm cửa hàng gần nhất (null nếu chưa đăng ký),
// để frontend biết hiện form đăng ký hay trạng thái chờ duyệt.
export const toSellerResponse = (seller, shop) => ({
    id: seller.id,
    username: seller.account.username,
    accountStatus: seller.account.status,
    fullName: seller.fullName,
    email: seller.email,
    phone: seller.phone,
    shop: shop ? toShopSummary(shop) : null
});
