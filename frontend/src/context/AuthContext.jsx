import React, { createContext, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

// Khôi phục phiên đăng nhập khi tải lại trang (token + thông tin người dùng lưu ở localStorage)
const readStoredUser = () => {
  try {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return token && user ? user : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const { token, user: loggedIn } = res.data;
    try {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('currentUser', JSON.stringify(loggedIn));
    } catch {
      // Bỏ qua lỗi bộ nhớ (chế độ riêng tư...)
    }
    setUser(loggedIn);
    return loggedIn;
  }, []);

  // Gọi POST /auth/logout, xóa token, về trang đăng nhập. Lỗi mạng cũng không giữ người dùng lại.
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Token vẫn bị xóa ở dưới
    }
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
    } catch {
      // Bỏ qua
    }
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(() => ({ user, setUser, login, logout, isAuthenticated: !!user }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
