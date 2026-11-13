import React, { createContext, useState } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ id: 2, username: 'kh_an', role: 'CUSTOMER', fullName: 'Nguyễn Văn An', loyaltyPoints: 10 });

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.data.user);
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
