import React, { useState } from 'react';
<<<<<<< HEAD
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ROLES } from '../../utils/constants';
import { homePathByRole } from '../../utils/roleHome';

export default function LoginPage() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Đã đăng nhập rồi thì không cần vào lại trang này
  if (user) return <Navigate to={homePathByRole(user.role)} replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.username.trim()) next.username = 'Vui lòng nhập tên đăng nhập';
    if (!form.password) next.password = 'Vui lòng nhập mật khẩu';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const loggedIn = await login({ username: form.username.trim(), password: form.password });
      toast.success(`Xin chào ${loggedIn.fullName || loggedIn.username}`);
      // Khách hàng quay lại trang đang định vào; người bán / quản trị viên vào trang của mình
      const from = location.state?.from;
      const target = loggedIn.role === ROLES.CUSTOMER && from ? from : homePathByRole(loggedIn.role);
      navigate(target, { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Đăng nhập thất bại, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Đăng nhập</h1>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <Input label="Tên đăng nhập" name="username" value={form.username} onChange={onChange} error={errors.username} autoComplete="username" />
        <Input label="Mật khẩu" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} autoComplete="current-password" />
        <Button type="submit" disabled={submitting} className="w-full disabled:opacity-60">
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
      <p className="text-xs text-slate-500">
        Chưa có tài khoản? <Link to="/register" className="text-orange-600 font-semibold">Đăng ký</Link>
      </p>
=======
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
    <div className="max-w-md mx-auto my-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Đăng nhập tài khoản</h1>
        <p className="text-sm text-slate-500">Hệ thống đặt món ăn trực tuyến FoodOrderVN</p>
      </div>

      {error && (
        <div className="p-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tên đăng nhập
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="vd: kh_an, nb_hung, admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Nhập mật khẩu (mặc định: 123456)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
        >
          {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
        </button>
      </form>

      {/* Tài khoản mẫu tiện thử nghiệm */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
          Tài khoản mẫu thử nghiệm (Mật khẩu: 123456)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillQuickAccount('kh_an', '123456')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:border-orange-500 hover:text-orange-600 text-center transition"
          >
            👤 Khách hàng<br/><span className="text-[10px] text-slate-400">kh_an</span>
          </button>
          <button
            type="button"
            onClick={() => fillQuickAccount('nb_hung', '123456')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:border-orange-500 hover:text-orange-600 text-center transition"
          >
            🏪 Chủ quán<br/><span className="text-[10px] text-slate-400">nb_hung</span>
          </button>
          <button
            type="button"
            onClick={() => fillQuickAccount('admin', '123456')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:border-orange-500 hover:text-orange-600 text-center transition"
          >
            🛡️ Quản trị<br/><span className="text-[10px] text-slate-400">admin</span>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-bold text-orange-600 hover:underline">
          Đăng ký ngay
        </Link>
      </div>
>>>>>>> 539ce53 (fix full backend and frontend)
    </div>
  );
}
