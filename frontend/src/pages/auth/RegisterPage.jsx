import React, { useState } from 'react';
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
    </div>
  );
}
