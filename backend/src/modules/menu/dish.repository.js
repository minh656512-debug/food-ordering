import prisma from '../../config/prisma.js';

export const findAll = async () => {
  return await prisma.dish.findMany({
    include: { category: true } 
  });
};

// Khách chỉ thấy món đang bán (AVAILABLE) của cửa hàng đang mở (OPEN).
const publicWhere = ({ keyword, categoryId, shopId }) => ({
  status: 'AVAILABLE',
  shop: { status: 'OPEN' },
  ...(categoryId && { categoryId }),
  ...(shopId && { shopId }),
  ...(keyword && { name: { contains: keyword } })
});

const publicInclude = {
  category: { select: { id: true, name: true } },
  shop: { select: { id: true, name: true, address: true, openingHours: true } }
};

export const searchPublic = async (filters, skip, take) => {
  const where = publicWhere(filters);
  const [rows, total] = await Promise.all([
    prisma.dish.findMany({ where, include: publicInclude, orderBy: { id: 'asc' }, skip, take }),
    prisma.dish.count({ where })
  ]);
  return { rows, total };
};

// Chi tiết món: xem được cả món tạm hết (UNAVAILABLE) nếu cửa hàng đang mở.
export const findPublicById = async (id) => {
  return await prisma.dish.findFirst({
    where: { id, shop: { status: 'OPEN' } },
    include: publicInclude
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