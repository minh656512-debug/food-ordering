import React from 'react';

const STYLES = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-slate-800',
};

// Hiển thị danh sách thông báo nổi ở góc phải trên
export default function Toast({ toasts, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((t) => (
        <div key={t.id} role="status" className={`${STYLES[t.type] || STYLES.info} text-white text-sm rounded-xl shadow-lg px-4 py-3 flex items-start justify-between gap-3`}>
          <span>{t.message}</span>
          <button onClick={() => onClose(t.id)} className="font-bold opacity-80 hover:opacity-100" aria-label="Đóng">✕</button>
        </div>
      ))}
    </div>
  );
}
