import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { formatMoney } from '../../utils/formatMoney';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrderDetail(id);
      setOrder(res.data);
    } catch (err) {
      setError(err?.message || 'Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    setCancelling(true);
    try {
      await orderApi.cancelOrder(id, 'Khách hàng yêu cầu hủy đơn');
      alert('Đã hủy đơn hàng thành công');
      fetchOrder();
    } catch (err) {
      alert(err?.message || 'Hủy đơn thất bại');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Đang tải chi tiết đơn hàng #{id}...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="text-rose-500 font-bold">{error || 'Không tìm thấy đơn hàng.'}</div>
        <Link to="/orders" className="text-xs text-orange-600 hover:underline">
          ← Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const statusLabel = {
    PENDING: { text: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800' },
    CONFIRMED: { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
    PREPARING: { text: 'Đang nấu món', color: 'bg-indigo-100 text-indigo-800' },
    DELIVERING: { text: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800' },
    COMPLETED: { text: 'Giao thành công', color: 'bg-emerald-100 text-emerald-800' },
    CANCELLED: { text: 'Đã hủy', color: 'bg-rose-100 text-rose-800' },
    REJECTED: { text: 'Quán từ chối', color: 'bg-slate-200 text-slate-800' }
  }[order.status] || { text: order.status, color: 'bg-slate-100 text-slate-800' };

  const isPaid = order.payment?.status === 'PAID';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Đơn hàng #{order.id}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${statusLabel.color}`}>
              {statusLabel.text}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đặt lúc: {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Mới đây'}
          </p>
        </div>
        <Link to="/orders" className="text-xs font-bold text-orange-600 hover:underline">
          ← Tất cả đơn hàng
        </Link>
      </div>

      {/* Tình trạng thanh toán */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Phương thức thanh toán</div>
          <div className="font-bold text-slate-900 text-sm">
            {order.payment?.method === 'MOMO' ? '📱 MoMo / VietQR Napas 247' : order.payment?.method || 'Tiền mặt (COD)'}
          </div>
        </div>
        <div>
          {isPaid ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
              ✓ ĐÃ THANH TOÁN
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-black border border-amber-200">
              CHƯA THANH TOÁN
            </span>
          )}
        </div>
      </div>

      {/* Thông tin giao nhận */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
        <h2 className="font-bold text-slate-900 text-sm">Thông tin nhận hàng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400">Người nhận: </span>
            <span className="font-bold text-slate-800">{order.receiverName}</span>
          </div>
          <div>
            <span className="text-slate-400">Số điện thoại: </span>
            <span className="font-bold text-slate-800">{order.receiverPhone}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-400">Địa chỉ: </span>
            <span className="font-bold text-slate-800">{order.deliveryAddress}</span>
          </div>
          {order.note && (
            <div className="sm:col-span-2">
              <span className="text-slate-400">Ghi chú: </span>
              <span className="font-medium text-slate-700 italic">"{order.note}"</span>
            </div>
          )}
        </div>
      </div>

      {/* Chi tiết món ăn */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h2 className="font-bold text-slate-900 text-sm">Danh sách món ăn</h2>
        <div className="divide-y divide-slate-100">
          {(order.items || []).map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900 text-sm">{item.dishName || 'Món ăn'}</div>
                <div className="text-slate-500">
                  {formatMoney(item.price)} × {item.quantity}
                </div>
              </div>
              <div className="font-extrabold text-slate-900 text-sm">{formatMoney(item.subtotal)}</div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
          <span className="font-bold text-slate-900 text-sm">Tổng cộng đơn hàng:</span>
          <span className="font-black text-orange-600 text-lg">{formatMoney(order.totalAmount)}</span>
        </div>
      </div>

      {/* Hành động */}
      {order.status === 'PENDING' && (
        <div className="flex justify-end">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition disabled:opacity-50"
          >
            {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng này'}
          </button>
        </div>
      )}
    </div>
  );
}
