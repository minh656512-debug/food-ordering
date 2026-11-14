import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ title, links }) {
  const { user, logout } = useAuth();
  return (
    <aside className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 p-4 space-y-2 h-fit">
      <div className="pb-2 border-b">
        <div className="font-bold text-sm text-slate-900">{title}</div>
        {user && <div className="text-xs text-slate-500 mt-0.5">Xin chào, {user.fullName || user.username}</div>}
      </div>
      <div className="flex flex-row flex-wrap md:flex-col gap-1">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-xl text-xs font-semibold ${isActive ? 'bg-orange-100 text-orange-700' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <button onClick={logout} className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border-t pt-3">
        🚪 Đăng xuất
      </button>
    </aside>
  );
}
