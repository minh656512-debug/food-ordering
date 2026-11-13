import * as cartRepository from './cart.repository.js';
import * as dishRepository from './dish.repository.js'; // Import thêm file quản lý món ăn
import AppError from '../../common/utils/AppError.js';

export const getUserCart = async (customerId) => {
    if (!customerId) throw new AppError(400, 'USER_NOT_FOUND', 'Không tìm thấy ID người dùng');
    return await cartRepository.getCartByUserId(customerId);
};

export const addItemToCart = async (customerId, dishId, quantity) => {
    if (!customerId) throw new AppError(400, 'USER_NOT_FOUND', 'Không tìm thấy ID người dùng');

    // 1. Kiểm tra món ăn mới gửi lên và lấy ID cửa hàng (shopId) của món đó
    const newDish = await dishRepository.getDishById(dishId);
    if (!newDish) {
        throw new AppError(404, 'DISH_NOT_FOUND', 'Không tìm thấy thông tin món ăn');
    }
    const newDishShopId = newDish.shopId;

    // 2. Tìm giỏ hàng hiện tại của khách
    let cart = await cartRepository.getCartByUserId(customerId);

    // 3. Nếu khách chưa từng có giỏ hàng, hệ thống sẽ tự động tạo mới
    if (!cart) {
        cart = await cartRepository.createCart(customerId);
    } else {
        // 4. Nếu giỏ đã tồn tại và có chứa đồ ăn bên trong -> Kiểm tra quy tắc 1 cửa hàng
        if (cart.items && cart.items.length > 0) {
            // Lấy shopId của món ăn đầu tiên đang nằm trong giỏ
            const existingShopId = cart.items[0].dish.shopId; 

            // Nếu ID cửa hàng của món mới KHÁC với món trong giỏ -> Chặn lại và ném lỗi 409
            if (existingShopId !== newDishShopId) {
                throw new AppError(
                    409, 
                    'INVALID_SHOP', 
                    'Không thể thêm món. Giỏ hàng chỉ được chứa các món từ cùng một cửa hàng.'
                );
            }
        }
    }

    // 5. Đóng gói dữ liệu, BẮT BUỘC phải truyền cartId (Đây là nguyên nhân gây lỗi 500 nãy giờ)
    const itemData = {
        cartId: cart.id,
        dishId: Number(dishId),
        quantity: Number(quantity)
    };

    // Lưu vào Database
    return await cartRepository.addCartItem(itemData);
};