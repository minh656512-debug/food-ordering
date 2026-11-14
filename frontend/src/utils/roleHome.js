import { ROLES } from './constants';

// Trang đầu tiên của từng vai trò sau khi đăng nhập
export function homePathByRole(role) {
  if (role === ROLES.SELLER) return '/seller/orders';
  if (role === ROLES.ADMIN) return '/admin/statistics';
  return '/';
}
