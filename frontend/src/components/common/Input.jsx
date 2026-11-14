import React from 'react';

export default function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">{label}</label>}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${error ? 'border-rose-500' : 'border-slate-300'} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
