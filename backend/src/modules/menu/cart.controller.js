import * as cartService from './cart.service.js';
import { ok } from '../../common/utils/apiResponse.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
// Nhúng hàm tiện ích mà BE1 đã làm sẵn
import { getCurrentCustomerId } from '../../common/utils/currentUser.js'; 

export const getCart = asyncHandler(async (req, res) => {
  // Dùng hàm chuẩn của nhóm để lấy ID Khách hàng, không lấy ID Tài khoản
  const customerId = await getCurrentCustomerId(req); 
  const cartItems = await cartService.getUserCart(customerId);
  res.status(200).json(ok(cartItems));
});

export const addToCart = asyncHandler(async (req, res) => {
  const customerId = await getCurrentCustomerId(req); 
  const { dishId, quantity } = req.body;
  
  const newItem = await cartService.addItemToCart(customerId, dishId, quantity);
  res.status(201).json(ok(newItem, "Đã thêm vào giỏ hàng"));
});

export const removeItem = async (req, res, next) => {
    try {
        const itemId = req.params.id; // Lấy ID số 5 từ URL
        // Chỗ này bạn sẽ gọi tầng cartService để xóa bản ghi trong DB
        // await cartService.removeItem(itemId);

        res.status(200).json({ 
            success: true, 
            message: "Xóa món ăn khỏi giỏ thành công" 
        });
    } catch (error) {
        next(error);
    }
};