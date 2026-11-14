import { Router } from 'express';
import * as dishController from './dish.controller.js';
import auth from '../../common/middlewares/auth.js';
import authorize from '../../common/middlewares/authorize.js';
import validate from '../../common/middlewares/validate.js';
import { searchDishQuerySchema } from './dish.schema.js';
import { ROLES } from '../../common/constants/roles.js';

const router = Router();

// API Công khai: Khách hàng xem danh sách món ăn
router.get('/', validate(searchDishQuerySchema, 'query'), dishController.getAll);
router.get('/:id', dishController.getById);

// API Quản trị: Bắt buộc Đăng nhập (auth) VÀ Quyền Người bán (authorize)
router.post('/', auth, authorize(ROLES.SELLER), dishController.create);
router.put('/:id', auth, authorize(ROLES.SELLER), dishController.update);
router.delete('/:id', auth, authorize(ROLES.SELLER), dishController.remove);

export default router;