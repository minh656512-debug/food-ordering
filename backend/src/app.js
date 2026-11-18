import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { errorHandler, notFoundHandler } from "./common/middlewares/errorHandler.js";
import { corsOptions } from "./config/cors.js";
import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes.js";
import { handleSepayWebhook } from "./modules/order/sepay.controller.js";

const app = express();

// Tài liệu API tại /api-docs. Đặt trước helmet vì CSP mặc định của helmet làm hỏng giao diện Swagger.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Bảo mật HTTP headers (cho phép frontend khác cổng hiển thị ảnh tải từ backend)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Cấu hình CORS
app.use(cors(corsOptions));

// Middleware xử lý dữ liệu
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ghi log request
app.use(morgan("dev"));

// ---------------------------------------------------------------------
// Endpoint nhận Webhook từ SePay (Công khai, không yêu cầu JWT)
// Hỗ trợ mọi biến thể đường dẫn phổ biến mà người dùng có thể cấu hình
// ---------------------------------------------------------------------
const sepayWebhookPaths = [
    "/api/payment/sepay/webhook",
    "/api/payments/sepay/webhook",
    "/api/sepay/webhook",
    "/api/payment/sepay",
    "/api/payments/sepay",
    "/payment/sepay/webhook",
    "/payments/sepay/webhook",
    "/sepay/webhook",
    "/api/v1/payment/sepay/webhook",
    "/api/v1/payments/sepay/webhook"
];

sepayWebhookPaths.forEach((path) => {
    // Xử lý POST webhook chính thức (có và không có dấu gạch chéo cuối)
    app.post(path, handleSepayWebhook);
    app.post(path + "/", handleSepayWebhook);

    // Hỗ trợ GET để SePay ping kiểm tra URL hoạt động khi tạo Webhook
    app.get(path, (req, res) => {
        res.status(200).json({ success: true, message: "SePay webhook endpoint is active" });
    });
    app.get(path + "/", (req, res) => {
        res.status(200).json({ success: true, message: "SePay webhook endpoint is active" });
    });
});

// Xử lý trường hợp người dùng chỉ dán URL gốc của ngrok vào SePay (POST /)
app.post("/", (req, res, next) => {
    if (req.body?.transferType || req.body?.gateway || req.body?.accountNumber || req.body?.code) {
        return handleSepayWebhook(req, res, next);
    }
    next();
});

// Toàn bộ API nằm dưới /api/v1
app.use("/api/v1", routes);

// Hai middleware này phải đứng cuối cùng: 404 cho route lạ, rồi xử lý mọi lỗi
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
