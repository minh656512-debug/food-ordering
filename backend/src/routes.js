import { Router } from "express";
import { ROLES } from "./common/constants/roles.js";
import auth from "./common/middlewares/auth.js";
import authorize from "./common/middlewares/authorize.js";
import { ok } from "./common/utils/apiResponse.js";
import accountRoutes from "./modules/account/account.routes.js";
import authRoutes from "./modules/account/auth.routes.js";
import customerRoutes from "./modules/account/customer.routes.js";
import sellerRoutes from "./modules/account/seller.routes.js";
import shopRoutes from "./modules/account/shop.routes.js";
// Module Order (BE3)
import orderRoutes, {
    adminOrderRoutes,
    sellerOrderRoutes
} from "./modules/order/order.routes.js";

import paymentRoutes, {
    adminTransactionRoutes
} from "./modules/order/payment.routes.js";

import refundRoutes from "./modules/order/refund.routes.js";

import shopStatisticRoutes, {
    adminStatisticRoutes
} from "./modules/order/statistic.routes.js";

// Gộp router của các module, tiền tố /api/v1 được gắn ở app.js.
const router = Router();

router.get("/health", (req, res) => res.json(ok(null, "Food Ordering API is running")));

// ---------------------------------------------------------------------
// Phân quyền theo nhóm đường dẫn
//   Công khai : /auth/**, GET /dishes/**, GET /shops/**  (khai báo trong route của từng module)
//   /admin/** : chỉ ADMIN      /seller/** : chỉ SELLER
//   Còn lại   : tự gắn `auth` (và `authorize` nếu cần) ở từng route
// Hai chốt chặn dưới đặt TRƯỚC các router để route nào thêm vào /admin, /seller sau này
// đều tự động được bảo vệ.
// ---------------------------------------------------------------------
router.use("/admin", auth, authorize(ROLES.ADMIN));
router.use("/seller", auth, authorize(ROLES.SELLER));

// module account (BE1)
router.use("/auth", authRoutes);
router.use("/accounts", accountRoutes);
router.use("/customers", customerRoutes);
router.use("/sellers", sellerRoutes);
router.use("/shops", shopRoutes);

// module menu (BE2) và module order (BE3): mỗi người thêm router của mình vào đây
// router.use("/dishes", dishRoutes);
// module menu (BE2) - bổ sung sau
// module order (BE3)
router.use("/orders", orderRoutes);
router.use("/orders", refundRoutes);

router.use("/seller/orders", sellerOrderRoutes);

router.use("/payments", paymentRoutes);

router.use("/shops", shopStatisticRoutes);

router.use("/admin/orders", adminOrderRoutes);
router.use("/admin/transactions", adminTransactionRoutes);
router.use("/admin/statistics", adminStatisticRoutes);

export default router;
