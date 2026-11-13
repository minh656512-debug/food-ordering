import React from 'react';

export default function ShopCard({ shop }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="text-xs font-bold text-emerald-700">{shop.status} • {shop.openingHours}</div>
      <h3 className="font-bold text-lg text-slate-900 mt-1">{shop.name}</h3>
      <p className="text-xs text-slate-500 mt-1">{shop.address} • {shop.phone}</p>
    </div>
  );
}
