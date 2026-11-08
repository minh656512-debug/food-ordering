import "dotenv/config";

// Đọc và kiểm tra biến môi trường một lần duy nhất.
// Các file khác import `env` từ đây, không đọc process.env trực tiếp.
const required = ["DATABASE_URL", "JWT_SECRET"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
    throw new Error(`Thiếu biến môi trường trong file .env: ${missing.join(", ")}`);
}

export const env = Object.freeze({
    port: Number(process.env.PORT) || 5001,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d"
});
