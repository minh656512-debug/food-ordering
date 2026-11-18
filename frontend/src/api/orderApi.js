import axiosClient, { USE_MOCK } from './axiosClient';

export const orderApi = {
  async placeOrder(payload) {
    if (USE_MOCK) return { success: true, message: 'Đặt hàng thành công', data: { orderId: 10, status: 'PENDING', ...payload } };
    return axiosClient.post('/orders', payload);
  },
  async getMyOrders() {
    if (USE_MOCK) return { success: true, data: [] };
    return axiosClient.get('/orders/my');
  },
  async getOrderDetail(orderId) {
    if (USE_MOCK) return { success: true, data: { id: orderId } };
    return axiosClient.get(`/orders/${orderId}`);
  },
  async getPaymentStatus(paymentId) {
    if (USE_MOCK) return { success: true, data: { status: 'PAID' } };
    return axiosClient.get(`/payments/${paymentId}/status`);
  },
  async confirmScanSuccess(paymentId, receivedAmount) {
    if (USE_MOCK) return { success: true, data: { status: 'PAID' } };
    return axiosClient.patch(`/payments/${paymentId}/scan-success`, { receivedAmount });
  },
  async sendWebhook(payload) {
    if (USE_MOCK) return { success: true };
    return axiosClient.post('/payments/webhook', payload);
  },
  async sendSepayWebhook(payload, apiKey = '') {
    if (USE_MOCK) return { success: true };
    const headers = apiKey ? { Authorization: `Apikey ${apiKey}` } : {};
    return axiosClient.post('/payment/sepay/webhook', payload, { headers });
  },
  async cancelOrder(orderId, reason) {
    if (USE_MOCK) return { success: true, data: { orderId, status: 'CANCELLED', reason } };
    return axiosClient.patch(`/orders/${orderId}/cancel`, { reason });
  },
  async rejectOrder(orderId, reason) {
    if (USE_MOCK) return { success: true, data: { orderId, status: 'REJECTED', reason } };
    return axiosClient.patch(`/orders/${orderId}/reject`, { reason });
  },
  async createPayment(payload) {
    if (USE_MOCK) return { success: true, data: { ...payload, status: 'PAID' } };
    return axiosClient.post('/payments', payload);
  },
  async getShopRevenue(shopId, params) {
    if (USE_MOCK) return { success: true, data: { totalRevenue: 230000 } };
    return axiosClient.get(`/shops/${shopId}/statistics/revenue`, { params });
  },
};
