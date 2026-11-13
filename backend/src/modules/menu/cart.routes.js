import { Router } from 'express';
import * as cartController from './cart.controller.js';
import auth from '../../common/middlewares/auth.js'; // Nhúng bảo mật từ BE1

const router = Router();

// Toàn bộ API giỏ hàng đều bắt buộc phải đăng nhập
router.use(auth); 

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.delete('/items/:id', cartController.removeItem);

export default router;