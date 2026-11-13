import React from 'react';

export default function Input({ label, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
      <input className={`w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${className}`} {...props} />
    </div>
  );
}
