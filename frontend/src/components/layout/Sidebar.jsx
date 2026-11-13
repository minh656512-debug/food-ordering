import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ title, links }) {
  return (
    <aside className="w-64 bg-white rounded-2xl border border-slate-200 p-4 space-y-2 h-fit">
      <div className="font-bold text-sm text-slate-900 pb-2 border-b">{title}</div>
      {links.map((item) => (
        <Link key={item.to} to={item.to} className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100">
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
