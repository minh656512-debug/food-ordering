import { z } from "zod";
import { paginationShape, parseId } from "../order/order.schema.js";

export { parseId };

// Query của GET /dishes: tìm theo từ khóa, lọc danh mục / cửa hàng, phân trang.
// Giá trị rỗng (?keyword=) được coi như không lọc.
const emptyToUndefined = (value) => (value === "" ? undefined : value);

export const searchDishQuerySchema = z.object({
    keyword: z.preprocess(emptyToUndefined, z.string().trim().max(100, "Từ khóa tối đa 100 ký tự").optional()),
    categoryId: z.preprocess(
        emptyToUndefined,
        z.coerce.number({ error: "Mã danh mục không hợp lệ" }).int().min(1, "Mã danh mục không hợp lệ").optional()
    ),
    shopId: z.preprocess(
        emptyToUndefined,
        z.coerce.number({ error: "Mã cửa hàng không hợp lệ" }).int().min(1, "Mã cửa hàng không hợp lệ").optional()
    ),
    ...paginationShape
});

// Query của GET /shops
export const searchShopQuerySchema = z.object({
    keyword: z.preprocess(emptyToUndefined, z.string().trim().max(100, "Từ khóa tối đa 100 ký tự").optional()),
    ...paginationShape
});
