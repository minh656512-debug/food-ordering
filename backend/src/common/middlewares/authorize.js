import AppError from "../utils/AppError.js";

// Kiểm tra vai trò. Phải đặt SAU middleware auth.
// Dùng: router.get("/", auth, authorize(ROLES.ADMIN), handler)
const authorize =
    (...roles) =>
    (req, res, next) => {
        if (!req.user) {
            throw new AppError(401, "UNAUTHORIZED", "Bạn chưa đăng nhập");
        }
        if (!roles.includes(req.user.role)) {
            throw new AppError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này");
        }
        next();
    };

export default authorize;
