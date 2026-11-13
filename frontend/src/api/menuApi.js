import axiosClient, { USE_MOCK } from './axiosClient';
import { initialMockDb } from '../mocks/mockDatabase';

export const menuApi = {
  async getCategories() {
    if (USE_MOCK) return { success: true, data: initialMockDb.categories };
    return axiosClient.get('/categories');
  },
  async getDishes(params = {}) {
    if (USE_MOCK) return { success: true, data: initialMockDb.dishes };
    return axiosClient.get('/dishes', { params });
  },
  async getDishById(id) {
    if (USE_MOCK) {
      const dish = initialMockDb.dishes.find((d) => d.id === Number(id));
      return { success: true, data: dish };
    }
    return axiosClient.get(`/dishes/${id}`);
  },
  async getCart() {
    if (USE_MOCK) return { success: true, data: { items: [], totalAmount: 0 } };
    return axiosClient.get('/cart');
  },
  async addToCart(payload) {
    if (USE_MOCK) return { success: true, data: payload };
    return axiosClient.post('/cart/items', payload);
  },
  async createDish(shopId, payload) {
    if (USE_MOCK) return { success: true, data: payload };
    return axiosClient.post(`/shops/${shopId}/dishes`, payload);
  },
  async createReview(dishId, payload) {
    if (USE_MOCK) return { success: true, data: payload };
    return axiosClient.post(`/dishes/${dishId}/reviews`, payload);
  },
};
