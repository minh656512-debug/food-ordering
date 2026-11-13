import axiosClient, { USE_MOCK } from './axiosClient';
import { initialMockDb } from '../mocks/mockDatabase';

export const authApi = {
  async login(payload) {
    if (USE_MOCK) {
      const acc = initialMockDb.accounts.find((a) => a.username === payload.username);
      if (!acc) throw { errorCode: 'INVALID_CREDENTIALS', message: 'Sai tên đăng nhập hoặc mật khẩu' };
      if (acc.status === 'LOCKED') throw { errorCode: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa' };
      return { success: true, data: { token: 'mock-jwt-token-' + acc.id, user: acc } };
    }
    return axiosClient.post('/auth/login', payload);
  },
  async register(payload) {
    if (USE_MOCK) {
      return { success: true, message: 'Đăng ký thành công', data: payload };
    }
    return axiosClient.post('/auth/register', payload);
  },
  async logout() {
    if (USE_MOCK) return { success: true };
    return axiosClient.post('/auth/logout');
  },
  async getCustomerProfile() {
    if (USE_MOCK) return { success: true, data: initialMockDb.customers[0] };
    return axiosClient.get('/customers/me');
  },
  async updateCustomerProfile(payload) {
    if (USE_MOCK) return { success: true, data: payload };
    return axiosClient.put('/customers/me', payload);
  },
  async registerShop(payload) {
    if (USE_MOCK) return { success: true, data: { ...payload, status: 'PENDING_APPROVAL' } };
    return axiosClient.post('/shops', payload);
  },
  async approveSeller(sellerId) {
    if (USE_MOCK) return { success: true };
    return axiosClient.patch(`/admin/sellers/${sellerId}/approve`);
  },
};
