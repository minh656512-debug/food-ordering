import AppError from "../utils/AppError.js";
import { fail } from "../utils/apiResponse.js";

// Route không tồn tại -> 404 theo định dạng chung.
export const notFoundHandler = (req, res) => {
    res.status(404).json(fail(`Không tìm thấy ${req.method} ${req.originalUrl}`, "NOT_FOUND"));
};

// Nơi duy nhất biến mọi lỗi thành response. Phải đăng ký CUỐI CÙNG trong app.js.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    // Lỗi nghiệp vụ / lỗi validate do mình chủ động ném
    if (err instanceof AppError) {
        return res.status(err.status).json(fail(err.message, err.errorCode, err.errors));
    }

    // JSON gửi lên sai cú pháp (do express.json ném)
    if (err.type === "entity.parse.failed") {
        return res.status(400).json(fail("Dữ liệu JSON không hợp lệ", "INVALID_JSON"));
    }

    // Vi phạm UNIQUE trong database (hai request trùng nhau chạy cùng lúc)
    if (err.code === "P2002") {
        return res.status(409).json(fail("Dữ liệu đã tồn tại", "DUPLICATE_ENTRY"));
    }

    // Lỗi không lường trước: ghi log để dev xem, không lộ chi tiết cho client
    console.error(err);
    return res.status(500).json(fail("Lỗi máy chủ, vui lòng thử lại sau", "INTERNAL_ERROR"));
};
