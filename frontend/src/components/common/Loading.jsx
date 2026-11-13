import React from 'react';

export default function Loading({ text = 'Đang tải dữ liệu...' }) {
  return <div className="p-8 text-center text-sm text-slate-500">{text}</div>;
}
