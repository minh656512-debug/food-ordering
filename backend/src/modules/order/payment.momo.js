import crypto from "node:crypto";
import AppError from "../../common/utils/AppError.js";
import { env } from "../../config/env.js"; // đảm bảo .env đã được nạp

// Cổng thanh toán MoMo (API v2, requestType = captureWallet, trả về payUrl/qrCodeUrl).
// Cấu hình trong .env (không đưa khóa vào code):
//   MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, MOMO_ENDPOINT, MOMO_REDIRECT_URL, MOMO_IPN_URL
// Thiếu một trong bốn biến đầu hoặc MOMO_IPN_URL thì isConfigured() = false và API trả 503,
// không giả lập giao dịch.

// Sandbox của MoMo. MOMO_ENDPOINT là địa chỉ API "create"; địa chỉ "query" suy ra từ đó.
const DEFAULT_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";

// Hạn của mã QR/liên kết (phút), gửi cho MoMo qua orderExpireTime
export const EXPIRE_MINUTES = 15;

// MoMo yêu cầu timeout tối thiểu 30 giây khi gọi API
const REQUEST_TIMEOUT_MS = 30_000;

// Mã giao dịch gửi cho MoMo (orderId) chứa mã thanh toán: M12T1699999999999.
// Mỗi lần thanh toán lại tạo mã mới, nhưng IPN luôn tìm lại được bản ghi thanh toán.
const ORDER_ID_PATTERN = /^M(\d+)T\d+$/;

// resultCode của MoMo (https://developers.momo.vn, mục Result Codes)
const SUCCESS_CODES = [0];
// Chưa kết thúc: chờ IPN hoặc truy vấn lại, KHÔNG được coi là thất bại
const PENDING_CODES = [1000, 7000, 7002, 9000];

const getConfig = () => {
    const endpoint = process.env.MOMO_ENDPOINT || DEFAULT_ENDPOINT;
    return {
        partnerCode: process.env.MOMO_PARTNER_CODE,
        accessKey: process.env.MOMO_ACCESS_KEY,
        secretKey: process.env.MOMO_SECRET_KEY,
        endpoint,
        queryEndpoint: endpoint.replace(/\/create\/?$/, "/query"),
        // Địa chỉ MoMo đưa khách quay lại. Mặc định là chính backend này.
        redirectUrl:
            process.env.MOMO_REDIRECT_URL ||
            `http://localhost:${env.port}/api/v1/payments/momo-return`,
        // Địa chỉ MoMo gọi server-to-server. Phải là địa chỉ công khai (ngrok khi chạy local).
        ipnUrl: process.env.MOMO_IPN_URL
    };
};

export const isConfigured = () => {
    const { partnerCode, accessKey, secretKey, ipnUrl } = getConfig();
    return Boolean(partnerCode && accessKey && secretKey && ipnUrl);
};

export const makeOrderId = (paymentId) => `M${paymentId}T${Date.now()}`;

export const parseOrderId = (orderId) => {
    const match = ORDER_ID_PATTERN.exec(String(orderId ?? ""));
    return match ? Number(match[1]) : null;
};

// Phân loại resultCode: SUCCESS (đã thu tiền), PENDING (chưa xong), FAILED (đã kết thúc không thành công)
export const classifyResult = (resultCode) => {
    const code = Number(resultCode);
    if (SUCCESS_CODES.includes(code)) return "SUCCESS";
    if (PENDING_CODES.includes(code)) return "PENDING";
    return "FAILED";
};

// ---------------------------------------------------------------------
// Chữ ký HMAC SHA256 (hex). Chuỗi ký: key=value nối bằng &, các key xếp theo thứ tự chữ cái
// đúng như tài liệu MoMo cho từng loại thông điệp.
// ---------------------------------------------------------------------

const sign = (raw, secretKey) => crypto.createHmac("sha256", secretKey).update(raw).digest("hex");

const buildRaw = (keys, data) => keys.map((key) => `${key}=${data[key] ?? ""}`).join("&");

const CREATE_REQUEST_KEYS = [
    "accessKey",
    "amount",
    "extraData",
    "ipnUrl",
    "orderId",
    "orderInfo",
    "partnerCode",
    "redirectUrl",
    "requestId",
    "requestType"
];

const CREATE_RESPONSE_KEYS = [
    "accessKey",
    "amount",
    "message",
    "orderId",
    "partnerCode",
    "payUrl",
    "requestId",
    "responseTime",
    "resultCode"
];

