import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/jwt.js";

// Đọc "Authorization: Bearer <token>", kiểm tra token và gán req.user = { accountId, role }.
// Thiếu token, token sai hoặc hết hạn đều trả 401.
const auth = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new AppError(401, "UNAUTHORIZED", "Bạn chưa đăng nhập");
    }

    try {
        const { accountId, role } = verifyToken(token);
        req.user = { accountId, role };
    } catch (error) {
        const expired = error.name === "TokenExpiredError";
        throw new AppError(
            401,
            expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
            expired ? "Phiên đăng nhập đã hết hạn" : "Token không hợp lệ"
        );
    }

    next();
});

export default auth;
