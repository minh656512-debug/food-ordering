import assert from "node:assert/strict";
import { test } from "node:test";
import {
    calculateLoyaltyPoints,
    calculateTotal,
    SELLER_TRANSITIONS
} from "../src/modules/order/order.rules.js";

test("calculateTotal: tổng (đơn giá x số lượng)", () => {
    assert.equal(
        calculateTotal([
            { price: 35000, quantity: 2 },
            { price: 15000, quantity: 1 }
        ]),
        85000
    );
});

test("calculateTotal: nhận giá dạng Decimal (có valueOf/toString) và giỏ rỗng", () => {
    const decimalLike = { toString: () => "42000", valueOf: () => "42000" };
    assert.equal(calculateTotal([{ price: decimalLike, quantity: 3 }]), 126000);
    assert.equal(calculateTotal([]), 0);
});

test("calculateTotal: từ chối số lượng hoặc giá không hợp lệ", () => {
    assert.throws(() => calculateTotal([{ price: 1000, quantity: 0 }]), RangeError);
    assert.throws(() => calculateTotal([{ price: 1000, quantity: 1.5 }]), RangeError);
    assert.throws(() => calculateTotal([{ price: -1, quantity: 1 }]), RangeError);
    assert.throws(() => calculateTotal([{ price: "abc", quantity: 1 }]), RangeError);
});

test("calculateLoyaltyPoints: 1 điểm mỗi 10.000 đồng, làm tròn xuống", () => {
    assert.equal(calculateLoyaltyPoints(105000), 10);
    assert.equal(calculateLoyaltyPoints(9999), 0);
    assert.equal(calculateLoyaltyPoints(10000), 1);
    assert.equal(calculateLoyaltyPoints("99999"), 9);
});

test("SELLER_TRANSITIONS: chuỗi trạng thái liền mạch, không nhảy cóc", () => {
    const { confirm, prepare, deliver, complete } = SELLER_TRANSITIONS;
    assert.equal(confirm.to, prepare.from);
    assert.equal(prepare.to, deliver.from);
    assert.equal(deliver.to, complete.from);
    assert.equal(confirm.from, "PENDING");
    assert.equal(complete.to, "COMPLETED");
});
