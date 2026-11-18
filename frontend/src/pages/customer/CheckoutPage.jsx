import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { menuApi } from '../../api/menuApi';
import { orderApi } from '../../api/orderApi';
import { formatMoney } from '../../utils/formatMoney';
import { useAuth } from '../../hooks/useAuth';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  // Thông tin giao hàng
  const [form, setForm] = useState({
    receiverName: user?.fullName || 'Nguyễn Văn An',
    receiverPhone: '0901000001',
    deliveryAddress: '12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội',
    note: '',
    paymentMethod: 'SEPAY'
  });

  // State thanh toán SePay / VietQR
  const [activePayment, setActivePayment] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [copied, setCopied] = useState('');
  const pollTimerRef = useRef(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await menuApi.getCart();
        setCart(res.data);
      } catch (err) {
        setError(err?.message || 'Không thể tải giỏ hàng.');
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCart();

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, []);

  const items = cart?.items || [];
  const totalAmount = items.reduce((sum, item) => {
    const price = Number(item.dish?.price || item.price || 0);
    return sum + price * (item.quantity || 1);
  }, 0);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCopy = (text, field) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      // Fallback
    }
  };

  // Tự động kiểm tra trạng thái thanh toán từ server mỗi 3 giây
  const startPolling = (orderId, paymentId) => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await orderApi.getOrderDetail(orderId);
        const orderData = res.data;

        const isPaid =
          orderData?.paymentStatus === 'PAID' ||
          orderData?.payment?.status === 'PAID';

        if (isPaid) {
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          setPaymentSuccess(true);
          setScanMessage('');

          // Tự động điều hướng sau 2 giây
          setTimeout(() => {
            navigate(`/orders/${orderId}`);
          }, 2000);
          return;
        }

        if (paymentId) {
          const payRes = await orderApi.getPaymentStatus(paymentId);
          if (payRes.data?.status === 'PAID') {
            if (pollTimerRef.current) {
              clearInterval(pollTimerRef.current);
              pollTimerRef.current = null;
            }
            setPaymentSuccess(true);
            setScanMessage('');
            setTimeout(() => {
              navigate(`/orders/${orderId}`);
            }, 2000);
          }
        }
      } catch (err) {
        setScanMessage(err?.message || 'Mất kết nối kiểm tra thanh toán, đang thử lại...');
      }
    }, 3000);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!form.receiverName.trim() || !form.receiverPhone.trim() || !form.deliveryAddress.trim()) {
      setError('Vui lòng điền đầy đủ tên, số điện thoại và địa chỉ giao hàng.');
      return;
    }

    setPlacing(true);
    setError('');
    setScanMessage('');

    try {
      // 1. Tạo đơn hàng
      const orderRes = await orderApi.placeOrder({
        receiverName: form.receiverName.trim(),
        receiverPhone: form.receiverPhone.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        note: form.note.trim() || undefined,
        paymentMethod: form.paymentMethod === 'COD' ? 'COD' : 'SEPAY'
      });

      const orderData = orderRes.data;
      const orderId = orderData.id || orderData.orderId;

      if (form.paymentMethod === 'COD') {
        navigate(`/orders/${orderId}`);
        return;
      }

      // 2. Tạo phiên thanh toán SePay VietQR
      const payRes = await orderApi.createPayment({
        orderId: Number(orderId),
        method: 'SEPAY'
      });

      const payData = payRes.data;
      const paymentId = payData?.payment?.id || orderData.payment?.id || orderId;
      const payTotal = Math.round(Number(orderData.totalAmount || totalAmount));

      const qrUrl =
        payData?.qrUrl ||
        payData?.qrCodeUrl ||
        orderData?.qrUrl ||
        `https://qr.sepay.vn/img?acc=0966517360&bank=MBBank&amount=${payTotal}&des=DH${orderId}`;

      setActivePayment({
        orderId,
        paymentId,
        totalAmount: payTotal,
        qrUrl,
        bankName: 'MBBank',
        accountNumber: '0966517360',
        accountName: 'PHAN HOAI NAM',
        transferContent: `DH${orderId}`
      });

      // 3. Khởi động polling 3 giây/lần
      startPolling(orderId, paymentId);
    } catch (err) {
      setError(err?.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setPlacing(false);
    }
  };

  const handleCloseModal = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    const orderId = activePayment?.orderId;
    setActivePayment(null);
    if (orderId) {
      navigate(`/orders/${orderId}`);
    }
  };

  if (loadingCart) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <p className="text-sm text-slate-500">Đang chuẩn bị trang thanh toán...</p>
      </div>
    );
  }

  if (!loadingCart && items.length === 0 && !activePayment) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">Giỏ hàng đang trống</h2>
          <p className="text-xs text-slate-500">
            Bạn chưa có món ăn nào trong giỏ hàng để thanh toán.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Xem thực đơn món ngon
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Thanh toán đơn hàng</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Vui lòng kiểm tra địa chỉ nhận hàng và chọn phương thức thanh toán.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* MODAL THANH TOÁN VIETQR SEPAY */}
      {activePayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            {paymentSuccess ? (
              /* MÀN HÌNH XÁC NHẬN THANH TOÁN THÀNH CÔNG */
              <div className="p-8 text-center space-y-6">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
                    Đã thanh toán thành công
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Xác nhận nhận tiền thành công
                  </h2>
                  <p className="text-xs text-slate-500">
                    Hệ thống đã tự động ghi nhận chuyển khoản cho đơn hàng <strong>#{activePayment.orderId}</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-2.5 border border-slate-200/80 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mã đơn hàng</span>
                    <span className="font-mono font-medium text-slate-900">#{activePayment.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Người thụ hưởng</span>
                    <span className="font-medium text-slate-900">PHAN HOAI NAM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Số tiền thanh toán</span>
                    <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                      {formatMoney(activePayment.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Trạng thái</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Đã thanh toán (PAID)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Tự động chuyển tiếp đến trang đơn hàng sau 2 giây...
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                    navigate(`/orders/${activePayment.orderId}`);
                  }}
                  className="w-full py-2.5 px-4 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Xem chi tiết đơn hàng
                </button>
              </div>
            ) : (
              /* MÀN HÌNH QUÉT MÃ VIETQR */
              <>
                {/* Header modal */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Quét mã VietQR để thanh toán
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Đơn hàng #{activePayment.orderId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                    title="Đóng cửa sổ"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Nội dung modal */}
                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
                  {/* Khung ảnh QR */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col items-center justify-center">
                    <div className="w-56 h-auto bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs">
                      <img
                        src={activePayment.qrUrl}
                        alt={`Mã VietQR đơn hàng DH${activePayment.orderId}`}
                        className="w-full h-auto object-contain block"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 text-center mt-3">
                      Quét bằng ứng dụng ngân hàng bất kỳ hoặc MoMo
                    </p>
                  </div>

                  {/* Chi tiết tài khoản thanh toán */}
                  <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-slate-500">Số tiền</span>
                      <span className="font-mono font-semibold text-slate-900 text-sm tabular-nums">
                        {formatMoney(activePayment.totalAmount)}
                      </span>
                    </div>

                    <div className="p-3 flex justify-between items-center">
                      <span className="text-slate-500">Nội dung chuyển</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {activePayment.transferContent}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(activePayment.transferContent, 'content')}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          {copied === 'content' ? 'Đã sao chép' : 'Sao chép'}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 flex justify-between items-center">
                      <span className="text-slate-500">Ngân hàng</span>
                      <span className="font-medium text-slate-800">MBBank (Quân Đội)</span>
                    </div>

                    <div className="p-3 flex justify-between items-center">
                      <span className="text-slate-500">Số tài khoản</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-slate-900">
                          {activePayment.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(activePayment.accountNumber, 'acc')}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          {copied === 'acc' ? 'Đã sao chép' : 'Sao chép'}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 flex justify-between items-center">
                      <span className="text-slate-500">Chủ tài khoản</span>
                      <span className="font-medium text-slate-800">{activePayment.accountName}</span>
                    </div>
                  </div>

                  {/* Thông báo lỗi khi polling hoặc kiểm tra thất bại */}
                  {scanMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                      <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{scanMessage}</span>
                    </div>
                  )}

                  {/* Trạng thái lắng nghe tự động (Polling 3s) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Hệ thống tự động xác nhận sau khi nhận được chuyển khoản</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">3s/lần</span>
                  </div>
                </div>

                {/* Footer modal */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full py-2.5 px-4 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Đóng và xem chi tiết đơn hàng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FORM CHECKOUT CHÍNH */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900">Thông tin người nhận</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Họ tên người nhận *
                </label>
                <input
                  name="receiverName"
                  type="text"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={form.receiverName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  name="receiverPhone"
                  type="text"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono"
                  value={form.receiverPhone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Địa chỉ giao hàng *
              </label>
              <input
                name="deliveryAddress"
                type="text"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                value={form.deliveryAddress}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Ghi chú cho quán (không bắt buộc)
              </label>
              <input
                name="note"
                type="text"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ví dụ: Ít cay, giao trước 12h, gọi khi đến nơi..."
                value={form.note}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900">Phương thức thanh toán</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setForm((f) => ({ ...f, paymentMethod: 'SEPAY' }))}
                className={`p-4 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                  form.paymentMethod === 'SEPAY'
                    ? 'border-slate-900 bg-slate-50/60 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="SEPAY"
                  checked={form.paymentMethod === 'SEPAY'}
                  onChange={handleChange}
                  className="mt-0.5 accent-slate-900"
                />
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-900">
                    Chuyển khoản VietQR
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Quét mã QR tự điền thông tin bằng mọi ứng dụng ngân hàng hoặc MoMo. Tự động xác nhận khi nhận tiền.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setForm((f) => ({ ...f, paymentMethod: 'COD' }))}
                className={`p-4 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                  form.paymentMethod === 'COD'
                    ? 'border-slate-900 bg-slate-50/60 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={form.paymentMethod === 'COD'}
                  onChange={handleChange}
                  className="mt-0.5 accent-slate-900"
                />
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-900">
                    Tiền mặt khi nhận hàng (COD)
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Thanh toán trực tiếp bằng tiền mặt cho shipper khi nhận được món ăn.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 h-fit shadow-xs">
          <h2 className="text-sm font-semibold text-slate-900">Đơn hàng ({items.length} món)</h2>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-50">
                <span className="font-normal text-slate-700 truncate max-w-[150px]">
                  {item.dish?.name || item.name} × {item.quantity}
                </span>
                <span className="font-mono text-slate-900 font-medium tabular-nums">
                  {formatMoney(Number(item.dish?.price || item.price || 0) * (item.quantity || 1))}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính</span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">{formatMoney(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí giao hàng</span>
              <span className="font-mono text-slate-900">0đ</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-900">Tổng thanh toán</span>
              <span className="text-base font-semibold text-slate-900 font-mono tabular-nums">
                {formatMoney(totalAmount)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={placing || items.length === 0}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {placing ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng'}
          </button>
        </div>
      </form>
    </div>
  );
}
