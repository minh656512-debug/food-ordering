import assert from "node:assert/strict";
import test from "node:test";
import { buildSepayQrUrl, verifySepayApiKey, handleSepayWebhookPayload } from "../src/modules/order/payment.sepay.js";

test("buildSepayQrUrl: trả về đúng link ảnh VietQR động theo chuẩn SePay", () => {
    process.env.SEPAY_ACCOUNT_NUMBER = "0966517360";
    process.env.SEPAY_BANK_NAME = "MBBank";
    const url = buildSepayQrUrl(15, 120000);
    assert.equal(
        url,
        "https://qr.sepay.vn/img?acc=0966517360&bank=MBBank&amount=120000&des=DH15"
    );
});

test("verifySepayApiKey: kiểm tra header Authorization với tiền tố Apikey", () => {
    process.env.SEPAY_API_KEY = "test_secret_key_123";
    assert.equal(verifySepayApiKey("Apikey test_secret_key_123"), true);
    assert.equal(verifySepayApiKey("ApiKey test_secret_key_123"), true);
    assert.equal(verifySepayApiKey("apikey test_secret_key_123"), true);
    assert.equal(verifySepayApiKey("test_secret_key_123"), true);
    assert.equal(verifySepayApiKey("Apikey wrong_key"), false);
    assert.equal(verifySepayApiKey(""), false);
});
