import React from 'react';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-orange-600 hover:bg-orange-500 text-white',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white',
    outline: 'border border-slate-300 hover:bg-slate-100 text-slate-700',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white',
  };
  return (
    <button className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
