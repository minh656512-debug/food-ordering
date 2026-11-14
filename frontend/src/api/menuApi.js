import axiosClient, { USE_MOCK } from './axiosClient';
import { initialMockDb } from '../mocks/mockDatabase';

// ---- Dữ liệu giả: trả về cùng dạng với API thật của BE2 ({ items, pagination }) ----
const paginate = (rows, params = {}) => {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  return {
    items: rows.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total: rows.length, totalPages: Math.max(1, Math.ceil(rows.length / limit)) },
  };
};

const openShops = () => initialMockDb.shops.filter((s) => s.status === 'OPEN');

const toMockDish = (d) => {
  const category = initialMockDb.categories.find((c) => c.id === d.categoryId);
  const shop = initialMockDb.shops.find((s) => s.id === d.shopId);
  return {
    id: d.id, name: d.name, description: d.description, price: d.price, image: null, status: d.status,
    category: category ? { id: category.id, name: category.name } : null,
    shop: shop ? { id: shop.id, name: shop.name, address: shop.address, openingHours: shop.openingHours } : null,
  };
};

export const menuApi = {
  async getCategories() {
    if (USE_MOCK) return { success: true, data: initialMockDb.categories };
    return axiosClient.get('/categories');
  },
  async getDishes(params = {}) {
    if (USE_MOCK) {
      const ids = openShops().map((s) => s.id);
      const kw = (params.keyword || '').trim().toLowerCase();
      const rows = initialMockDb.dishes
        .filter((d) => d.status === 'AVAILABLE' && ids.includes(d.shopId))
        .filter((d) => !params.categoryId || d.categoryId === Number(params.categoryId))
        .filter((d) => !params.shopId || d.shopId === Number(params.shopId))
        .filter((d) => !kw || d.name.toLowerCase().includes(kw))
        .map(toMockDish);
      return { success: true, data: paginate(rows, params) };
    }
    return axiosClient.get('/dishes', { params });
  },
  async getDishById(id) {
    if (USE_MOCK) {
      const dish = initialMockDb.dishes.find((d) => d.id === Number(id));
      if (!dish) throw { errorCode: 'DISH_NOT_FOUND', message: 'Không tìm thấy món ăn' };
      return { success: true, data: toMockDish(dish) };
    }
    return axiosClient.get(`/dishes/${id}`);
  },
  async getShops(params = {}) {
    if (USE_MOCK) return { success: true, data: paginate(openShops(), params) };
    return axiosClient.get('/shops', { params });
  },
  async getShopById(id) {
    if (USE_MOCK) {
      const shop = openShops().find((s) => s.id === Number(id));
      if (!shop) throw { errorCode: 'SHOP_NOT_FOUND', message: 'Không tìm thấy cửa hàng' };
      return { success: true, data: shop };
    }
    return axiosClient.get(`/shops/${id}`);
  },
  async getCart() {
    if (USE_MOCK) return { success: true, data: { items: [], totalAmount: 0 } };
    return axiosClient.get('/carts');
  },
  async addToCart(payload) {
    if (USE_MOCK) return { success: true, message: 'Đã thêm vào giỏ hàng', data: payload };
    return axiosClient.post('/carts', payload); // payload: { dishId, quantity }
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
