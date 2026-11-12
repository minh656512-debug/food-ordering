import crypto from "node:crypto";
import { env } from "../../config/env.js"; // đảm bảo .env đã được nạp

// Cổng thanh toán VNPay (sandbox), phiên bản API 2.1.0.
// Cấu hình trong .env: VNP_TMN_CODE, VNP_HASH_SECRET, VNP_URL (tùy chọn), VNP_RETURN_URL (tùy chọn).
// Không có VNP_TMN_CODE hoặc VNP_HASH_SECRET thì isConfigured() = false và nhóm dùng phương thức MOCK.

const DEFAULT_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const TXN_REF_PATTERN = /^P(\d+)T\d+$/;

const getConfig = () => ({
    tmnCode: process.env.VNP_TMN_CODE,
    hashSecret: process.env.VNP_HASH_SECRET,
    url: process.env.VNP_URL || DEFAULT_URL,
    // Địa chỉ VNPay đưa khách quay lại sau khi thanh toán. Mặc định là chính backend này.
    returnUrl:
        process.env.VNP_RETURN_URL || `http://localhost:${env.port}/api/v1/payments/vnpay-return`
});

export const isConfigured = () => {
    const { tmnCode, hashSecret } = getConfig();
    return Boolean(tmnCode && hashSecret);
};

// Mã giao dịch gửi cho VNPay có chứa mã thanh toán (P12T1699999999999) để IPN luôn tìm lại được
// bản ghi dù khách đã bấm thanh toán lại nhiều lần.
export const makeTxnRef = (paymentId) => `P${paymentId}T${Date.now()}`;

export const parseTxnRef = (txnRef) => {
    const match = TXN_REF_PATTERN.exec(String(txnRef ?? ""));
    return match ? Number(match[1]) : null;
};

const pad = (n) => String(n).padStart(2, "0");

// VNPay dùng giờ Việt Nam (GMT+7), định dạng yyyyMMddHHmmss
const formatVnpDate = (date) => {
    const t = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return (
        `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}` +
        `${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}${pad(t.getUTCSeconds())}`
    );
};

const encode = (value) => encodeURIComponent(value).replace(/%20/g, "+");

// Chuỗi cần ký: các tham số xếp theo tên, dạng key=value đã mã hóa, nối bằng &
const toSignData = (params) =>
    Object.keys(params)
        .sort()
        .map((key) => `${key}=${encode(params[key])}`)
        .join("&");

const sign = (data, secret) =>
    crypto.createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");

const normalizeIp = (ip) => {
    const value = String(ip || "127.0.0.1").replace(/^::ffff:/, "");
    return value === "::1" ? "127.0.0.1" : value;
};

// Tạo URL để chuyển khách sang trang thanh toán của VNPay. amount tính bằng đồng.
export const buildPaymentUrl = ({ txnRef, amount, orderInfo, ipAddr, now = new Date() }) => {
    const { tmnCode, hashSecret, url, returnUrl } = getConfig();
    const params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Amount: Math.round(Number(amount)) * 100, // VNPay yêu cầu nhân 100
        vnp_CreateDate: formatVnpDate(now),
        vnp_ExpireDate: formatVnpDate(new Date(now.getTime() + 15 * 60 * 1000)),
        vnp_CurrCode: "VND",
        vnp_IpAddr: normalizeIp(ipAddr),
        vnp_Locale: "vn",
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: "other",
        vnp_ReturnUrl: returnUrl,
        vnp_TxnRef: txnRef
    };
    const signData = toSignData(params);
    return `${url}?${signData}&vnp_SecureHash=${sign(signData, hashSecret)}`;
};

// Kiểm tra chữ ký của dữ liệu VNPay gửi về (return hoặc IPN). Sai chữ ký = dữ liệu bị sửa hoặc giả mạo.
export const verifyCallback = (query) => {
    const { hashSecret } = getConfig();
    if (!hashSecret || !query?.vnp_SecureHash) return false;

    const params = {};
    for (const [key, value] of Object.entries(query)) {
        if (key.startsWith("vnp_") && key !== "vnp_SecureHash" && key !== "vnp_SecureHashType") {
            params[key] = String(value);
        }
    }

    const expected = Buffer.from(sign(toSignData(params), hashSecret), "utf-8");
    const received = Buffer.from(String(query.vnp_SecureHash).toLowerCase(), "utf-8");
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};

// VNPay báo thành công khi cả hai mã đều là "00"
export const isSuccess = (query) =>
    query.vnp_ResponseCode === "00" && query.vnp_TransactionStatus === "00";
