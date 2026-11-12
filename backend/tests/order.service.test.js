// Kiểm thử nghiệp vụ của module order bằng "database giả" trong bộ nhớ (không cần MySQL).
// Chạy: npm test   (cần cờ --experimental-test-module-mocks, đã có trong script)
import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

process.env.DATABASE_URL ??= "mysql://u:p@localhost:3306/x";
process.env.JWT_SECRET ??= "test";
process.env.VNP_TMN_CODE = "TESTCODE";
process.env.VNP_HASH_SECRET = "SECRETKEY";

// ---------- database giả ----------
let db;
const resetDb = () => {
    db = {
        nextId: { order: 100, payment: 100, refund: 1 },
        customers: { 1: { id: 1, loyaltyPoints: 0 } },
        shop: { id: 7, name: "Cơm Tấm Sài Gòn", status: "OPEN", address: "a", phone: "p" },
        cart: {
            id: 1,
            customerId: 1,
            items: [
                {
                    id: 1,
                    cartId: 1,
                    dishId: 10,
                    quantity: 2,
                    dish: {
                        id: 10,
                        name: "Cơm sườn",
                        price: 35000,
                        status: "AVAILABLE",
                        shopId: 7,
                        shop: null
                    }
                },
                {
                    id: 2,
                    cartId: 1,
                    dishId: 11,
                    quantity: 1,
                    dish: {
                        id: 11,
                        name: "Trà đá",
                        price: 5000,
                        status: "AVAILABLE",
                        shopId: 7,
                        shop: null
                    }
                }
            ]
        },
        orders: {},
        payments: {},
        refunds: {}
    };
    db.cart.items.forEach((item) => (item.dish.shop = db.shop));
};
resetDb();

const latestPayment = (orderId) =>
    Object.values(db.payments)
        .filter((p) => p.orderId === orderId)
        .sort((a, b) => b.id - a.id)[0];

const view = (order) => {
    if (!order) return null;
    const payment = latestPayment(order.id);
    return {
        ...order,
        shop: db.shop,
        customer: { id: order.customerId, fullName: "An" },
        items: order.items.map((i) => ({
            ...i,
            dish: { id: i.dishId, name: `Món ${i.dishId}`, image: null }
        })),
        payments: payment
            ? [
                  {
                      ...payment,
                      refund:
                          Object.values(db.refunds).find((r) => r.paymentId === payment.id) ?? null
                  }
              ]
            : []
    };
};

const orderRepository = {
    findDetailById: async (id) => view(db.orders[id]),
    findCartWithItems: async () => db.cart,
    deleteCartItems: async () => {
        const count = db.cart.items.length;
        db.cart.items = [];
        return { count };
    },
    resetCartSubtotal: async () => {},
    create: async (data) => {
        const id = db.nextId.order++;
        db.orders[id] = {
            id,
            customerId: data.customerId,
            shopId: data.shopId,
            totalAmount: data.totalAmount,
            status: data.status,
            receiverName: data.receiverName,
            receiverPhone: data.receiverPhone,
            deliveryAddr: data.deliveryAddr,
            note: data.note ?? null,
            reason: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            items: data.items.create.map((i, n) => ({ id: n + 1, ...i }))
        };
        const pid = db.nextId.payment++;
        db.payments[pid] = {
            id: pid,
            orderId: id,
            transactionId: null,
            paidAt: null,
            ...data.payments.create
        };
        return view(db.orders[id]);
    },
    updateStatusIf: async (id, from, data) => {
        const order = db.orders[id];
        if (!order || !from.includes(order.status)) return 0;
        Object.assign(order, data);
        return 1;
    },
    findPage: async () => ({ rows: [], total: 0 }),
    addLoyaltyPoints: async (customerId, points) => {
        db.customers[customerId].loyaltyPoints += points;
    }
};

