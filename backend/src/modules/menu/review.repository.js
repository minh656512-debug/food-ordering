import prisma from '../../config/prisma.js';

export const findByDishId = async (dishId) => {
  return await prisma.review.findMany({
    where: { dishId: Number(dishId) },
    include: { customer: true } // Lấy kèm thông tin người đã đánh giá
  });
};