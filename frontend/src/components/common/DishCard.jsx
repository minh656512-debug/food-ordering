import React from 'react';
import { Link } from 'react-router-dom';
import { formatMoney } from '../../utils/formatMoney';

export default function DishCard({ dish, onAddToCart }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition">
      <div>
        <Link to={`/dishes/${dish.id}`} className="font-bold text-slate-900 hover:text-orange-600 text-base">
          {dish.name}
        </Link>
        <p className="text-xs text-slate-500 mt-1">{dish.description}</p>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="font-extrabold text-orange-600">{formatMoney(dish.price)}</span>
        <button onClick={() => onAddToCart?.(dish)} className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-semibold">
          + Thêm giỏ
        </button>
      </div>
    </div>
  );
}
