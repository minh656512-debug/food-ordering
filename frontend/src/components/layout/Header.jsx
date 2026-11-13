import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
        <Link to="/" className="font-extrabold text-lg text-slate-900">🍜 FoodOrder<span className="text-orange-600">VN</span></Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-orange-600">Trang chủ</Link>
          <Link to="/search" className="hover:text-orange-600">Tìm kiếm</Link>
          <Link to="/cart" className="hover:text-orange-600">Giỏ hàng</Link>
          <Link to="/orders" className="hover:text-orange-600">Đơn hàng</Link>
          {user ? (
            <>
              <Link to="/profile" className="text-orange-600 font-semibold">{user.username}</Link>
              <button onClick={logout} className="text-xs text-rose-600 font-semibold">Đăng xuất</button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs">Đăng nhập</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
