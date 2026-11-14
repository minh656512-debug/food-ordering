import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { homePathByRole } from '../../utils/roleHome';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
          ) : (
            <Link to="/login" className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs">Đăng nhập</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
