
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// Bảo mật HTTP headers
app.use(helmet());

// Cấu hình CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173"
    })
);

// Middleware xử lý dữ liệu
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ghi log request
app.use(morgan("dev"));

// API kiểm tra Backend
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Food Ordering API is running"
    });
});

// Xuất app để server.js sử dụng
export default app;
