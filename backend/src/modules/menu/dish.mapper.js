// Chuyển bản ghi Prisma sang dữ liệu trả về cho client (giá là số, không phải chuỗi Decimal).
export const toDishResponse = (dish) => ({
    id: dish.id,
    name: dish.name,
    description: dish.description,
    price: Number(dish.price),
    image: dish.image,
    status: dish.status,
    category: dish.category ? { id: dish.category.id, name: dish.category.name } : null,
    shop: dish.shop
        ? { id: dish.shop.id, name: dish.shop.name, address: dish.shop.address, openingHours: dish.shop.openingHours }
        : null
});
