import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const ALGORITHM = "HS256";

// Tạo token chứa accountId và role, hết hạn sau env.jwtExpiresIn (mặc định 1 ngày).
export const signToken = ({ accountId, role }) =>
    jwt.sign({ accountId, role }, env.jwtSecret, {
        algorithm: ALGORITHM,
        expiresIn: env.jwtExpiresIn
    });

// Giải mã và kiểm tra chữ ký/hạn dùng. Ném lỗi của jsonwebtoken nếu token không hợp lệ.
export const verifyToken = (token) => jwt.verify(token, env.jwtSecret, { algorithms: [ALGORITHM] });
