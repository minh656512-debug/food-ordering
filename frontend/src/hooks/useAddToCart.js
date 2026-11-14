import { useNavigate } from 'react-router-dom';
import { menuApi } from '../api/menuApi';
import { ROLES } from '../utils/constants';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

// Thêm món vào giỏ: bắt đăng nhập, chỉ khách hàng mới có giỏ hàng
export function useAddToCart() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  return async (dish) => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để thêm món vào giỏ');
      navigate('/login');
      return;
    }
    if (user.role !== ROLES.CUSTOMER) {
      toast.error('Chỉ tài khoản khách hàng mới dùng được giỏ hàng');
      return;
    }
    try {
      const res = await menuApi.addToCart({ dishId: dish.id, quantity: 1 });
      toast.success(res.message || 'Đã thêm vào giỏ hàng');
    } catch (err) {
      toast.error(err?.message || 'Không thể thêm vào giỏ hàng');
    }
  };
}
