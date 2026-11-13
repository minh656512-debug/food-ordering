import * as dishService from './dish.service.js';
import { ok } from '../../common/utils/apiResponse.js';
import asyncHandler from '../../common/utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
  const dishes = await dishService.getAllDishes();
  res.status(200).json(ok(dishes));
});

export const create = asyncHandler(async (req, res) => {
  const newDish = await dishService.createDish(req.body);
  res.status(201).json(ok(newDish, "Thêm món ăn thành công"));
});

export const update = asyncHandler(async (req, res) => {
  const updatedDish = await dishService.updateDish(req.params.id, req.body);
  res.status(200).json(ok(updatedDish, "Cập nhật món ăn thành công"));
});

export const remove = asyncHandler(async (req, res) => {
  await dishService.deleteDish(req.params.id);
  res.status(200).json(ok(null, "Xóa món ăn thành công"));
});