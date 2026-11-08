// Lỗi nghiệp vụ có chủ đích. Dùng: throw new AppError(404, "DISH_NOT_FOUND", "Không tìm thấy món ăn")
// errorHandler sẽ đổi lỗi này thành response { success: false, message, errorCode }.
export default class AppError extends Error {
    constructor(status, errorCode, message, errors) {
        super(message);
        this.name = "AppError";
        this.status = status;
        this.errorCode = errorCode;
        this.errors = errors; // chi tiết từng trường (chỉ dùng cho lỗi validate), có thể bỏ trống
    }
}
