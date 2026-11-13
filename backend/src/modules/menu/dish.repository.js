import prisma from '../../config/prisma.js';

export const findAll = async () => {
  return await prisma.dish.findMany({
    include: { category: true } 
  });
};

export const create = async (data) => {
  // Yêu cầu data phải truyền lên đủ name, price, categoryId, shopId
  return await prisma.dish.create({ data });
};

export const update = async (id, data) => {
  return await prisma.dish.update({
    where: { id: Number(id) },
    data
  });
};

export const remove = async (id) => {
  return await prisma.dish.delete({
    where: { id: Number(id) }
  });
};

export const getDishById = async (id) => {
  return await prisma.dish.findUnique({
    where: { id: Number(id) }
  });
};