import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import AppRoutes from '../src/routes/AppRoutes';
import Header from '../src/components/layout/Header';

const PW = 'Password@123';
const renderAt = (path) => {
  let loc;
  const Spy = () => { loc = window.location; return null; };
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider><AuthProvider><AppRoutes /></AuthProvider></ToastProvider>
    </MemoryRouter>
  );
  return utils;
};
const login = async (u, p = PW) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Tên đăng nhập'), u);
  await user.type(screen.getByLabelText('Mật khẩu'), p);
  await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));
  return user;
};

describe('Đăng nhập / phân quyền', () => {
  it('khách hàng đăng nhập đúng -> về trang chủ, thấy món ăn', async () => {
    renderAt('/login');
    await login('kh_an');
    expect(await screen.findByText('Đặt món ngon, giao tận nơi')).toBeInTheDocument();
    expect(await screen.findByText('Cơm tấm sườn nướng')).toBeInTheDocument();
    expect(localStorage.getItem('accessToken')).toBeTruthy();
  });
  it('sai mật khẩu -> báo lỗi, ở lại trang đăng nhập, không lưu token', async () => {
    renderAt('/login');
    await login('kh_an', 'saimatkhau');
    expect(await screen.findByText('Sai tên đăng nhập hoặc mật khẩu')).toBeInTheDocument();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
  it('để trống -> báo lỗi phía giao diện', async () => {
    renderAt('/login');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByText('Vui lòng nhập tên đăng nhập')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng nhập mật khẩu')).toBeInTheDocument();
  });
  it('người bán đăng nhập -> vào khu vực /seller; admin -> /admin', async () => {
    renderAt('/login');
    await login('nb_hung');
    expect(await screen.findByText(/Kênh Người Bán/)).toBeInTheDocument();
  });
  it('admin đăng nhập -> khu vực quản trị', async () => {
    renderAt('/login');
    await login('admin');
    expect(await screen.findByText(/Quản Trị Viên/)).toBeInTheDocument();
  });
  it('chưa đăng nhập vào /cart, /seller/menu, /admin/accounts -> bị chuyển về đăng nhập', async () => {
    for (const p of ['/cart', '/seller/menu', '/admin/accounts']) {
      const { unmount } = renderAt(p);
      expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument();
      unmount();
    }
  });
  it('khách hàng vào /admin/accounts -> bị đẩy về trang khách (không thấy khu quản trị)', async () => {
    localStorage.setItem('accessToken', 't');
    localStorage.setItem('currentUser', JSON.stringify({ accountId: 2, username: 'kh_an', role: 'CUSTOMER', fullName: 'An' }));
    renderAt('/admin/accounts');
    expect(await screen.findByText('Đặt món ngon, giao tận nơi')).toBeInTheDocument();
    expect(screen.queryByText(/Quản Trị Viên/)).toBeNull();
  });
  it('tải lại trang vẫn giữ phiên đăng nhập; đăng xuất xóa token và về /login', async () => {
    localStorage.setItem('accessToken', 't');
    localStorage.setItem('currentUser', JSON.stringify({ accountId: 5, username: 'nb_hung', role: 'SELLER', fullName: 'Hùng' }));
    renderAt('/seller/orders');
    expect(await screen.findByText(/Kênh Người Bán/)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: /Đăng xuất/ }));
    expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });
});

