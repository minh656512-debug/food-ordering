import React, { useEffect, useState } from 'react';
import { menuApi } from '../../api/menuApi';
import ShopCard from '../../components/common/ShopCard';
import DishBrowser from '../../components/customer/DishBrowser';

export default function HomePage() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    menuApi.getShops({ page: 1, limit: 6 }).then((res) => setShops(res.data.items)).catch(() => {});
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-white p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Đặt món ngon, giao tận nơi</h1>
        <p className="mt-2 text-sm sm:text-base text-orange-50">Chọn món từ các cửa hàng gần bạn, thanh toán tiền mặt hoặc VNPay.</p>
      </section>

      {shops.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Cửa hàng nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Món ăn</h2>
        <DishBrowser />
      </section>
    </div>
  );
}
