// Cửa hàng hiển thị công khai: không lộ sellerId, lý do từ chối...
export const toPublicShop = (shop) => ({
    id: shop.id,
    name: shop.name,
    address: shop.address,
    phone: shop.phone,
    description: shop.description,
    openingHours: shop.openingHours,
    status: shop.status
});
