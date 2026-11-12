// Kiểm thử đường đi của API order/payment/statistic: phân quyền, validate, định dạng lỗi, Swagger.
// Dùng Prisma giả nên không cần MySQL. Chạy: npm test
import assert from "node:assert/strict";
import { after, before, mock, test } from "node:test";

process.env.DATABASE_URL ??= "mysql://u:p@localhost:3306/x";
process.env.JWT_SECRET = "test-secret";

mock.module("@prisma/client", {
    namedExports: {
        PrismaClient: class {
            customer = { findUnique: async () => ({ id: 1 }) };
            seller = { findUnique: async () => ({ id: 5 }) };
            $connect = async () => {};
        }
    }
});

const { default: app } = await import("../src/app.js");
const { signToken } = await import("../src/common/utils/jwt.js");
const { swaggerSpec } = await import("../src/config/swagger.js");

let server;
let base;
before(async () => {
    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(() => server.close());

const token = (role) => signToken({ accountId: 1, role });
const call = async (method, path, { as, body } = {}) => {
    const res = await fetch(base + path, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(as && { Authorization: `Bearer ${token(as)}` })
        },
        ...(body && { body: JSON.stringify(body) })
    });
    return { status: res.status, json: await res.json() };
};

const validOrder = {
    receiverName: "An",
    receiverPhone: "0901000001",
    deliveryAddress: "HN",
    paymentMethod: "COD"
};

test("chưa đăng nhập: các API cần quyền trả 401", async () => {
    for (const [method, path] of [
        ["POST", "/orders"],
        ["GET", "/orders/my"],
        ["GET", "/orders/1"],
        ["PATCH", "/orders/1/cancel"],
        ["PATCH", "/orders/1/confirm"],
        ["PATCH", "/orders/1/reject"],
        ["GET", "/seller/orders"],
        ["GET", "/seller/orders/history"],
        ["POST", "/payments"],
        ["GET", "/shops/1/statistics/revenue"],
        ["GET", "/admin/orders"],
        ["GET", "/admin/transactions"],
        ["GET", "/admin/statistics"]
    ]) {
        const { status, json } = await call(method, path);
        assert.equal(status, 401, `${method} ${path}`);
        assert.equal(json.success, false);
    }
});

test("sai vai trò: trả 403", async () => {
    const cases = [
        ["SELLER", "POST", "/orders", validOrder],
        ["SELLER", "GET", "/orders/my"],
        ["SELLER", "POST", "/payments", { orderId: 1, method: "MOCK" }],
        ["CUSTOMER", "PATCH", "/orders/1/confirm"],
        ["CUSTOMER", "PATCH", "/orders/1/reject", { reason: "x" }],
        ["CUSTOMER", "GET", "/seller/orders"],
        ["CUSTOMER", "GET", "/seller/orders/history"],
        ["CUSTOMER", "GET", "/shops/1/statistics/revenue"],
        ["CUSTOMER", "GET", "/admin/orders"],
        ["SELLER", "GET", "/admin/transactions"],
        ["SELLER", "GET", "/admin/statistics"],
        ["ADMIN", "POST", "/orders", validOrder],
        ["ADMIN", "GET", "/shops/1/statistics/revenue"]
    ];
    for (const [as, method, path, body] of cases) {
        const { status } = await call(method, path, { as, body });
        assert.equal(status, 403, `${as} ${method} ${path}`);
    }
});

test("dữ liệu sai: trả 400 VALIDATION_ERROR theo định dạng chung", async () => {
    const bad = [
        ["CUSTOMER", "POST", "/orders", { ...validOrder, receiverPhone: "abc" }],
        ["CUSTOMER", "POST", "/orders", { ...validOrder, paymentMethod: "BITCOIN" }],
        ["CUSTOMER", "POST", "/orders", undefined],
        ["CUSTOMER", "POST", "/payments", { orderId: 1, method: "COD" }],
        ["CUSTOMER", "POST", "/payments", { method: "MOCK" }],
        ["CUSTOMER", "GET", "/orders/my?page=0"],
        ["CUSTOMER", "GET", "/orders/my?status=NOPE"],
        ["SELLER", "PATCH", "/orders/1/reject", {}],
        ["SELLER", "PATCH", "/orders/1/reject", { reason: "   " }],
        ["SELLER", "GET", "/seller/orders?status=COMPLETED"],
        ["SELLER", "GET", "/seller/orders/history?from=2026-11-10&to=2026-11-01"],
        ["SELLER", "GET", "/shops/1/statistics/revenue?groupBy=year"],
        ["ADMIN", "GET", "/admin/orders?limit=1000"],
        ["ADMIN", "GET", "/admin/transactions?status=NOPE"],
        ["CUSTOMER", "GET", "/orders/abc"],
        ["CUSTOMER", "PATCH", "/orders/0/cancel"],
        ["SELLER", "PATCH", "/orders/-5/confirm"]
    ];
    for (const [as, method, path, body] of bad) {
        const { status, json } = await call(method, path, { as, body });
        assert.equal(status, 400, `${as} ${method} ${path} -> ${JSON.stringify(json)}`);
        assert.equal(json.success, false);
        assert.equal(json.errorCode, "VALIDATION_ERROR");
    }
});

test("VNPay callback công khai: sai chữ ký trả 400, IPN trả đúng định dạng RspCode", async () => {
    const ret = await call(
        "GET",
        "/payments/vnpay-return?vnp_TxnRef=P1T1&vnp_Amount=100&vnp_SecureHash=abc"
    );
    assert.equal(ret.status, 400);
    assert.equal(ret.json.errorCode, "INVALID_PAYMENT_CALLBACK");

    const ipn = await call("GET", "/payments/vnpay-ipn?vnp_TxnRef=P1T1&vnp_SecureHash=abc");
    assert.equal(ipn.status, 200);
    assert.equal(ipn.json.RspCode, "97");
});

test("VNPay chưa cấu hình: thanh toán VNPAY trả 503 và gợi ý dùng MOCK", async () => {
    delete process.env.VNP_TMN_CODE;
    delete process.env.VNP_HASH_SECRET;
    const { status, json } = await call("POST", "/payments", {
        as: "CUSTOMER",
        body: { orderId: 1, method: "VNPAY" }
    });
    assert.equal(status, 503);
    assert.equal(json.errorCode, "PAYMENT_GATEWAY_NOT_CONFIGURED");
});

test("Swagger có đủ endpoint của BE3", () => {
    const expected = [
        "/orders",
        "/orders/my",
        "/orders/{id}",
        "/orders/{id}/cancel",
        "/orders/{id}/confirm",
        "/orders/{id}/prepare",
        "/orders/{id}/deliver",
        "/orders/{id}/complete",
        "/orders/{id}/reject",
        "/seller/orders",
        "/seller/orders/history",
        "/payments",
        "/payments/vnpay-return",
        "/payments/vnpay-ipn",
        "/shops/{shopId}/statistics/revenue",
        "/admin/orders",
        "/admin/transactions",
        "/admin/statistics"
    ];
    for (const path of expected) {
        assert.ok(swaggerSpec.paths[path], `thiếu ${path} trong Swagger`);
    }
    assert.ok(swaggerSpec.components.schemas.Order);
});
