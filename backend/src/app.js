import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { errorHandler, notFoundHandler } from "./common/middlewares/errorHandler.js";
import { corsOptions } from "./config/cors.js";
import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes.js";

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

// Toàn bộ API nằm dưới /api/v1
app.use("/api/v1", routes);

// Hai middleware này phải đứng cuối cùng: 404 cho route lạ, rồi xử lý mọi lỗi
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
