import * as dishRepository from './dish.repository.js';
import AppError from '../../common/utils/AppError.js';
import * as dishMapper from './dish.mapper.js';
import { toPage } from '../order/order.mapper.js';

export const searchDishes = async ({ keyword, categoryId, shopId, page, limit }) => {
  const { rows, total } = await dishRepository.searchPublic(
    { keyword, categoryId, shopId },
    (page - 1) * limit,
    limit
  );
  return toPage(rows, total, page, limit, dishMapper.toDishResponse);
};

export const getDishDetail = async (id) => {
  const dish = await dishRepository.findPublicById(id);
  if (!dish) throw new AppError(404, 'DISH_NOT_FOUND', 'Không tìm thấy món ăn');
  return dishMapper.toDishResponse(dish);
};

export const getAllDishes = async () => {
  return await dishRepository.findAll();
};

export const createDish = async (data) => {
  return await dishRepository.create(data);
};

export const updateDish = async (id, data) => {
  return await dishRepository.update(id, data);
};

export const deleteDish = async (id) => {
  return await dishRepository.remove(id);
};