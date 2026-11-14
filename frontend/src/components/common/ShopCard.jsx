import React from 'react';
import { Link } from 'react-router-dom';

const STATUS_LABEL = { OPEN: 'Đang mở cửa', CLOSED: 'Đã đóng cửa' };

export default function ShopCard({ shop }) {
  return (
    <Link to={`/search?shopId=${shop.id}`} className="block bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
      <div className="text-xs font-bold text-emerald-700">
        {STATUS_LABEL[shop.status] || shop.status}{shop.openingHours ? ` • ${shop.openingHours}` : ''}
      </div>
      <h3 className="font-bold text-lg text-slate-900 mt-1">{shop.name}</h3>
      <p className="text-xs text-slate-500 mt-1">{shop.address} • {shop.phone}</p>
      {shop.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{shop.description}</p>}
    </Link>
  );
}
