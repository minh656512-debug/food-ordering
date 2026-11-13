import React from 'react';
import { initialMockDb } from '../../mocks/mockDatabase';
import { formatMoney } from '../../utils/formatMoney';

export default function CategoryManagePage() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Quản lý danh mục món ăn (Use Case 22)</h1>
      <p className="text-xs text-slate-500">
        Component <code>CategoryManagePage</code> kết nối trực tiếp với tầng <code>src/api/</code> và <code>src/mocks/mockDatabase.js</code>.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {initialMockDb.dishes.slice(0, 6).map((dish) => (
          <div key={dish.id} className="p-4 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900">{dish.name}</div>
            <div className="text-xs text-slate-500 mt-1">{dish.description}</div>
            <div className="text-sm font-extrabold text-orange-600 mt-2">{formatMoney(dish.price)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
