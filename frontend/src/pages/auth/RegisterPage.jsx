import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    role: 'CUSTOMER'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username.trim() || !form.password || !form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(form);
      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err?.message || 'Đăng ký không thành công. Tên đăng nhập hoặc email/sđt có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background hình ảnh món ăn trải rộng toàn màn hình, giữ nguyên các món ăn 4 góc */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url('/auth-bg.jpg')`
        }}
      />

      {/* Lớp phủ mờ dịu giúp ảnh chìm xuống trong suốt tinh tế, chân ảnh khớp tự nhiên với footer tối màu */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-orange-50/20 to-slate-900/40 pointer-events-none backdrop-blur-[0.5px]" />

      {/* Khung đăng ký nổi lên trên: Tông màu chủ đạo Trắng và Cam */}
      <div className="relative z-10 max-w-lg w-full bg-white/95 backdrop-blur-md rounded-3xl border border-orange-100 shadow-2xl shadow-orange-950/15 p-7 sm:p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold tracking-wide border border-orange-100">
            <span>🍜</span> FoodOrderVN
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tạo tài khoản mới
          </h1>
          <p className="text-xs text-slate-500">
            Đăng ký để đặt món giao tận nơi hoặc mở gian hàng ẩm thực
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2">
            <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="leading-relaxed">{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Bạn tham gia với vai trò
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: 'CUSTOMER' }))}
                className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  form.role === 'CUSTOMER'
                    ? 'border-orange-500 bg-orange-50/60 text-orange-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Khách hàng đặt món
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: 'SELLER' }))}
                className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  form.role === 'SELLER'
                    ? 'border-orange-500 bg-orange-50/60 text-orange-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Chủ quán / Bán đồ ăn
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Tên đăng nhập *
              </label>
              <input
                name="username"
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="vd: nguyenvana"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Mật khẩu *
              </label>
              <input
                name="password"
                type="password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Họ và tên *
            </label>
            <input
              name="fullName"
              type="text"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              placeholder="Nguyễn Văn A"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email *
              </label>
              <input
                name="email"
                type="email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="a@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Số điện thoại *
              </label>
              <input
                name="phone"
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                placeholder="0901234567"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {form.role === 'CUSTOMER' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Địa chỉ nhận hàng mặc định (tùy chọn)
              </label>
              <input
                name="address"
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md shadow-orange-600/25 hover:shadow-orange-600/35 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99] mt-2"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
