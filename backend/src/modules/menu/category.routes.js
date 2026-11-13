import { Router } from 'express';
import * as categoryController from './category.controller.js';
import auth from '../../common/middlewares/auth.js';
import authorize from '../../common/middlewares/authorize.js';
import { ROLES } from '../../common/constants/roles.js';

const router = Router();

// API Công khai: Khách hàng xem danh mục
router.get('/', categoryController.getAll);

// API Quản trị: Bắt buộc Đăng nhập (auth) VÀ Quyền Admin (authorize)
router.post('/', auth, authorize(ROLES.ADMIN), categoryController.create);
router.put('/:id', auth, authorize(ROLES.ADMIN), categoryController.update);
router.delete('/:id', auth, authorize(ROLES.ADMIN), categoryController.remove);

export default router;