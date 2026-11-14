import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { menuApi } from '../../api/menuApi';
import Loading from '../../components/common/Loading';
import { useAddToCart } from '../../hooks/useAddToCart';
import { formatMoney } from '../../utils/formatMoney';

export default function DishDetailPage() {
  const { id } = useParams();
  const addToCart = useAddToCart();
  const [dish, setDish] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setDish(null);
    setError('');
    menuApi
      .getDishById(id)
      .then((res) => !cancelled && setDish(res.data))
      .catch((err) => !cancelled && setError(err?.message || 'Không tải được món ăn'));
    return () => { cancelled = true; };
  }, [id]);

  if (error) {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm">{error}</div>
        <Link to="/" className="text-sm text-orange-600 font-semibold">← Về trang chủ</Link>
      </div>
    );
  }
  if (!dish) return <Loading />;

  const unavailable = dish.status !== 'AVAILABLE';
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 max-w-2xl">
      <Link to="/" className="text-xs text-orange-600 font-semibold">← Quay lại</Link>
      <div className="flex flex-wrap gap-2 text-xs">
        {dish.category && <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-semibold">{dish.category.name}</span>}
        {unavailable && <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">Tạm hết món</span>}
      </div>
      <h1 className="text-2xl font-extrabold">{dish.name}</h1>
      <p className="text-sm text-slate-600">{dish.description || 'Chưa có mô tả.'}</p>
      {dish.shop && (
        <p className="text-sm text-slate-600">
          🏪 <Link to={`/search?shopId=${dish.shop.id}`} className="font-semibold hover:text-orange-600">{dish.shop.name}</Link> — {dish.shop.address}
        </p>
      )}
      <div className="flex items-center justify-between pt-3 border-t">
        <span className="text-xl font-extrabold text-orange-600">{formatMoney(dish.price)}</span>
        <button
          disabled={unavailable}
          onClick={() => addToCart(dish)}
          className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
