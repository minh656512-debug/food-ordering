import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { formatMoney } from '../../utils/formatMoney';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getMyOrders();
      setOrders(res.data?.items || res.data || []);
    } catch (err) {
      setError(err?.message || 'Không thể tải lịch sử đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusBadge = (status) => {
    const map = {
      PENDING: { text: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800' },
      CONFIRMED: { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
      PREPARING: { text: 'Đang chuẩn bị', color: 'bg-indigo-100 text-indigo-800' },
      DELIVERING: { text: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
      COMPLETED: { text: 'Đã hoàn tất', color: 'bg-emerald-100 text-emerald-800' },
      CANCELLED: { text: 'Đã hủy', color: 'bg-rose-100 text-rose-800' },
      REJECTED: { text: 'Bị từ chối', color: 'bg-slate-200 text-slate-800' }
    };
    const s = map[status] || { text: status, color: 'bg-slate-100 text-slate-800' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.color}`}>
        {s.text}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Đang tải danh sách đơn hàng...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lịch sử đơn hàng</h1>
          <p className="text-xs text-slate-500">Xem và theo dõi tất cả các đơn bạn đã đặt</p>
        </div>
        <Link to="/" className="text-xs font-bold text-orange-600 hover:underline">
          + Đặt món mới
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="text-4xl">📦</div>
          <h2 className="text-base font-bold text-slate-900">Bạn chưa có đơn hàng nào</h2>
          <p className="text-xs text-slate-500">Hãy đặt ngay món ngon đầu tiên để thưởng thức nhé!</p>
          <Link
            to="/"
            className="inline-block mt-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700"
          >
            Xem thực đơn ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-5 block hover:border-orange-500 hover:shadow-xs transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-sm">Đơn hàng #{o.id}</span>
                  {statusBadge(o.status)}
                </div>
                <div className="font-black text-orange-600 text-base">{formatMoney(o.totalAmount)}</div>
              </div>

              <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                <span>Quán: <strong>{o.shop?.name || 'Quán ăn'}</strong></span>
                <span>Giao đến: {o.deliveryAddress}</span>
                <span>Ngày đặt: {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
