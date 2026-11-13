import { Router } from 'express';
import * as reviewController from './review.controller.js';

const router = Router();

// API Công khai: Lấy danh sách đánh giá của 1 món ăn cụ thể
router.get('/dish/:dishId', reviewController.getByDish);

export default router;