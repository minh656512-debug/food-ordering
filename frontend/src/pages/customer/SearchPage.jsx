import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DishBrowser from '../../components/customer/DishBrowser';

export default function SearchPage() {
  const [params] = useSearchParams();
  const keyword = params.get('keyword') || '';
  const shopId = params.get('shopId') || '';

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        {keyword ? <>Kết quả cho “{keyword}”</> : shopId ? 'Món ăn của cửa hàng' : 'Tất cả món ăn'}
      </h1>
      {shopId && (
        <Link to="/search" className="inline-block text-xs text-orange-600 font-semibold">✕ Bỏ lọc cửa hàng</Link>
      )}
      <DishBrowser key={`${keyword}|${shopId}`} keyword={keyword} shopId={shopId} />
    </div>
  );
}
