// Kiểm thử API công khai của món ăn và cửa hàng (BE2) bằng repository giả, không cần MySQL.
import assert from "node:assert/strict";
import { mock, test } from "node:test";

process.env.DATABASE_URL ??= "mysql://u:p@localhost:3306/x";
process.env.JWT_SECRET ??= "test";

// Chặn việc nạp Prisma thật (chưa cần chạy prisma generate)
mock.module("../src/config/prisma.js", { defaultExport: {} });

let lastDishArgs;
mock.module("../src/modules/menu/dish.repository.js", {
    namedExports: {
        searchPublic: async (filters, skip, take) => {
            lastDishArgs = { filters, skip, take };
            return {
                rows: [{ id: 1, name: "Cơm tấm", description: null, price: "45000", image: null, status: "AVAILABLE",
                    category: { id: 1, name: "Cơm" }, shop: { id: 2, name: "Quán A", address: "x", openingHours: null } }],
                total: 25
            };
        },
        findPublicById: async (id) => (id === 1 ? { id: 1, name: "Cơm tấm", price: "45000", status: "AVAILABLE", category: null, shop: null } : null),
        getDishById: async () => null,
        findAll: async () => [], create: async () => ({}), update: async () => ({}), remove: async () => ({})
    }
});
mock.module("../src/modules/account/shop.repository.js", {
    namedExports: {
        searchOpen: async () => ({
            rows: [{ id: 2, name: "Quán A", address: "a", phone: "p", description: null, openingHours: null, status: "OPEN", sellerId: 9, rejectReason: "x" }],
            total: 1
        }),
        findOpenById: async (id) => (id === 2 ? { id: 2, name: "Quán A", address: "a", phone: "p", status: "OPEN", sellerId: 9 } : null),
        create: async () => ({}), findById: async () => null, findLatestBySellerId: async () => null
    }
});

const dishService = await import("../src/modules/menu/dish.service.js");
const shopService = await import("../src/modules/account/shop.service.js");
const { searchDishQuerySchema, searchShopQuerySchema } = await import("../src/modules/menu/dish.schema.js");

test("query món ăn: mặc định page=1, limit=10, bỏ qua giá trị rỗng", () => {
    const q = searchDishQuerySchema.parse({ keyword: "", categoryId: "" });
    assert.equal(q.page, 1);
    assert.equal(q.limit, 10);
    assert.equal(q.keyword, undefined);
    assert.equal(q.categoryId, undefined);
});

test("query món ăn: ép kiểu số và từ chối giá trị sai", () => {
    const q = searchDishQuerySchema.parse({ categoryId: "3", page: "2", limit: "5" });
    assert.deepEqual([q.categoryId, q.page, q.limit], [3, 2, 5]);
    assert.equal(searchDishQuerySchema.safeParse({ page: "0" }).success, false);
    assert.equal(searchDishQuerySchema.safeParse({ limit: "999" }).success, false);
    assert.equal(searchDishQuerySchema.safeParse({ categoryId: "abc" }).success, false);
    assert.equal(searchShopQuerySchema.safeParse({ page: "-1" }).success, false);
});

test("tìm món: tính skip theo trang, giá trả về là số, có phân trang", async () => {
    const res = await dishService.searchDishes({ keyword: "cơm", categoryId: 1, page: 3, limit: 10 });
    assert.equal(lastDishArgs.skip, 20);
    assert.equal(lastDishArgs.take, 10);
    assert.equal(lastDishArgs.filters.keyword, "cơm");
    assert.equal(res.items[0].price, 45000);
    assert.deepEqual(res.pagination, { page: 3, limit: 10, total: 25, totalPages: 3 });
});

test("chi tiết món: không có thì 404 DISH_NOT_FOUND", async () => {
    assert.equal((await dishService.getDishDetail(1)).id, 1);
    await assert.rejects(() => dishService.getDishDetail(99), (e) => e.status === 404 && e.errorCode === "DISH_NOT_FOUND");
});

test("cửa hàng công khai: không lộ sellerId / lý do từ chối; không thấy thì 404", async () => {
    const list = await shopService.searchShops({ page: 1, limit: 10 });
    assert.equal(list.items[0].name, "Quán A");
    assert.equal("sellerId" in list.items[0], false);
    assert.equal("rejectReason" in list.items[0], false);
    assert.equal((await shopService.getShopDetail(2)).id, 2);
    await assert.rejects(() => shopService.getShopDetail(99), (e) => e.status === 404 && e.errorCode === "SHOP_NOT_FOUND");
});