const paymentRepository = {
    findById: async (id) =>
        db.payments[id] ? { ...db.payments[id], order: db.orders[db.payments[id].orderId] } : null,
    findLatestByOrderId: async (orderId) => latestPayment(orderId),
    create: async (data) => {
        const id = db.nextId.payment++;
        db.payments[id] = { id, transactionId: null, paidAt: null, ...data };
        return db.payments[id];
    },
    update: async (id, data) => Object.assign(db.payments[id], data),
    updateIf: async (id, from, data) => {
        if (!from.includes(db.payments[id].status)) return 0;
        Object.assign(db.payments[id], data);
        return 1;
    },
    markCodPaidByOrderId: async (orderId) => {
        const p = latestPayment(orderId);
        if (p && p.method === "COD" && p.status === "UNPAID") {
            Object.assign(p, { status: "PAID", paidAt: new Date() });
            return 1;
        }
        return 0;
    },
    findPage: async () => ({ rows: [], total: 0 })
};

const refundRepository = {
    create: async (data) => {
        if (Object.values(db.refunds).some((r) => r.paymentId === data.paymentId)) {
            throw new Error("UNIQUE violation: một thanh toán chỉ hoàn tiền một lần");
        }
        const id = db.nextId.refund++;
        db.refunds[id] = { id, refundedAt: new Date(), ...data };
        return db.refunds[id];
    },
    findByPaymentId: async (paymentId) =>
        Object.values(db.refunds).find((r) => r.paymentId === paymentId) ?? null
};

mock.module("../src/config/prisma.js", { defaultExport: { $transaction: (fn) => fn({}) } });
mock.module("../src/modules/order/order.repository.js", { namedExports: orderRepository });
mock.module("../src/modules/order/payment.repository.js", { namedExports: paymentRepository });
mock.module("../src/modules/order/refund.repository.js", { namedExports: refundRepository });
mock.module("../src/modules/account/shop.repository.js", {
    namedExports: { findLatestBySellerId: async (sellerId) => (sellerId === 5 ? db.shop : null) }
});

const orderService = await import("../src/modules/order/order.service.js");
const refundService = await import("../src/modules/order/refund.service.js");
const paymentService = await import("../src/modules/order/payment.service.js");
const vnpay = await import("../src/modules/order/payment.vnpay.js");
const { createOrderSchema } = await import("../src/modules/order/order.schema.js");
const { rejectOrderSchema } = await import("../src/modules/order/refund.schema.js");

const SELLER = 5;
const CUSTOMER = 1;
const body = {
    receiverName: "An",
    receiverPhone: "0901000001",
    deliveryAddress: "HN",
    paymentMethod: "MOCK"
};

// Mỗi lần đặt nạp lại giỏ hàng (đặt hàng xong giỏ bị xóa, đúng như hệ thống thật)
const refillCart = () => {
    const shop = db.shop;
    db.cart.items = [
        {
            id: 1,
            cartId: 1,
            dishId: 10,
            quantity: 2,
            dish: { id: 10, name: "Cơm sườn", price: 35000, status: "AVAILABLE", shopId: 7, shop }
        },
        {
            id: 2,
            cartId: 1,
            dishId: 11,
            quantity: 1,
            dish: { id: 11, name: "Trà đá", price: 5000, status: "AVAILABLE", shopId: 7, shop }
        }
    ];
};
const place = (overrides = {}) => {
    if (db.cart.items.length === 0 && !overrides.keepEmpty) refillCart();
    return orderService.createOrder(CUSTOMER, { ...body, ...overrides });
};
const rejectsWith = (promise, status, errorCode) =>
    assert.rejects(promise, (err) => err.status === status && err.errorCode === errorCode);

beforeEach(resetDb);

// ---------- đặt hàng ----------
test("đặt hàng: tạo đơn PENDING, chốt đơn giá, tổng tiền đúng, thanh toán UNPAID, giỏ trống", async () => {
    const order = await place();
    assert.equal(order.status, "PENDING");
    assert.equal(order.totalAmount, 75000); // 2 x 35.000 + 5.000
    assert.equal(order.items.length, 2);
    assert.equal(order.items[0].price, 35000);
    assert.equal(order.payment.status, "UNPAID");
    assert.equal(order.payment.method, "MOCK");
    assert.equal(db.cart.items.length, 0);
});

test("đặt hàng: giỏ trống, cửa hàng đóng, món hết hàng, hai cửa hàng đều bị từ chối", async () => {
    db.cart.items = [];
    await rejectsWith(orderService.createOrder(CUSTOMER, body), 400, "CART_EMPTY");

    resetDb();
    db.shop.status = "CLOSED";
    await rejectsWith(place(), 409, "SHOP_CLOSED");

    resetDb();
    db.cart.items[0].dish.status = "UNAVAILABLE";
    await rejectsWith(place(), 409, "DISH_OUT_OF_STOCK");

    resetDb();
    db.cart.items[1].dish.shopId = 8;
    await rejectsWith(place(), 400, "CART_MULTIPLE_SHOPS");
});

