import * as dishRepository from './dish.repository.js';

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