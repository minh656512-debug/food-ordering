<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React from 'react';
>>>>>>> 539ce53 (fix full backend and frontend)
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { homePathByRole } from '../../utils/roleHome';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
<<<<<<< HEAD
  const [keyword, setKeyword] = useState('');

  const submitSearch = (e) => {
    e.preventDefault();
    const q = keyword.trim();
    navigate(q ? `/search?keyword=${encodeURIComponent(q)}` : '/search');
  };

  const isCustomer = !user || user.role === ROLES.CUSTOMER;

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link to="/" className="font-extrabold text-lg text-slate-900">🍜 FoodOrder<span className="text-orange-600">VN</span></Link>

        <form onSubmit={submitSearch} className="order-last md:order-none w-full md:w-auto md:flex-1 md:max-w-md flex gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm món ăn..."
            aria-label="Tìm món ăn"
            className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button type="submit" className="px-3 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold">Tìm</button>
        </form>

        <nav className="ml-auto flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-orange-600">Trang chủ</Link>
          {isCustomer && <Link to="/cart" className="hover:text-orange-600">🛒 Giỏ hàng</Link>}
          {isCustomer && user && <Link to="/orders" className="hover:text-orange-600">Đơn hàng</Link>}
          {user && !isCustomer && (
            <Link to={homePathByRole(user.role)} className="hover:text-orange-600">Trang quản lý</Link>
          )}
          {user ? (
            <>
              {isCustomer
                ? <Link to="/profile" className="text-orange-600 font-semibold">{user.username}</Link>
                : <span className="text-orange-600 font-semibold">{user.username}</span>}
              <button onClick={logout} className="text-xs text-rose-600 font-semibold">Đăng xuất</button>
            </>
=======

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700">Quản trị</span>;
      case 'SELLER':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">Chủ quán</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">Khách</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-black text-xl text-slate-900 tracking-tight">
          <span className="text-2xl">🍜</span> FoodOrder<span className="text-orange-600">VN</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link to="/" className="text-slate-600 hover:text-orange-600 transition">Trang chủ</Link>
          <Link to="/search" className="text-slate-600 hover:text-orange-600 transition">Tìm món</Link>
          <Link to="/cart" className="text-slate-600 hover:text-orange-600 transition flex items-center gap-1">
            <span>🛒</span> Giỏ hàng
          </Link>
          <Link to="/orders" className="text-slate-600 hover:text-orange-600 transition">Đơn hàng</Link>

          {user?.role === 'SELLER' && (
            <Link to="/seller/orders" className="text-blue-600 font-bold hover:underline">
              Quản lý quán
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link to="/admin/transactions" className="text-purple-600 font-bold hover:underline">
              Quản trị hệ thống
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <Link to="/profile" className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-orange-600">
                <span>{user.fullName || user.username}</span>
                {roleBadge(user.role)}
              </Link>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-rose-600 hover:bg-rose-50 font-semibold transition"
              >
                Đăng xuất
              </button>
            </div>
>>>>>>> 539ce53 (fix full backend and frontend)
          ) : (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
