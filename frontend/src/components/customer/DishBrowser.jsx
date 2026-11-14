import React, { useEffect, useState } from 'react';
import { menuApi } from '../../api/menuApi';
import DishCard from '../common/DishCard';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import { useAddToCart } from '../../hooks/useAddToCart';

const PAGE_SIZE = 8;

// Danh sách món ăn có lọc danh mục + phân trang. Dùng ở Trang chủ và Trang tìm kiếm.
// Đổi keyword / shopId thì đặt lại bằng prop `key` ở nơi gọi.
export default function DishBrowser({ keyword = '', shopId = '' }) {
  const addToCart = useAddToCart();
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    menuApi.getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setError('');
    menuApi
      .getDishes({ keyword, shopId, categoryId, page, limit: PAGE_SIZE })
      .then((res) => !cancelled && setResult(res.data))
      .catch((err) => !cancelled && setError(err?.message || 'Không tải được danh sách món ăn'));
    return () => { cancelled = true; };
  }, [keyword, shopId, categoryId, page]);

  const pickCategory = (id) => { setCategoryId(id); setPage(1); };
  const chip = (active) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border ${active ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button className={chip(categoryId === '')} onClick={() => pickCategory('')}>Tất cả</button>
        {categories.map((c) => (
          <button key={c.id} className={chip(categoryId === c.id)} onClick={() => pickCategory(c.id)}>{c.name}</button>
        ))}
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm">{error}</div>}
      {!error && !result && <Loading />}
      {result && result.items.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-500">Không tìm thấy món ăn phù hợp.</div>
      )}
      {result && result.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {result.items.map((dish) => <DishCard key={dish.id} dish={dish} onAddToCart={addToCart} />)}
          </div>
          <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