describe('Đăng ký', () => {
  it('kiểm tra dữ liệu phía giao diện', async () => {
    renderAt('/register');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Tên đăng nhập'), 'a');
    await user.type(screen.getByLabelText('Mật khẩu'), '123');
    await user.type(screen.getByLabelText('Nhập lại mật khẩu'), '456');
    await user.type(screen.getByLabelText('Email'), 'sai-email');
    await user.type(screen.getByLabelText('Số điện thoại'), '12');
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }));
    expect(await screen.findByText(/Tên đăng nhập 3–50/)).toBeInTheDocument();
    expect(screen.getByText('Mật khẩu từ 6 đến 72 ký tự')).toBeInTheDocument();
    expect(screen.getByText('Mật khẩu nhập lại không khớp')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng nhập họ tên')).toBeInTheDocument();
    expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument();
    expect(screen.getByText(/Số điện thoại không hợp lệ/)).toBeInTheDocument();
  });
  it('đăng ký hợp lệ -> chuyển sang đăng nhập', async () => {
    renderAt('/register');
    const user = userEvent.setup();
    const u = 'user_' + Math.random().toString(36).slice(2, 8);
    await user.type(screen.getByLabelText('Tên đăng nhập'), u);
    await user.type(screen.getByLabelText('Mật khẩu'), 'abc123');
    await user.type(screen.getByLabelText('Nhập lại mật khẩu'), 'abc123');
    await user.type(screen.getByLabelText('Họ và tên'), 'Nguyen Test');
    await user.type(screen.getByLabelText('Email'), u + '@example.com');
    await user.type(screen.getByLabelText('Số điện thoại'), '0911222' + String(Math.floor(Math.random() * 900 + 100)));
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }));
    expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument();
  });
  it('trùng tên đăng nhập -> báo lỗi ở ô tên đăng nhập', async () => {
    renderAt('/register');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Tên đăng nhập'), 'kh_an');
    await user.type(screen.getByLabelText('Mật khẩu'), 'abc123');
    await user.type(screen.getByLabelText('Nhập lại mật khẩu'), 'abc123');
    await user.type(screen.getByLabelText('Họ và tên'), 'Dup');
    await user.type(screen.getByLabelText('Email'), 'dup' + Date.now() + '@example.com');
    await user.type(screen.getByLabelText('Số điện thoại'), '0933444555');
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }));
    await waitFor(() => expect(screen.getAllByText('Tên đăng nhập đã tồn tại').length).toBeGreaterThan(0));
  });
});

describe('Trang chủ / tìm kiếm', () => {
  it('hiển thị cửa hàng đang mở (không có cửa hàng chờ duyệt), món tạm hết không hiện', async () => {
    renderAt('/');
    expect(await screen.findByText('Cơm Tấm Cô Ba')).toBeInTheDocument();
    expect(screen.getByText('Phở Gia Truyền & Trà Sữa')).toBeInTheDocument();
    expect(screen.queryByText('Bánh Mì Chảo Minh Béo')).toBeNull();
    expect(screen.queryByText('Bún riêu cua')).toBeNull();
  });
  it('lọc theo danh mục và phân trang', async () => {
    renderAt('/');
    const user = userEvent.setup();
    await screen.findByText('Cơm tấm sườn nướng');
    await user.click(screen.getByRole('button', { name: 'Đồ uống' }));
    expect(await screen.findByText('Nước chanh')).toBeInTheDocument();
    expect(screen.queryByText('Cơm tấm sườn nướng')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Tất cả' }));
    await screen.findByText('Cơm tấm sườn nướng');
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(await screen.findByText('Chè khúc bạch')).toBeInTheDocument();
    expect(screen.queryByText('Cơm tấm sườn nướng')).toBeNull();
  });
  it('tìm theo từ khóa trên URL', async () => {
    renderAt('/search?keyword=ph%E1%BB%9F');
    expect(await screen.findByText('Phở bò tái')).toBeInTheDocument();
    expect(screen.queryByText('Nước chanh')).toBeNull();
  });
  it('từ khóa không có kết quả', async () => {
    renderAt('/search?keyword=zzzzzz');
    expect(await screen.findByText('Không tìm thấy món ăn phù hợp.')).toBeInTheDocument();
  });
  it('xem chi tiết món và món không tồn tại', async () => {
    renderAt('/dishes/1');
    expect(await screen.findByRole('heading', { name: 'Cơm tấm sườn nướng' })).toBeInTheDocument();
  });
  it('món không tồn tại -> báo lỗi', async () => {
    renderAt('/dishes/9999');
    expect(await screen.findByText('Không tìm thấy món ăn')).toBeInTheDocument();
  });
  it('khách chưa đăng nhập bấm Thêm giỏ -> chuyển sang đăng nhập', async () => {
    renderAt('/');
    await screen.findByText('Cơm tấm sườn nướng');
    await userEvent.setup().click(screen.getAllByRole('button', { name: '+ Thêm giỏ' })[0]);
    expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument();
  });
});
