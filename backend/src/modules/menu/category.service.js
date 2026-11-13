import * as categoryRepository from './category.repository.js';

export const getAllCategories = async () => {
  return await categoryRepository.findAll();
};

export const createCategory = async (data) => {
  return await categoryRepository.create(data);
};

export const updateCategory = async (id, data) => {
  return await categoryRepository.update(id, data);
};

export const deleteCategory = async (id) => {
  return await categoryRepository.remove(id);
};