import prisma from '../../config/prisma.js';

export const getCartByUserId = async (customerId) => {
  return await prisma.cart.findFirst({
    where: { customerId: Number(customerId) },
    include: {
      items: {
        include: { dish: true }
      }
    }
  });
};

// BỔ SUNG: Hàm tạo giỏ hàng mới cho người dùng
export const createCart = async (customerId) => {
  return await prisma.cart.create({
    data: { customerId: Number(customerId) }
  });
};

export const addCartItem = async (data) => {
  return await prisma.cartItem.create({
    data: data
  });
};