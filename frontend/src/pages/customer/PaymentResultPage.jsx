import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { formatMoney } from '../../utils/formatMoney';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const rawStatus = searchParams.get('status') || searchParams.get('resultCode');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const isSuccess = rawStatus === 'success' || rawStatus === '0' || rawStatus === 'PAID';

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        const res = await orderApi.getOrderDetail(orderId);
        setOrder(res.data);
      } catch (err) {
        console.error('Không thể lấy chi tiết đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Đang đối soát kết quả giao dịch...</div>;
  }

  return (
    <div className="max-w-lg mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
      {isSuccess ? (
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
            ✓
          </div>
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700">
              Giao dịch thành công
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Thanh toán MoMo thành công!
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Cảm ơn bạn đã đặt món. Quán ăn đã nhận được thông tin và đang chuẩn bị đơn hàng cho bạn.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2.5 border border-slate-200/80 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Mã đơn hàng:</span>
              <span className="font-bold text-slate-900">#{orderId || order?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cổng thanh toán:</span>
              <span className="font-bold text-pink-600">Ví điện tử MoMo (Sandbox)</span>
            </div>
            {order?.totalAmount && (
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền đã trả:</span>
                <span className="font-black text-emerald-600 text-sm">
                  {formatMoney(order.totalAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Trạng thái đơn:</span>
              <span className="font-bold text-emerald-600">ĐÃ THANH TOÁN (PAID)</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(`/orders/${orderId || order?.id}`)}
              className="flex-1 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition"
            >
              Theo dõi đơn hàng →
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
            ✕
          </div>
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-700">
              Giao dịch chưa hoàn tất
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Thanh toán không thành công
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Giao dịch qua MoMo đã bị hủy hoặc chưa hoàn tất. Đơn hàng của bạn vẫn được lưu để thanh toán lại.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {orderId && (
              <button
                onClick={() => navigate(`/checkout`)}
                className="flex-1 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition"
              >
                Thử thanh toán lại
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
