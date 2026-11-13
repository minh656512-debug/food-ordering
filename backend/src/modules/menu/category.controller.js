import * as categoryService from './category.service.js';
import { ok } from '../../common/utils/apiResponse.js';
import asyncHandler from '../../common/utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.status(200).json(ok(categories));
});

export const create = asyncHandler(async (req, res) => {
  const newCategory = await categoryService.createCategory(req.body);
  res.status(201).json(ok(newCategory, "Tạo danh mục thành công"));
});

export const update = asyncHandler(async (req, res) => {
  const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
  res.status(200).json(ok(updatedCategory, "Cập nhật thành công"));
});

export const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(200).json(ok(null, "Xóa danh mục thành công"));
});