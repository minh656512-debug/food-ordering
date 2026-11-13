import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const adminLinks = [
  { to: '/admin/statistics', label: '📊 Thống kê hệ thống' },
  { to: '/admin/sellers', label: '✅ Duyệt người bán' },
  { to: '/admin/accounts', label: '👥 Quản lý tài khoản' },
  { to: '/admin/categories', label: '🗂️ Quản lý danh mục' },
  { to: '/admin/transactions', label: '🔍 Giám sát đơn & giao dịch' },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex max-w-7xl mx-auto px-4 py-6 gap-6">
      <Sidebar title="Quản Trị Viên (ADMIN)" links={adminLinks} />
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}
