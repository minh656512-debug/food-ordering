import React, { useState } from 'react';
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
    </div>
  );
}
