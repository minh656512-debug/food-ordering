import prisma from '../../config/prisma.js';

export const findAll = async () => {
  return await prisma.category.findMany();
};

export const create = async (data) => {
  return await prisma.category.create({ data });
};

export const update = async (id, data) => {
  return await prisma.category.update({
    where: { id: Number(id) },
    data
  });
};

export const remove = async (id) => {
  return await prisma.category.delete({
    where: { id: Number(id) }
  });
};