// IPN và redirect có cùng bộ trường
const NOTIFY_KEYS = [
    "accessKey",
    "amount",
    "extraData",
    "message",
    "orderId",
    "orderInfo",
    "orderType",
    "partnerCode",
    "payType",
    "requestId",
    "responseTime",
    "resultCode",
    "transId"
];

const QUERY_REQUEST_KEYS = ["accessKey", "orderId", "partnerCode", "requestId"];

const safeEqual = (a, b) => {
    const left = Buffer.from(String(a).toLowerCase(), "utf-8");
    const right = Buffer.from(String(b).toLowerCase(), "utf-8");
    return left.length === right.length && crypto.timingSafeEqual(left, right);
};

// Kiểm tra chữ ký của IPN hoặc redirect do MoMo gửi về. Sai chữ ký = dữ liệu bị sửa hoặc giả mạo.
export const verifyNotification = (data) => {
    const { partnerCode, accessKey, secretKey } = getConfig();
    if (!secretKey || !accessKey || !data || typeof data !== "object" || !data.signature) {
        return false;
    }
    if (String(data.partnerCode) !== partnerCode) return false;

    const raw = buildRaw(NOTIFY_KEYS, { ...data, accessKey });
    return safeEqual(sign(raw, secretKey), data.signature);
};

// ---------------------------------------------------------------------
// Gọi API MoMo
// ---------------------------------------------------------------------

const gatewayError = (message) => new AppError(502, "PAYMENT_GATEWAY_ERROR", message);

const postJson = async (url, body) => {
    let response;
    try {
        response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });
    } catch {
        throw gatewayError("Không kết nối được tới MoMo, vui lòng thử lại sau");
    }

    try {
        return await response.json();
    } catch {
        throw gatewayError("MoMo trả về dữ liệu không hợp lệ");
    }
};

export const buildCreateBody = ({ orderId, amount, orderInfo }) => {
    const { partnerCode, accessKey, secretKey, redirectUrl, ipnUrl } = getConfig();
    const fields = {
        partnerCode,
        requestId: orderId, // mỗi lần tạo giao dịch có orderId mới nên requestId cũng duy nhất
        orderId,
        amount: String(Math.round(Number(amount))),
        orderInfo,
        redirectUrl,
        ipnUrl,
        requestType: "captureWallet",
        extraData: ""
    };
    const signature = sign(buildRaw(CREATE_REQUEST_KEYS, { ...fields, accessKey }), secretKey);
    return {
        ...fields,
        lang: "vi",
        autoCapture: true,
        orderExpireTime: EXPIRE_MINUTES,
        signature
    };
};

// Tạo giao dịch thanh toán MoMo. amount tính bằng đồng (số nguyên).
// Trả { payUrl, qrCodeUrl, deeplink }. Lỗi từ MoMo trả 502, KHÔNG giả lập kết quả.
export const createPaymentRequest = async ({ orderId, amount, orderInfo }) => {
    const { endpoint, accessKey, secretKey } = getConfig();
    const data = await postJson(endpoint, buildCreateBody({ orderId, amount, orderInfo }));

    if (Number(data?.resultCode) !== 0) {
        throw gatewayError(`MoMo từ chối tạo giao dịch: ${data?.message ?? "không rõ lý do"}`);
    }
    if (!data.payUrl) throw gatewayError("MoMo không trả về liên kết thanh toán");

    // Nếu MoMo có gửi chữ ký thì phải đúng
    if (data.signature) {
        const expected = sign(buildRaw(CREATE_RESPONSE_KEYS, { ...data, accessKey }), secretKey);
        if (!safeEqual(expected, data.signature)) {
            throw gatewayError("Chữ ký phản hồi của MoMo không hợp lệ");
        }
    }

    return {
        payUrl: data.payUrl,
        qrCodeUrl: data.qrCodeUrl ?? null,
        deeplink: data.deeplink ?? null
    };
};

// Hỏi MoMo trạng thái giao dịch (dùng khi khách đã trả tiền nhưng IPN/redirect chưa tới).
// Trả dữ liệu của MoMo: { orderId, amount, transId, resultCode, message, ... }
export const queryTransaction = async (orderId) => {
    const { partnerCode, accessKey, secretKey, queryEndpoint } = getConfig();
    const requestId = `${orderId}Q${Date.now()}`;
    const fields = { partnerCode, requestId, orderId };
    const signature = sign(buildRaw(QUERY_REQUEST_KEYS, { ...fields, accessKey }), secretKey);

    const data = await postJson(queryEndpoint, { ...fields, lang: "vi", signature });
    if (!data || String(data.orderId) !== String(orderId)) {
        throw gatewayError("MoMo trả về giao dịch không khớp với yêu cầu");
    }
    return data;
};
