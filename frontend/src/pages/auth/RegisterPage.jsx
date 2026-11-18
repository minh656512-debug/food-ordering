import React, { useState } from 'react';
<<<<<<< HEAD
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ROLES } from '../../utils/constants';
import { homePathByRole } from '../../utils/roleHome';

// Quy tắc kiểm tra khớp với backend (BE1: auth.schema.js)
function validate(f) {
  const e = {};
  if (!/^[a-zA-Z0-9_.]{3,50}$/.test(f.username.trim())) e.username = 'Tên đăng nhập 3–50 ký tự, chỉ gồm chữ, số, dấu _ và dấu chấm';
  if (f.password.length < 6 || f.password.length > 72) e.password = 'Mật khẩu từ 6 đến 72 ký tự';
  if (f.confirmPassword !== f.password) e.confirmPassword = 'Mật khẩu nhập lại không khớp';
  if (!f.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Email không hợp lệ';
  if (!/^(0|\+84)\d{8,10}$/.test(f.phone.trim())) e.phone = 'Số điện thoại không hợp lệ (0xxxxxxxxx hoặc +84xxxxxxxxx)';
  return e;
}

export default function RegisterPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: ROLES.CUSTOMER, username: '', password: '', confirmPassword: '', fullName: '', email: '', phone: '', address: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={homePathByRole(user.role)} replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    const payload = {
      role: form.role,
      username: form.username.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      ...(form.role === ROLES.CUSTOMER && form.address.trim() && { address: form.address.trim() }),
    };

    setSubmitting(true);
    try {
      await authApi.register(payload);
      toast.success(
        form.role === ROLES.SELLER
          ? 'Đăng ký thành công. Tài khoản người bán đang chờ quản trị viên duyệt.'
          : 'Đăng ký thành công, hãy đăng nhập'
      );
      navigate('/login', { replace: true });
    } catch (err) {
      // Lỗi theo từng trường từ backend (VALIDATION_ERROR) hiện ngay dưới ô nhập tương ứng
      if (Array.isArray(err?.errors)) {
        setErrors(Object.fromEntries(err.errors.map((x) => [x.field, x.message])));
      } else if (err?.errorCode === 'USERNAME_ALREADY_USED') {
        setErrors({ username: err.message });
      }
      toast.error(err?.message || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const roleBtn = (value, label) => (
    <button
      type="button"
      onClick={() => setForm((f) => ({ ...f, role: value }))}
      className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold border ${form.role === value ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-700 border-slate-300'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Đăng ký tài khoản</h1>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <div className="flex gap-2">
          {roleBtn(ROLES.CUSTOMER, 'Tôi là khách hàng')}
          {roleBtn(ROLES.SELLER, 'Tôi là người bán')}
        </div>
        <Input label="Tên đăng nhập" name="username" value={form.username} onChange={onChange} error={errors.username} autoComplete="username" />
        <Input label="Mật khẩu" name="password" type="password" value={form.password} onChange={onChange} error={errors.password || errors.newPassword} autoComplete="new-password" />
        <Input label="Nhập lại mật khẩu" name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} error={errors.confirmPassword} autoComplete="new-password" />
        <Input label="Họ và tên" name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} />
        <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
        <Input label="Số điện thoại" name="phone" value={form.phone} onChange={onChange} error={errors.phone} />
        {form.role === ROLES.CUSTOMER && (
          <Input label="Địa chỉ giao hàng (không bắt buộc)" name="address" value={form.address} onChange={onChange} error={errors.address} />
        )}
        {form.role === ROLES.SELLER && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3">Tài khoản người bán cần quản trị viên duyệt trước khi mở cửa hàng.</p>
        )}
        <Button type="submit" disabled={submitting} className="w-full disabled:opacity-60">
          {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>
      </form>
      <p className="text-xs text-slate-500">
        Đã có tài khoản? <Link to="/login" className="text-orange-600 font-semibold">Đăng nhập</Link>
      </p>
=======
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
    <div className="max-w-md mx-auto my-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Đăng ký tài khoản</h1>
        <p className="text-sm text-slate-500">Tạo tài khoản để đặt món hoặc mở cửa hàng</p>
      </div>

      {error && (
        <div className="p-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
          {success}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Vai trò
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: 'CUSTOMER' }))}
              className={`py-2 text-xs font-bold rounded-xl border transition ${
                form.role === 'CUSTOMER'
                  ? 'border-orange-600 bg-orange-50 text-orange-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              👤 Khách hàng
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: 'SELLER' }))}
              className={`py-2 text-xs font-bold rounded-xl border transition ${
                form.role === 'SELLER'
                  ? 'border-orange-600 bg-orange-50 text-orange-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🏪 Người bán / Quán ăn
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tên đăng nhập *
          </label>
          <input
            name="username"
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="vd: nguyenvana"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Mật khẩu *
          </label>
          <input
            name="password"
            type="password"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Tối thiểu 6 ký tự"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Họ và tên *
          </label>
          <input
            name="fullName"
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Nguyễn Văn A"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email *
            </label>
            <input
              name="email"
              type="email"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="a@gmail.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Số điện thoại *
            </label>
            <input
              name="phone"
              type="text"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0901234567"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {form.role === 'CUSTOMER' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Địa chỉ nhận hàng mặc định
            </label>
            <input
              name="address"
              type="text"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Số nhà, tên đường, quận/huyện, tỉnh thành"
              value={form.address}
              onChange={handleChange}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
        >
          {loading ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-bold text-orange-600 hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
>>>>>>> 539ce53 (fix full backend and frontend)
    </div>
  );
}
