import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const sellerLinks = [
  { to: '/seller/orders', label: '📦 Quản lý đơn hàng' },
  { to: '/seller/menu', label: '🍲 Quản lý thực đơn' },
  { to: '/seller/orders/history', label: '🕒 Lịch sử đơn hàng' },
  { to: '/seller/revenue', label: '📈 Thống kê doanh thu' },
  { to: '/seller/shop-info', label: '🏪 Thông tin cửa hàng' },
  { to: '/seller/register-shop', label: '📝 Đăng ký cửa hàng' },
];

export default function SellerLayout() {
  return (
    <div className="min-h-screen flex max-w-7xl mx-auto px-4 py-6 gap-6">
      <Sidebar title="Kênh Người Bán (SELLER)" links={sellerLinks} />
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}