test("đặt hàng: schema bắt buộc thông tin giao hàng và phương thức hợp lệ", () => {
    assert.equal(createOrderSchema.safeParse(body).success, true);
    assert.equal(createOrderSchema.safeParse({ ...body, receiverPhone: "123" }).success, false);
    assert.equal(createOrderSchema.safeParse({ ...body, paymentMethod: "BITCOIN" }).success, false);
    assert.equal(createOrderSchema.safeParse({ ...body, deliveryAddress: "  " }).success, false);
});

// ---------- thanh toán ----------
test("thanh toán MOCK thành công: payment PAID, thất bại thì đơn vẫn PENDING và thanh toán lại được", async () => {
    const order = await place();

    const failed = await paymentService.createPayment(CUSTOMER, {
        orderId: order.id,
        method: "MOCK",
        simulate: "FAILED"
    });
    assert.equal(failed.payment.status, "FAILED");
    assert.equal(failed.order.status, "PENDING");

    const paid = await paymentService.createPayment(CUSTOMER, {
        orderId: order.id,
        method: "MOCK",
        simulate: "SUCCESS"
    });
    assert.equal(paid.payment.status, "PAID");
    assert.ok(paid.payment.paidAt);

    await rejectsWith(
        paymentService.createPayment(CUSTOMER, {
            orderId: order.id,
            method: "MOCK",
            simulate: "SUCCESS"
        }),
        409,
        "ALREADY_PAID"
    );
});

test("thanh toán: không thanh toán được đơn của người khác", async () => {
    const order = await place();
    await rejectsWith(
        paymentService.createPayment(999, {
            orderId: order.id,
            method: "MOCK",
            simulate: "SUCCESS"
        }),
        404,
        "ORDER_NOT_FOUND"
    );
});

test("thanh toán VNPay: trả paymentUrl có chữ ký, IPN hợp lệ đổi sang PAID, IPN lặp lại trả mã 02", async () => {
    const order = await place({ paymentMethod: "VNPAY" });
    const result = await paymentService.createPayment(
        CUSTOMER,
        { orderId: order.id, method: "VNPAY", simulate: "SUCCESS" },
        "::1"
    );
    assert.ok(result.paymentUrl.includes("vnp_SecureHash="));
    assert.equal(result.payment.status, "UNPAID");

    const query = Object.fromEntries(new URL(result.paymentUrl).searchParams.entries());
    const callback = { ...query, vnp_ResponseCode: "00", vnp_TransactionStatus: "00" };
    // VNPay ký lại toàn bộ tham số trả về: dùng lại hàm ký của chính module để mô phỏng
    const signed = signLikeVnpay(callback);

    const first = await paymentService.handleVnpayCallback(signed);
    assert.equal(first.code, "00");
    assert.equal(first.paymentStatus, "PAID");

    const again = await paymentService.handleVnpayCallback(signed);
    assert.equal(again.code, "02");

    assert.equal(
        (await paymentService.handleVnpayCallback({ ...signed, vnp_Amount: "1" })).code,
        "97"
    );
});

test("thanh toán VNPay thất bại: payment FAILED, đơn vẫn PENDING", async () => {
    const order = await place({ paymentMethod: "VNPAY" });
    const result = await paymentService.createPayment(CUSTOMER, {
        orderId: order.id,
        method: "VNPAY",
        simulate: "SUCCESS"
    });
    const query = Object.fromEntries(new URL(result.paymentUrl).searchParams.entries());
    const out = await paymentService.handleVnpayCallback(
        signLikeVnpay({ ...query, vnp_ResponseCode: "24", vnp_TransactionStatus: "02" })
    );
    assert.equal(out.code, "00");
    assert.equal(out.paymentStatus, "FAILED");
    assert.equal(db.orders[order.id].status, "PENDING");
});

