import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login({ username: username.trim(), password });
      const user = res.data?.user;

      if (user?.role === 'ADMIN') {
        navigate('/admin/transactions');
      } else if (user?.role === 'SELLER') {
        navigate('/seller/orders');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
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

      {/* Khung đăng nhập nổi lên trên: Tông màu chủ đạo Trắng và Cam */}
      <div className="relative z-10 max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl border border-orange-100 shadow-2xl shadow-orange-950/15 p-7 sm:p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold tracking-wide border border-orange-100">
            <span>🍜</span> FoodOrderVN
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Đăng nhập tài khoản
          </h1>
          <p className="text-xs text-slate-500">
            Khám phá và đặt hàng trăm món ăn hấp dẫn ngay hôm nay
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Tên đăng nhập
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="vd: kh_an, nb_hung, admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              <div className="absolute left-3.5 top-3 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                placeholder="Nhập mật khẩu (mặc định: 123456)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div className="absolute left-3.5 top-3 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md shadow-orange-600/25 hover:shadow-orange-600/35 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99]"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
          </button>
        </form>

        {/* Tài khoản mẫu thử nghiệm */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <p className="text-[11px] font-medium text-slate-400 text-center uppercase tracking-wider">
            Chọn nhanh tài khoản mẫu (Mật khẩu: 123456)
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillQuickAccount('kh_an', '123456')}
              className="p-2 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 text-center transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-slate-700 group-hover:text-orange-600">Khách hàng</div>
              <div className="text-[10px] text-slate-400 font-mono">kh_an</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('nb_hung', '123456')}
              className="p-2 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 text-center transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-slate-700 group-hover:text-orange-600">Chủ quán</div>
              <div className="text-[10px] text-slate-400 font-mono">nb_hung</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('admin', '123456')}
              className="p-2 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 text-center transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-slate-700 group-hover:text-orange-600">Quản trị</div>
              <div className="text-[10px] text-slate-400 font-mono">admin</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
