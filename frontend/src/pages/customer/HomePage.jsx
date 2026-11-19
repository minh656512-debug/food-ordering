import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { menuApi } from '../../api/menuApi';
import { initialMockDb } from '../../mocks/mockDatabase';
import { formatMoney } from '../../utils/formatMoney';
import { useAuth } from '../../hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartNotice, setCartNotice] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, dishRes] = await Promise.allSettled([
          menuApi.getCategories(),
          menuApi.getDishes()
        ]);

        if (catRes.status === 'fulfilled' && catRes.value?.data) {
          setCategories(catRes.value.data);
        } else {
          setCategories(initialMockDb.categories);
        }

        if (dishRes.status === 'fulfilled' && dishRes.value?.data) {
          setDishes(dishRes.value.data);
        } else {
          setDishes(initialMockDb.dishes);
        }
      } catch {
        setCategories(initialMockDb.categories);
        setDishes(initialMockDb.dishes);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = async (dish) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await menuApi.addToCart({ dishId: dish.id, quantity: 1 });
      setCartNotice(`Đã thêm "${dish.name}" vào giỏ hàng!`);
      setTimeout(() => setCartNotice(''), 3000);
    } catch (err) {
      setCartNotice(err?.message || 'Không thể thêm vào giỏ. Chú ý: Giỏ chỉ chứa món từ 1 quán ăn.');
      setTimeout(() => setCartNotice(''), 4000);
    }
  };

  const filteredDishes = dishes.filter((d) => {
    const matchCat = !selectedCategory || d.categoryId === selectedCategory || d.DANH_MUCMaDanhMuc === selectedCategory;
    const matchSearch = !searchTerm.trim() || d.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            Giao hàng nhanh 24/7
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Món ngon chuẩn vị, giao tận cửa nhà bạn
          </h1>
          <p className="text-orange-100 text-sm">
            Thưởng thức hàng trăm món cơm tấm, bún phở, trà sữa từ các quán ăn uy tín nhất.
          </p>

          <div className="pt-2">
            <input
              type="text"
              placeholder="Tìm kiếm món ăn yêu thích..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-3 rounded-2xl bg-white text-slate-900 text-sm shadow-md focus:outline-none focus:ring-4 focus:ring-orange-300"
            />
          </div>
        </div>
      </div>

      {cartNotice && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white font-medium text-sm flex items-center justify-between shadow-xl animate-fade-in">
          <span>{cartNotice}</span>
          <Link to="/cart" className="px-3 py-1 bg-orange-600 rounded-xl text-xs font-bold hover:bg-orange-700">
            Xem giỏ hàng →
          </Link>
        </div>
      )}

      {/* Categories Tabs */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-slate-900">Danh mục món ăn</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === null
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả món
          </button>
          {categories.map((c) => (
            <button
              key={c.id || c.MaDanhMuc}
              onClick={() => setSelectedCategory(c.id || c.MaDanhMuc)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === (c.id || c.MaDanhMuc)
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.name || c.TenDanhMuc}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">
            {selectedCategory ? 'Món ăn theo danh mục' : 'Món ngon nổi bật'} ({filteredDishes.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Đang tải danh sách món ăn...</div>
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
            Không tìm thấy món ăn phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id || dish.MaMonAn}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="p-5 space-y-2">
                  <div className="h-32 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-4xl mb-3">
                    🍱
                  </div>
                  <div className="font-extrabold text-slate-900 text-base leading-snug">
                    {dish.name || dish.TenMonAn}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {dish.description || dish.MoTa || 'Món ăn chế biến nóng sốt, thơm ngon vệ sinh.'}
                  </p>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-50">
                  <div className="font-black text-orange-600 text-base">
                    {formatMoney(dish.price || dish.GiaBan)}
                  </div>
                  <button
                    onClick={() => handleAddToCart(dish)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <span>+</span> Giỏ hàng
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