test("VNPay: tiền về sau khi đơn đã hủy thì tự hoàn lại", async () => {
    const order = await place({ paymentMethod: "VNPAY" });
    const result = await paymentService.createPayment(CUSTOMER, {
        orderId: order.id,
        method: "VNPAY",
        simulate: "SUCCESS"
    });
    await orderService.cancelOrder(CUSTOMER, order.id); // hủy khi chưa trả tiền: chưa có gì để hoàn
    assert.equal(Object.keys(db.refunds).length, 0);

    const query = Object.fromEntries(new URL(result.paymentUrl).searchParams.entries());
    const out = await paymentService.handleVnpayCallback(
        signLikeVnpay({ ...query, vnp_ResponseCode: "00", vnp_TransactionStatus: "00" })
    );
    assert.equal(out.paymentStatus, "REFUNDED");
    assert.equal(Object.values(db.refunds)[0].amount, 75000);
});

// ---------- hủy đơn và hoàn tiền ----------
const placeAndPay = async (overrides) => {
    const order = await place(overrides);
    await paymentService.createPayment(CUSTOMER, {
        orderId: order.id,
        method: "MOCK",
        simulate: "SUCCESS"
    });
    return order;
};

test("khách hủy đơn đã thanh toán: CANCELLED, tạo Refund đủ tiền, payment REFUNDED", async () => {
    const order = await placeAndPay();
    const cancelled = await orderService.cancelOrder(CUSTOMER, order.id, "Đổi ý");
    assert.equal(cancelled.status, "CANCELLED");
    assert.equal(cancelled.reason, "Đổi ý");
    assert.equal(cancelled.payment.status, "REFUNDED");
    assert.equal(cancelled.refund.amount, 75000);
});

test("khách hủy đơn chưa thanh toán: chỉ CANCELLED, không có Refund", async () => {
    const order = await place();
    const cancelled = await orderService.cancelOrder(CUSTOMER, order.id);
    assert.equal(cancelled.status, "CANCELLED");
    assert.equal(cancelled.reason, "Khách hủy đơn");
    assert.equal(cancelled.refund, null);
});

test("hủy đơn: chỉ khi PENDING, chỉ đơn của mình, không hủy hai lần", async () => {
    const order = await placeAndPay();
    await rejectsWith(orderService.cancelOrder(2, order.id), 404, "ORDER_NOT_FOUND");

    await orderService.changeOrderStatus(SELLER, order.id, "confirm");
    await rejectsWith(orderService.cancelOrder(CUSTOMER, order.id), 409, "ORDER_NOT_CANCELLABLE");

    const other = await placeAndPay();
    await orderService.cancelOrder(CUSTOMER, other.id);
    await rejectsWith(orderService.cancelOrder(CUSTOMER, other.id), 409, "ORDER_NOT_CANCELLABLE");
    assert.equal(Object.keys(db.refunds).length, 1);
});

test("người bán từ chối đơn: cần lý do, PENDING hoặc CONFIRMED, hoàn tiền đủ số tiền", async () => {
    assert.equal(rejectOrderSchema.safeParse({}).success, false);
    assert.equal(rejectOrderSchema.safeParse({ reason: "   " }).success, false);

    const order = await placeAndPay();
    await orderService.changeOrderStatus(SELLER, order.id, "confirm");
    const rejected = await refundService.rejectOrder(SELLER, order.id, "Hết nguyên liệu");
    assert.equal(rejected.status, "REJECTED");
    assert.equal(rejected.reason, "Hết nguyên liệu");
    assert.equal(rejected.payment.status, "REFUNDED");
    assert.equal(rejected.refund.amount, 75000);
    assert.match(rejected.refund.reason, /Hết nguyên liệu/);

    const preparing = await placeAndPay();
    await orderService.changeOrderStatus(SELLER, preparing.id, "confirm");
    await orderService.changeOrderStatus(SELLER, preparing.id, "prepare");
    await rejectsWith(
        refundService.rejectOrder(SELLER, preparing.id, "x"),
        409,
        "ORDER_NOT_REJECTABLE"
    );
});

