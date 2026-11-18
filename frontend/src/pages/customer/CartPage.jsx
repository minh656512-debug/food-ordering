import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { menuApi } from '../../api/menuApi';
import { formatMoney } from '../../utils/formatMoney';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await menuApi.getCart();
      setCart(res.data || { items: [], totalAmount: 0 });
    } catch (err) {
      setError(err?.message || 'Không thể tải giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      await menuApi.removeFromCart(itemId);
      await fetchCart();
    } catch (err) {
      alert(err?.message || 'Xóa món thất bại');
    }
  };

  const items = cart?.items || [];
  const totalAmount = items.reduce((sum, item) => {
    const price = Number(item.dish?.price || item.price || 0);
    return sum + price * (item.quantity || 1);
  }, 0);

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Đang tải giỏ hàng của bạn...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Giỏ hàng của bạn</h1>
          <p className="text-xs text-slate-500">Xem và quản lý các món đã chọn trước khi thanh toán</p>
        </div>
        <Link to="/" className="text-xs font-bold text-orange-600 hover:underline">
          ← Thêm món khác
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="text-5xl">🛒</div>
          <h2 className="text-lg font-bold text-slate-900">Giỏ hàng của bạn đang trống</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy khám phá các món ăn ngon và thêm vào giỏ để bắt đầu đặt đơn nhé!
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition"
          >
            Khám phá thực đơn ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {items.map((item) => {
              const dishName = item.dish?.name || item.name || 'Món ăn';
              const price = Number(item.dish?.price || item.price || 0);
              const qty = item.quantity || 1;
              const subtotal = price * qty;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-xl">
                      🍱
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{dishName}</div>
                      <div className="text-xs text-slate-500">
                        {formatMoney(price)} × {qty}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="font-extrabold text-sm text-slate-900">{formatMoney(subtotal)}</div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold p-1"
                      title="Xóa món"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 h-fit shadow-xs">
            <h2 className="font-black text-slate-900 text-base">Tổng quan đơn hàng</h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Số lượng món:</span>
                <span className="font-bold text-slate-900">{items.length} món</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính:</span>
                <span className="font-bold text-slate-900">{formatMoney(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí giao hàng:</span>
                <span className="font-bold text-emerald-600">Miễn phí</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
              <span className="text-lg font-black text-orange-600">{formatMoney(totalAmount)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition"
            >
              Tiến hành thanh toán →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
