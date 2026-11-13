import * as reviewRepository from './review.repository.js';

export const getReviewsByDish = async (dishId) => {
  return await reviewRepository.findByDishId(dishId);
};