// ---------- xử lý đơn của người bán ----------
test("người bán xử lý đúng thứ tự, không nhảy cóc, hoàn tất thì cộng điểm một lần", async () => {
    const order = await placeAndPay();

    await rejectsWith(
        orderService.changeOrderStatus(SELLER, order.id, "prepare"),
        409,
        "INVALID_ORDER_STATUS"
    );
    await rejectsWith(
        orderService.changeOrderStatus(SELLER, order.id, "complete"),
        409,
        "INVALID_ORDER_STATUS"
    );

    assert.equal(
        (await orderService.changeOrderStatus(SELLER, order.id, "confirm")).status,
        "CONFIRMED"
    );
    assert.equal(
        (await orderService.changeOrderStatus(SELLER, order.id, "prepare")).status,
        "PREPARING"
    );
    assert.equal(
        (await orderService.changeOrderStatus(SELLER, order.id, "deliver")).status,
        "DELIVERING"
    );
    assert.equal(db.customers[1].loyaltyPoints, 0);
    assert.equal(
        (await orderService.changeOrderStatus(SELLER, order.id, "complete")).status,
        "COMPLETED"
    );
    assert.equal(db.customers[1].loyaltyPoints, 7); // 75.000 / 10.000 = 7

    await rejectsWith(
        orderService.changeOrderStatus(SELLER, order.id, "complete"),
        409,
        "INVALID_ORDER_STATUS"
    );
    assert.equal(db.customers[1].loyaltyPoints, 7);
});

test("người bán không xử lý được đơn của cửa hàng khác hoặc khi chưa có cửa hàng", async () => {
    const order = await placeAndPay();
    await rejectsWith(
        orderService.changeOrderStatus(99, order.id, "confirm"),
        404,
        "SHOP_NOT_FOUND"
    );
    db.shop.status = "PENDING_APPROVAL";
    await rejectsWith(
        orderService.changeOrderStatus(SELLER, order.id, "confirm"),
        403,
        "SHOP_NOT_APPROVED"
    );
});

test("xác nhận đơn online chưa thanh toán bị chặn; đơn COD xác nhận được và hoàn tất thì ghi nhận đã thu tiền", async () => {
    const online = await place({ paymentMethod: "VNPAY" });
    await rejectsWith(
        orderService.changeOrderStatus(SELLER, online.id, "confirm"),
        409,
        "ORDER_NOT_PAID"
    );

    const cod = await place({ paymentMethod: "COD" });
    await orderService.changeOrderStatus(SELLER, cod.id, "confirm");
    await orderService.changeOrderStatus(SELLER, cod.id, "prepare");
    await orderService.changeOrderStatus(SELLER, cod.id, "deliver");
    const done = await orderService.changeOrderStatus(SELLER, cod.id, "complete");
    assert.equal(done.payment.status, "PAID");
});

// ---------- xem đơn ----------
test("xem chi tiết: khách chỉ thấy đơn của mình, người bán chỉ thấy đơn cửa hàng mình, admin thấy tất cả", async () => {
    const order = await place();
    assert.equal(
        (await orderService.getOrderDetail({ role: "CUSTOMER", customerId: CUSTOMER }, order.id))
            .id,
        order.id
    );
    assert.equal(
        (await orderService.getOrderDetail({ role: "SELLER", sellerId: SELLER }, order.id)).id,
        order.id
    );
    assert.equal((await orderService.getOrderDetail({ role: "ADMIN" }, order.id)).id, order.id);
    await rejectsWith(
        orderService.getOrderDetail({ role: "CUSTOMER", customerId: 2 }, order.id),
        404,
        "ORDER_NOT_FOUND"
    );
    await rejectsWith(
        orderService.getOrderDetail({ role: "ADMIN" }, 99999),
        404,
        "ORDER_NOT_FOUND"
    );
});

// ---------- hỗ trợ ----------
// Ký lại tham số như VNPay làm khi gọi về (HMAC SHA512 trên chuỗi đã sắp xếp), độc lập với code cần kiểm thử
import crypto from "node:crypto";
function signLikeVnpay(params) {
    const clean = Object.fromEntries(
        Object.entries(params).filter(([k]) => k !== "vnp_SecureHash")
    );
    const data = Object.keys(clean)
        .sort()
        .map((k) => `${k}=${encodeURIComponent(clean[k]).replace(/%20/g, "+")}`)
        .join("&");
    return {
        ...clean,
        vnp_SecureHash: crypto.createHmac("sha512", "SECRETKEY").update(data).digest("hex")
    };
}
void vnpay;
