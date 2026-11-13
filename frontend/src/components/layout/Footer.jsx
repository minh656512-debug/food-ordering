import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
        <div className="space-y-3">
          <div className="text-lg font-extrabold text-white">🍜 FoodOrder<span className="text-orange-500">VN</span></div>
          <p className="text-slate-400">Nền tảng đặt món ăn trực tuyến nhanh chóng, uy tín tại Hà Nội.</p>
          <div className="space-y-1.5 text-slate-300">
            <div>📍 Số 298 đường Cầu Diễn, quận Bắc Từ Liêm, Hà Nội (Đại học Công nghiệp Hà Nội)</div>
            <div>📞 Hotline CSKH: <strong className="text-white">1900 6868</strong> (06:00 – 22:00)</div>
            <div>✉️ Email: <strong className="text-white">hotro@foodorder.vn</strong></div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold uppercase tracking-wider text-white">Liên kết nhanh</h3>
          <div className="flex flex-col space-y-1.5 text-slate-400">
            <Link to="/" className="hover:text-orange-400">Trang chủ</Link>
            <Link to="/search" className="hover:text-orange-400">Thực đơn & Tìm kiếm</Link>
            <Link to="/cart" className="hover:text-orange-400">Giỏ hàng (Quy tắc 1 cửa hàng)</Link>
            <Link to="/orders" className="hover:text-orange-400">Tra cứu đơn hàng</Link>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-bold uppercase tracking-wider text-white">Phương thức thanh toán hỗ trợ</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-blue-300">💳 VNPay QR</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-emerald-300">💵 Tiền mặt (COD)</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-400">
        © 2026 FoodOrder VN — Hệ thống Đặt Món Ăn Trực Tuyến.
      </div>
    </footer>
  );
}
