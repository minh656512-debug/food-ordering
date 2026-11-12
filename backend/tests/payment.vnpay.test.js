import assert from "node:assert/strict";
import { test } from "node:test";

process.env.DATABASE_URL ??= "mysql://u:p@localhost:3306/x";
process.env.JWT_SECRET ??= "test";
process.env.VNP_TMN_CODE = "TESTCODE";
process.env.VNP_HASH_SECRET = "SECRETKEY";
process.env.VNP_RETURN_URL = "http://localhost:5001/api/v1/payments/vnpay-return";

const vnpay = await import("../src/modules/order/payment.vnpay.js");

const urlToQuery = (url) => Object.fromEntries(new URL(url).searchParams.entries());

test("makeTxnRef / parseTxnRef: tìm lại được mã thanh toán", () => {
    const ref = vnpay.makeTxnRef(42);
    assert.match(ref, /^P42T\d+$/);
    assert.equal(vnpay.parseTxnRef(ref), 42);
    assert.equal(vnpay.parseTxnRef("abc"), null);
    assert.equal(vnpay.parseTxnRef(undefined), null);
});

test("buildPaymentUrl: số tiền nhân 100 và có chữ ký hợp lệ", () => {
    const url = vnpay.buildPaymentUrl({
        txnRef: "P1T1",
        amount: 85000,
        orderInfo: "Thanh toan don hang 1",
        ipAddr: "::1"
    });
    const query = urlToQuery(url);
    assert.equal(query.vnp_Amount, "8500000");
    assert.equal(query.vnp_IpAddr, "127.0.0.1");
    assert.equal(query.vnp_OrderInfo, "Thanh toan don hang 1");
    assert.equal(vnpay.verifyCallback(query), true);
});

test("verifyCallback: sửa dữ liệu hoặc thiếu chữ ký thì bị từ chối", () => {
    const url = vnpay.buildPaymentUrl({
        txnRef: "P1T1",
        amount: 85000,
        orderInfo: "x",
        ipAddr: "1.2.3.4"
    });
    const query = urlToQuery(url);
    assert.equal(vnpay.verifyCallback({ ...query, vnp_Amount: "100" }), false);
    const { vnp_SecureHash, ...withoutHash } = query;
    assert.ok(vnp_SecureHash);
    assert.equal(vnpay.verifyCallback(withoutHash), false);
    assert.equal(vnpay.verifyCallback({ ...query, vnp_SecureHash: "abc" }), false);
});

test("isSuccess: cần cả vnp_ResponseCode và vnp_TransactionStatus là 00", () => {
    assert.equal(vnpay.isSuccess({ vnp_ResponseCode: "00", vnp_TransactionStatus: "00" }), true);
    assert.equal(vnpay.isSuccess({ vnp_ResponseCode: "00", vnp_TransactionStatus: "02" }), false);
    assert.equal(vnpay.isSuccess({ vnp_ResponseCode: "24", vnp_TransactionStatus: "02" }), false);
});
