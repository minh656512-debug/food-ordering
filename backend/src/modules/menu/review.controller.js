import * as reviewService from './review.service.js';
import { ok } from '../../common/utils/apiResponse.js';
import asyncHandler from '../../common/utils/asyncHandler.js';

export const getByDish = asyncHandler(async (req, res) => {
  const { dishId } = req.params;
  const reviews = await reviewService.getReviewsByDish(dishId);
  res.status(200).json(ok(reviews));
});