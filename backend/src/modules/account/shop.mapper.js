// Chi tiết cửa hàng
export const toShopResponse = (shop) => ({
    id: shop.id,
    name: shop.name,
    address: shop.address,
    phone: shop.phone,
    description: shop.description,
    openingHours: shop.openingHours,
    status: shop.status,
    rejectReason: shop.rejectReason,
    sellerId: shop.sellerId,
    createdAt: shop.createdAt.toISOString()
});

// Bản gọn, nhúng trong hồ sơ người bán
export const toShopSummary = (shop) => ({
    id: shop.id,
    name: shop.name,
    status: shop.status,
    rejectReason: shop.rejectReason
});
