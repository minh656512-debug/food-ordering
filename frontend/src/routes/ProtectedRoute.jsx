import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { homePathByRole } from '../utils/roleHome';

// Chưa đăng nhập -> trang đăng nhập (nhớ trang đang vào); sai vai trò -> về trang của đúng vai trò
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homePathByRole(user.role)} replace />;
  }
  return children;
}
