
import React, {
  createContext,
  useCallback,
  useMemo,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

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
    const authData = res.data;

    if (authData?.token) {
      localStorage.setItem('accessToken', authData.token);
    }

    if (authData?.user) {
      localStorage.setItem(
        'currentUser',
        JSON.stringify(authData.user)
      );
      setUser(authData.user);
    }

    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Bỏ qua lỗi mạng khi logout
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');

    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(() => ({
    user,
    setUser,
    login,
    logout,
    isAuthenticated: !!user
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
