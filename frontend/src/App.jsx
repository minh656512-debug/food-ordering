import React, { useState, useMemo } from 'react';
import {
  Utensils, Search, ShoppingBag, User, LogOut, Star, Clock, MapPin, Phone,
  Plus, Minus, Trash2, CheckCircle2, XCircle, AlertTriangle, ChevronRight,
  Store, Package, TrendingUp, Users, ShieldCheck, Layers, CreditCard,
  RefreshCw, Award, Filter, Eye, Edit3, Lock, Unlock, Check, X,
  ArrowLeft, Sparkles, Flame, Receipt, FileText, Heart, Info, Home,
  Compass, ChefHat, Truck, DollarSign, BarChart3, HelpCircle, KeyRound,
  RotateCcw, Printer, SlidersHorizontal, ArrowUpDown,
  Calendar, CheckSquare, ExternalLink, ChevronLeft, Zap, Bell, ChevronDown
} from 'lucide-react';

// ============================================================================
// 1. DỮ LIỆU KHỞI TẠO HỆ THỐNG (ĐẦY ĐỦ 13 BẢNG DỮ LIỆU)
// ============================================================================

const INITIAL_ACCOUNTS = [
  { id: 1, username: 'admin', role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-10-01 08:00:00' },
  { id: 2, username: 'kh_an', role: 'CUSTOMER', status: 'ACTIVE', createdAt: '2026-10-05 09:00:00' },
  { id: 3, username: 'kh_binh', role: 'CUSTOMER', status: 'ACTIVE', createdAt: '2026-10-06 10:30:00' },
  { id: 4, username: 'kh_chau', role: 'CUSTOMER', status: 'ACTIVE', createdAt: '2026-10-07 14:15:00' },
  { id: 5, username: 'nb_hung', role: 'SELLER', status: 'ACTIVE', createdAt: '2026-10-02 08:30:00' },
  { id: 6, username: 'nb_lan', role: 'SELLER', status: 'ACTIVE', createdAt: '2026-10-03 08:45:00' },
  { id: 7, username: 'nb_minh', role: 'SELLER', status: 'PENDING_APPROVAL', createdAt: '2026-11-05 16:00:00' },
];

const INITIAL_CUSTOMERS = [
  { id: 1, fullName: 'Nguyễn Văn An', email: 'an.nguyen@example.com', phone: '0901000001', address: '12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội', loyaltyPoints: 10, accountId: 2 },
  { id: 2, fullName: 'Trần Thị Bình', email: 'binh.tran@example.com', phone: '0901000002', address: '88 Nguyễn Trãi, Thanh Xuân, Hà Nội', loyaltyPoints: 12, accountId: 3 },
  { id: 3, fullName: 'Lê Minh Châu', email: 'chau.le@example.com', phone: '0901000003', address: '5 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', loyaltyPoints: 0, accountId: 4 },
];

const INITIAL_SELLERS = [
  { id: 1, fullName: 'Phạm Quốc Hùng', email: 'hung.pham@example.com', phone: '0902000001', accountId: 5 },
  { id: 2, fullName: 'Đỗ Thị Lan', email: 'lan.do@example.com', phone: '0902000002', accountId: 6 },
  { id: 3, fullName: 'Vũ Đức Minh', email: 'minh.vu@example.com', phone: '0902000003', accountId: 7 },
];

const INITIAL_SHOPS = [
  {
    id: 1,
    name: 'Cơm Tấm Cô Ba',
    address: '25 Tạ Quang Bửu, Hai Bà Trưng, Hà Nội',
    phone: '0243000001',
    description: 'Cơm tấm, bún và đồ uống nấu tại chỗ, giao nhanh trong bán kính 5 km.',
    openHours: '07:00 - 21:00',
    status: 'OPEN',
    rejectReason: null,
    createdAt: '2026-10-02 09:00:00',
    sellerId: 1,
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    name: 'Phở Gia Truyền & Trà Sữa',
    address: '102 Xuân Thủy, Cầu Giấy, Hà Nội',
    phone: '0243000002',
    description: 'Phở nước dùng ninh xương 12 tiếng, thêm trà sữa và đồ ăn vặt.',
    openHours: '06:00 - 22:00',
    status: 'OPEN',
    rejectReason: null,
    createdAt: '2026-10-03 09:00:00',
    sellerId: 2,
    coverImage: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    name: 'Bánh Mì Chảo Minh Béo',
    address: '7 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội',
    phone: '0243000003',
    description: 'Bánh mì chảo, xúc xích, trứng ốp la nóng hổi phục vụ bữa sáng và trưa.',
    openHours: '06:30 - 14:00',
    status: 'PENDING_APPROVAL',
    rejectReason: null,
    createdAt: '2026-11-05 16:10:00',
    sellerId: 3,
    coverImage: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=900&q=80'
  },
];

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Cơm', description: 'Các món cơm', icon: '🍚' },
  { id: 2, name: 'Bún - Phở - Mì', description: 'Các món nước và món trộn', icon: '🍜' },
  { id: 3, name: 'Đồ uống', description: 'Nước ép, trà, cà phê, sinh tố', icon: '🧋' },
  { id: 4, name: 'Ăn vặt', description: 'Món ăn nhẹ, ăn kèm', icon: '🥟' },
  { id: 5, name: 'Tráng miệng', description: 'Chè, bánh ngọt', icon: '🍮' },
];

const INITIAL_DISHES = [
  // Cửa hàng 1: Cơm Tấm Cô Ba (10 món)
  { id: 1, name: 'Cơm tấm sườn nướng', description: 'Sườn nướng mật ong, kèm dưa leo và nước mắm', price: 45000, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 1, shopId: 1 },
  { id: 2, name: 'Cơm tấm sườn bì chả', description: 'Sườn, bì, chả trứng hấp', price: 55000, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 1, shopId: 1 },
  { id: 3, name: 'Cơm gà xối mỡ', description: 'Đùi gà giòn da, cơm vàng', price: 50000, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 1, shopId: 1 },
  { id: 4, name: 'Cơm rang dưa bò', description: 'Cơm rang với dưa cải và thịt bò xào', price: 55000, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 1, shopId: 1 },
  { id: 5, name: 'Bún chả Hà Nội', description: 'Chả nướng than hoa, bún lá, nước chấm chua ngọt', price: 50000, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 2, shopId: 1 },
  { id: 6, name: 'Bún bò Huế', description: 'Nước dùng sả ớt, giò heo, chả cua', price: 55000, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 2, shopId: 1 },
  { id: 7, name: 'Nước chanh', description: 'Chanh tươi vắt, ít đường', price: 15000, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 3, shopId: 1 },
  { id: 8, name: 'Trà đào cam sả', description: 'Trà đen, đào ngâm, cam, sả', price: 30000, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 3, shopId: 1 },
  { id: 9, name: 'Chè khúc bạch', description: 'Khúc bạch, nhãn, hạnh nhân', price: 25000, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 5, shopId: 1 },
  { id: 10, name: 'Nem rán', description: 'Nem rán giòn, 4 cái/phần', price: 35000, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 4, shopId: 1 },

  // Cửa hàng 2: Phở Gia Truyền & Trà Sữa (11 món)
  { id: 11, name: 'Phở bò tái', description: 'Bánh phở, bò tái, nước dùng ninh xương', price: 55000, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 2, shopId: 2 },
  { id: 12, name: 'Phở gà', description: 'Gà ta xé, hành lá, chanh', price: 50000, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 2, shopId: 2 },
  { id: 13, name: 'Mì xào hải sản', description: 'Mì trứng xào tôm, mực, rau cải', price: 60000, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 2, shopId: 2 },
  { id: 14, name: 'Trà sữa trân châu', description: 'Trà sữa, trân châu đen nấu mỗi ngày', price: 35000, image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 3, shopId: 2 },
  { id: 15, name: 'Cà phê sữa đá', description: 'Cà phê phin, sữa đặc', price: 25000, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 3, shopId: 2 },
  { id: 16, name: 'Sinh tố bơ', description: 'Bơ sáp xay với sữa đặc', price: 35000, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 3, shopId: 2 },
  { id: 17, name: 'Bánh flan', description: 'Flan caramel mềm mịn', price: 20000, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 5, shopId: 2 },
  { id: 18, name: 'Khoai tây chiên', description: 'Khoai tây chiên giòn, sốt mayonnaise', price: 30000, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 4, shopId: 2 },
  { id: 19, name: 'Gỏi cuốn tôm thịt', description: '2 cuốn/phần, nước chấm tương đậu phộng', price: 40000, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 4, shopId: 2 },
  { id: 20, name: 'Cơm chiên dương châu', description: 'Cơm chiên trứng, lạp xưởng, tôm', price: 45000, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80', status: 'AVAILABLE', categoryId: 1, shopId: 2 },
  { id: 21, name: 'Bún riêu cua', description: 'Món theo mùa, hiện tạm ngừng bán', price: 50000, image: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=600&q=80', status: 'UNAVAILABLE', categoryId: 2, shopId: 2 },
];

// Giỏ hàng & Chi tiết giỏ hàng
const INITIAL_CARTS = {
  1: [ // Khách hàng 1 (kh_an) -> Cửa hàng 2 (95.000đ)
    { id: 1, dishId: 16, quantity: 1 },
    { id: 2, dishId: 18, quantity: 2 },
  ],
  2: [], // Khách hàng 2 (kh_binh) -> Giỏ trống
  3: [ // Khách hàng 3 (kh_chau) -> Cửa hàng 1 (75.000đ)
    { id: 3, dishId: 1, quantity: 1 },
    { id: 4, dishId: 7, quantity: 2 },
  ],
};

// DON_HANG (9 đơn phủ đủ 7 trạng thái)
const INITIAL_ORDERS = [
  { id: 1, createdAt: '2026-10-20 11:30:00', updatedAt: '2026-10-20 12:40:00', totalAmount: 105000, status: 'COMPLETED', recipientName: 'Nguyễn Văn An', recipientPhone: '0901000001', deliveryAddress: '12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội', note: 'Ít cơm', reason: null, customerId: 1, shopId: 1 },
  { id: 2, createdAt: '2026-10-21 18:45:00', updatedAt: '2026-10-21 19:50:00', totalAmount: 125000, status: 'COMPLETED', recipientName: 'Trần Thị Bình', recipientPhone: '0901000002', deliveryAddress: '88 Nguyễn Trãi, Thanh Xuân, Hà Nội', note: null, reason: null, customerId: 2, shopId: 2 },
  { id: 3, createdAt: '2026-11-06 09:15:00', updatedAt: '2026-11-06 09:50:00', totalAmount: 80000, status: 'DELIVERING', recipientName: 'Nguyễn Văn An', recipientPhone: '0901000001', deliveryAddress: '12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội', note: 'Gọi trước khi giao', reason: null, customerId: 1, shopId: 2 },
  { id: 4, createdAt: '2026-11-06 10:05:00', updatedAt: '2026-11-06 10:05:00', totalAmount: 80000, status: 'PENDING', recipientName: 'Lê Minh Châu', recipientPhone: '0901000003', deliveryAddress: '5 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', note: null, reason: null, customerId: 3, shopId: 1 },
  { id: 5, createdAt: '2026-11-01 12:00:00', updatedAt: '2026-11-01 12:10:00', totalAmount: 55000, status: 'CANCELLED', recipientName: 'Trần Thị Bình', recipientPhone: '0901000002', deliveryAddress: '88 Nguyễn Trãi, Thanh Xuân, Hà Nội', note: null, reason: 'Khách đổi ý, hủy khi đơn đang chờ xác nhận', customerId: 2, shopId: 1 },
  { id: 6, createdAt: '2026-11-02 19:20:00', updatedAt: '2026-11-02 19:30:00', totalAmount: 95000, status: 'REJECTED', recipientName: 'Lê Minh Châu', recipientPhone: '0901000003', deliveryAddress: '5 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', note: null, reason: 'Quán hết nguyên liệu mì xào hải sản', customerId: 3, shopId: 2 },
  { id: 7, createdAt: '2026-11-06 09:40:00', updatedAt: '2026-11-06 09:55:00', totalAmount: 105000, status: 'PREPARING', recipientName: 'Nguyễn Văn An', recipientPhone: '0901000001', deliveryAddress: '12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội', note: null, reason: null, customerId: 1, shopId: 1 },
  { id: 8, createdAt: '2026-11-06 10:20:00', updatedAt: '2026-11-06 10:21:00', totalAmount: 95000, status: 'PENDING', recipientName: 'Trần Thị Bình', recipientPhone: '0901000002', deliveryAddress: '88 Nguyễn Trãi, Thanh Xuân, Hà Nội', note: 'Thanh toán lại sau', reason: null, customerId: 2, shopId: 2 },
  { id: 9, createdAt: '2026-11-06 09:55:00', updatedAt: '2026-11-06 10:02:00', totalAmount: 100000, status: 'CONFIRMED', recipientName: 'Lê Minh Châu', recipientPhone: '0901000003', deliveryAddress: '5 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', note: null, reason: null, customerId: 3, shopId: 2 },
];

// CHITIET_DON_HANG
const INITIAL_ORDER_ITEMS = [
  { id: 1, orderId: 1, dishId: 1, quantity: 2, unitPrice: 45000 },
  { id: 2, orderId: 1, dishId: 7, quantity: 1, unitPrice: 15000 },
  { id: 3, orderId: 2, dishId: 11, quantity: 1, unitPrice: 55000 },
  { id: 4, orderId: 2, dishId: 14, quantity: 2, unitPrice: 35000 },
  { id: 5, orderId: 3, dishId: 12, quantity: 1, unitPrice: 50000 },
  { id: 6, orderId: 3, dishId: 18, quantity: 1, unitPrice: 30000 },
  { id: 7, orderId: 4, dishId: 3, quantity: 1, unitPrice: 50000 },
  { id: 8, orderId: 4, dishId: 8, quantity: 1, unitPrice: 30000 },
  { id: 9, orderId: 5, dishId: 2, quantity: 1, unitPrice: 55000 },
  { id: 10, orderId: 6, dishId: 13, quantity: 1, unitPrice: 60000 },
  { id: 11, orderId: 6, dishId: 16, quantity: 1, unitPrice: 35000 },
  { id: 12, orderId: 7, dishId: 5, quantity: 1, unitPrice: 50000 },
  { id: 13, orderId: 7, dishId: 6, quantity: 1, unitPrice: 55000 },
  { id: 14, orderId: 8, dishId: 20, quantity: 1, unitPrice: 45000 },
  { id: 15, orderId: 8, dishId: 15, quantity: 2, unitPrice: 25000 },
  { id: 16, orderId: 9, dishId: 19, quantity: 2, unitPrice: 40000 },
  { id: 17, orderId: 9, dishId: 17, quantity: 1, unitPrice: 20000 },
];

// THANH_TOAN
const INITIAL_PAYMENTS = [
  { id: 1, transactionCode: 'VNP20261020001', method: 'VNPAY', amount: 105000, status: 'PAID', paidAt: '2026-10-20 11:32:00', orderId: 1 },
  { id: 2, transactionCode: 'VNP20261021001', method: 'VNPAY', amount: 125000, status: 'PAID', paidAt: '2026-10-21 18:47:00', orderId: 2 },
  { id: 3, transactionCode: 'VNP20261106001', method: 'VNPAY', amount: 80000, status: 'PAID', paidAt: '2026-11-06 09:16:00', orderId: 3 },
  { id: 4, transactionCode: null, method: 'VNPAY', amount: 80000, status: 'UNPAID', paidAt: null, orderId: 4 },
  { id: 5, transactionCode: 'VNP20261101001', method: 'VNPAY', amount: 55000, status: 'REFUNDED', paidAt: '2026-11-01 12:02:00', orderId: 5 },
  { id: 6, transactionCode: 'MOCK20261102001', method: 'MOCK', amount: 95000, status: 'REFUNDED', paidAt: '2026-11-02 19:22:00', orderId: 6 },
  { id: 7, transactionCode: 'VNP20261106002', method: 'VNPAY', amount: 105000, status: 'PAID', paidAt: '2026-11-06 09:42:00', orderId: 7 },
  { id: 8, transactionCode: null, method: 'VNPAY', amount: 95000, status: 'FAILED', paidAt: null, orderId: 8 },
  { id: 9, transactionCode: 'MOCK20261106001', method: 'MOCK', amount: 100000, status: 'PAID', paidAt: '2026-11-06 09:57:00', orderId: 9 },
];

// HOAN_TIEN
const INITIAL_REFUNDS = [
  { id: 1, amount: 55000, reason: 'Khách hủy đơn khi đơn đang chờ xác nhận', refundedAt: '2026-11-01 12:10:00', paymentId: 5 },
  { id: 2, amount: 95000, reason: 'Người bán từ chối đơn: hết nguyên liệu', refundedAt: '2026-11-02 19:30:00', paymentId: 6 },
];

// DANH_GIA
const INITIAL_REVIEWS = [
  { id: 1, rating: 5, comment: 'Sườn nướng thơm, cơm dẻo, giao đúng giờ.', createdAt: '2026-10-20 13:10:00', customerId: 1, dishId: 1, orderId: 1 },
  { id: 2, rating: 4, comment: 'Nước chanh vừa miệng, hơi nhiều đá.', createdAt: '2026-10-20 13:12:00', customerId: 1, dishId: 7, orderId: 1 },
  { id: 3, rating: 5, comment: 'Nước phở đậm vị, bò mềm.', createdAt: '2026-10-21 20:15:00', customerId: 2, dishId: 11, orderId: 2 },
  { id: 4, rating: 4, comment: 'Trân châu dai ngon, trà hơi ngọt.', createdAt: '2026-10-21 20:17:00', customerId: 2, dishId: 14, orderId: 2 },
];

// ============================================================================
// 2. HÀM TIỆN ÍCH & HẰNG SỐ GIAO DIỆN
// ============================================================================

const formatVND = (amount) => {
  return Number(amount || 0).toLocaleString('vi-VN') + ' đ';
};

const ORDER_STATUS_META = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  PREPARING: { label: 'Đang chuẩn bị', color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  DELIVERING: { label: 'Đang giao hàng', color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  COMPLETED: { label: 'Hoàn tất', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Đã hủy (Khách)', color: 'bg-stone-200 text-stone-700 border-stone-300', dot: 'bg-stone-500' },
  REJECTED: { label: 'Từ chối (Quán)', color: 'bg-rose-100 text-rose-800 border-rose-200', dot: 'bg-rose-500' },
};

const PAYMENT_STATUS_META = {
  UNPAID: { label: 'Chưa thanh toán', color: 'bg-stone-100 text-stone-700 border-stone-300' },
  PAID: { label: 'Đã thanh toán', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  FAILED: { label: 'Thanh toán lỗi', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const SHOP_STATUS_META = {
  OPEN: { label: 'Đang mở cửa', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CLOSED: { label: 'Tạm đóng cửa', color: 'bg-stone-200 text-stone-700 border-stone-300' },
  PENDING_APPROVAL: { label: 'Chờ phê duyệt', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  REJECTED: { label: 'Bị từ chối', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

const PRESET_FOOD_IMAGES = [
  { label: 'Cơm tấm sườn', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80' },
  { label: 'Phở / Bún bò', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80' },
  { label: 'Gà rán / Cơm gà', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80' },
  { label: 'Trà sữa / Đồ uống', url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Bánh ngọt / Flan', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80' },
  { label: 'Ăn vặt / Nem rán', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' },
];

const STORAGE_KEY = 'FOODHUB_VN_PRODUCTION_STATE';

const loadSavedState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed[key] !== undefined ? parsed[key] : fallback;
  } catch (e) {
    return fallback;
  }
};

// ============================================================================
// 3. COMPONENT CHÍNH (APP)
// ============================================================================

export default function App() {
  // --- STATE DỮ LIỆU HỆ THỐNG (LƯU BỀN VỮNG TRONG LOCALSTORAGE) ---
  const [accounts, setAccounts] = useState(() => loadSavedState('accounts', INITIAL_ACCOUNTS));
  const [customers, setCustomers] = useState(() => loadSavedState('customers', INITIAL_CUSTOMERS));
  const [sellers, setSellers] = useState(() => loadSavedState('sellers', INITIAL_SELLERS));
  const [shops, setShops] = useState(() => loadSavedState('shops', INITIAL_SHOPS));
  const [categories, setCategories] = useState(() => loadSavedState('categories', INITIAL_CATEGORIES));
  const [dishes, setDishes] = useState(() => loadSavedState('dishes', INITIAL_DISHES));
  const [carts, setCarts] = useState(() => loadSavedState('carts', INITIAL_CARTS));
  const [orders, setOrders] = useState(() => loadSavedState('orders', INITIAL_ORDERS));
  const [orderItems, setOrderItems] = useState(() => loadSavedState('orderItems', INITIAL_ORDER_ITEMS));
  const [payments, setPayments] = useState(() => loadSavedState('payments', INITIAL_PAYMENTS));
  const [refunds, setRefunds] = useState(() => loadSavedState('refunds', INITIAL_REFUNDS));
  const [reviews, setReviews] = useState(() => loadSavedState('reviews', INITIAL_REVIEWS));

  // Lưu tự động vào localStorage mỗi khi dữ liệu thay đổi
  React.useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          accounts,
          customers,
          sellers,
          shops,
          categories,
          dishes,
          carts,
          orders,
          orderItems,
          payments,
          refunds,
          reviews,
        })
      );
    } catch (e) {
      // Ignore quota errors
    }
  }, [accounts, customers, sellers, shops, categories, dishes, carts, orders, orderItems, payments, refunds, reviews]);

  // --- STATE ĐĂNG NHẬP & ĐIỀU HƯỚNG ---
  const [currentAccountId, setCurrentAccountId] = useState(2); // Mặc định đăng nhập Nguyễn Văn An
  const [customerPage, setCustomerPage] = useState('home'); // home | search | dish-detail | shop-detail | cart | checkout | orders | order-detail | profile
  const [sellerPage, setSellerPage] = useState('orders'); // orders | history | menu | shop-info | revenue
  const [adminPage, setAdminPage] = useState('statistics'); // statistics | approvals | accounts | categories | transactions
  const [authTab, setAuthTab] = useState('login'); // login | register

  // --- STATE GIAO DIỆN & DROPDOWN TÀI KHOẢN ---
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [quickCartOpen, setQuickCartOpen] = useState(false);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState(null);

  // --- STATE CHI TIẾT & BỘ LỌC KHÁCH HÀNG ---
  const [selectedDishId, setSelectedDishId] = useState(1);
  const [selectedShopId, setSelectedShopId] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showSearchSuggest, setShowSearchSuggest] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [filterShopId, setFilterShopId] = useState('ALL');
  const [priceRangeFilter, setPriceRangeFilter] = useState('ALL'); // ALL | UNDER_30K | 30K_50K | OVER_50K
  const [onlyAvailableFilter, setOnlyAvailableFilter] = useState(false);
  const [priceSort, setPriceSort] = useState('DEFAULT'); // DEFAULT | BEST_SELLING | ASC | DESC | RATING
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [dishDetailQty, setDishDetailQty] = useState(1);
  const [shopDetailCatId, setShopDetailCatId] = useState('ALL');
  const [adminAccountRoleFilter, setAdminAccountRoleFilter] = useState('ALL');
  const [adminAccountSearch, setAdminAccountSearch] = useState('');

  // --- STATE MODALS & THÔNG BÁO (TOAST) ---
  const [toast, setToast] = useState(null);
  const [conflictCartModal, setConflictCartModal] = useState(null);
  const [paymentSandboxModal, setPaymentSandboxModal] = useState(null);
  const [cancelOrderModal, setCancelOrderModal] = useState(null);
  const [rejectOrderModal, setRejectOrderModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [dishFormModal, setDishFormModal] = useState(null);
  const [categoryFormModal, setCategoryFormModal] = useState(null);
  const [rejectShopModal, setRejectShopModal] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Hàm ghi nhận thao tác nội bộ (giữ tương thích luồng xử lý)
  const recordApiCall = () => {};

  // Hàm Khôi phục dữ liệu mặc định ban đầu
  const handleResetDatabaseSeed = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAccounts(INITIAL_ACCOUNTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSellers(INITIAL_SELLERS);
    setShops(INITIAL_SHOPS);
    setCategories(INITIAL_CATEGORIES);
    setDishes(INITIAL_DISHES);
    setCarts(INITIAL_CARTS);
    setOrders(INITIAL_ORDERS);
    setOrderItems(INITIAL_ORDER_ITEMS);
    setPayments(INITIAL_PAYMENTS);
    setRefunds(INITIAL_REFUNDS);
    setReviews(INITIAL_REVIEWS);
    setCurrentAccountId(2);
    setCustomerPage('home');
    setAccountMenuOpen(false);
    showToast('Đã khôi phục toàn bộ dữ liệu mặc định của hệ thống!', 'info');
  };

  // --- THÔNG TIN NGƯỜI DÙNG HIỆN TẠI ---
  const currentAccount = useMemo(
    () => accounts.find((a) => a.id === currentAccountId) || null,
    [accounts, currentAccountId]
  );

  const currentCustomer = useMemo(
    () => (currentAccount?.role === 'CUSTOMER' ? customers.find((c) => c.accountId === currentAccount.id) : null),
    [customers, currentAccount]
  );

  const currentSeller = useMemo(
    () => (currentAccount?.role === 'SELLER' ? sellers.find((s) => s.accountId === currentAccount.id) : null),
    [sellers, currentAccount]
  );

  const currentSellerShop = useMemo(
    () => (currentSeller ? shops.find((sh) => sh.sellerId === currentSeller.id) : null),
    [shops, currentSeller]
  );

  const getAccountDisplayName = (acc) => {
    if (!acc) return '';
    if (acc.role === 'CUSTOMER') {
      return customers.find((c) => c.accountId === acc.id)?.fullName || acc.username;
    }
    if (acc.role === 'SELLER') {
      const s = sellers.find((sl) => sl.accountId === acc.id);
      const sh = s ? shops.find((shop) => shop.sellerId === s.id) : null;
      return sh ? sh.name : s?.fullName || acc.username;
    }
    return 'Quản trị viên Hệ thống';
  };

  // --- TÍNH SỐ LƯỢNG ĐÃ BÁN & ĐIỂM ĐÁNH GIÁ TRUNG BÌNH ---
  const getDishSoldCount = (dishId) => {
    const validOrderIds = orders.filter((o) => o.status === 'COMPLETED').map((o) => o.id);
    return orderItems
      .filter((oi) => oi.dishId === dishId && validOrderIds.includes(oi.orderId))
      .reduce((sum, oi) => sum + oi.quantity, 0);
  };

  const getDishRatingInfo = (dishId) => {
    const dishReviews = reviews.filter((r) => r.dishId === dishId);
    if (dishReviews.length === 0) return { avg: 0, count: 0, reviews: [] };
    const sum = dishReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avg: Number((sum / dishReviews.length).toFixed(1)),
      count: dishReviews.length,
      reviews: dishReviews,
    };
  };

  const getShopRatingInfo = (shopId) => {
    const shopDishIds = dishes.filter((d) => d.shopId === shopId).map((d) => d.id);
    const shopReviews = reviews.filter((r) => shopDishIds.includes(r.dishId));
    if (shopReviews.length === 0) return { avg: 'Mới', count: 0, reviews: [] };
    const sum = shopReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avg: (sum / shopReviews.length).toFixed(1),
      count: shopReviews.length,
      reviews: shopReviews,
    };
  };

  // --- GIỎ HÀNG CỦA KHÁCH HÀNG HIỆN TẠI ---
  const currentCartItems = useMemo(() => {
    if (!currentCustomer) return [];
    const rawItems = carts[currentCustomer.id] || [];
    return rawItems
      .map((item) => {
        const dish = dishes.find((d) => d.id === item.dishId);
        const shop = dish ? shops.find((s) => s.id === dish.shopId) : null;
        return dish ? { ...item, dish, shop, subtotal: dish.price * item.quantity } : null;
      })
      .filter(Boolean);
  }, [carts, currentCustomer, dishes, shops]);

  const currentCartTotal = useMemo(
    () => currentCartItems.reduce((sum, item) => sum + item.subtotal, 0),
    [currentCartItems]
  );

  const currentCartShop = useMemo(
    () => (currentCartItems.length > 0 ? currentCartItems[0].shop : null),
    [currentCartItems]
  );

  // --- CHUYỂN ĐỔI TÀI KHOẢN MƯỢT MÀ ---
  const handleQuickSwitchAccount = (accountId) => {
    setAccountMenuOpen(false);
    if (!accountId) {
      setCurrentAccountId(null);
      return;
    }
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return;
    if (acc.status === 'LOCKED') {
      showToast('Tài khoản này hiện đang bị khóa!', 'error');
      return;
    }
    setCurrentAccountId(acc.id);
    if (acc.role === 'CUSTOMER') setCustomerPage('home');
    if (acc.role === 'SELLER') setSellerPage(acc.status === 'PENDING_APPROVAL' ? 'shop-info' : 'orders');
    if (acc.role === 'ADMIN') setAdminPage('statistics');
    showToast(`Xin chào, ${getAccountDisplayName(acc)}!`, 'info');
  };

  // --- NGHIỆP VỤ GIỎ HÀNG (QUY TẮC 1 GIỎ CHỈ CHỨA MÓN CỦA 1 CỬA HÀNG) ---
  const handleAddToCart = (dish, quantity = 1) => {
    if (!currentCustomer) {
      recordApiCall('POST', '/api/v1/cart/items', 401, 'Chưa đăng nhập tài khoản khách hàng', null, 'UNAUTHORIZED');
      showToast('Vui lòng đăng nhập tài khoản Khách hàng để đặt món!', 'error');
      setCurrentAccountId(null);
      return;
    }
    const targetShop = shops.find((s) => s.id === dish.shopId);
    if (!targetShop || targetShop.status !== 'OPEN') {
      recordApiCall('POST', '/api/v1/cart/items', 400, 'Cửa hàng đang đóng cửa hoặc chưa duyệt', null, 'SHOP_CLOSED');
      showToast(`Cửa hàng "${targetShop?.name || ''}" hiện đang đóng cửa hoặc chưa duyệt!`, 'error');
      return;
    }
    if (dish.status !== 'AVAILABLE') {
      recordApiCall('POST', '/api/v1/cart/items', 400, 'Món ăn đã tạm ngừng bán', null, 'DISH_OUT_OF_STOCK');
      showToast(`Món "${dish.name}" hiện đang tạm ngừng bán!`, 'error');
      return;
    }

    const existingCart = carts[currentCustomer.id] || [];
    if (existingCart.length > 0) {
      const firstDish = dishes.find((d) => d.id === existingCart[0].dishId);
      if (firstDish && firstDish.shopId !== dish.shopId) {
        const currentShop = shops.find((s) => s.id === firstDish.shopId);
        recordApiCall(
          'POST',
          '/api/v1/cart/items',
          409,
          'Một giỏ hàng chỉ chứa món của một cửa hàng',
          null,
          'CART_SHOP_CONFLICT'
        );
        setConflictCartModal({
          dish,
          quantity,
          currentShopName: currentShop?.name || 'Cửa hàng cũ',
          newShopName: targetShop.name,
        });
        return;
      }
    }

    setCarts((prev) => {
      const list = prev[currentCustomer.id] || [];
      const foundIndex = list.findIndex((i) => i.dishId === dish.id);
      let updated;
      if (foundIndex > -1) {
        updated = list.map((item, idx) =>
          idx === foundIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        updated = [...list, { id: Date.now(), dishId: dish.id, quantity }];
      }
      return { ...prev, [currentCustomer.id]: updated };
    });

    recordApiCall('POST', '/api/v1/cart/items', 201, `Đã thêm ${quantity}x ${dish.name} vào giỏ`, {
      dishId: dish.id,
      quantity,
    });
    showToast(`Đã thêm ${quantity}x "${dish.name}" vào giỏ hàng!`);
  };

  const confirmReplaceCartWithNewShop = () => {
    if (!conflictCartModal || !currentCustomer) return;
    const { dish, quantity } = conflictCartModal;
    setCarts((prev) => ({
      ...prev,
      [currentCustomer.id]: [{ id: Date.now(), dishId: dish.id, quantity }],
    }));
    setConflictCartModal(null);
    recordApiCall('PUT', '/api/v1/cart/replace', 200, `Đã làm mới giỏ hàng sang quán mới và thêm ${dish.name}`);
    showToast(`Đã làm mới giỏ hàng và thêm "${dish.name}"!`);
  };

  const handleUpdateCartQty = (dishId, delta) => {
    if (!currentCustomer) return;
    setCarts((prev) => {
      const list = prev[currentCustomer.id] || [];
      const updated = list
        .map((item) => (item.dishId === dishId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity >= 1);
      return { ...prev, [currentCustomer.id]: updated };
    });
    recordApiCall('PATCH', `/api/v1/cart/items/${dishId}`, 200, 'Cập nhật số lượng và tính lại TongTamTinh');
  };

  const handleRemoveCartItem = (dishId) => {
    if (!currentCustomer) return;
    setCarts((prev) => {
      const list = prev[currentCustomer.id] || [];
      return { ...prev, [currentCustomer.id]: list.filter((item) => item.dishId !== dishId) };
    });
    recordApiCall('DELETE', `/api/v1/cart/items/${dishId}`, 204, 'Đã xóa món khỏi giỏ hàng');
    showToast('Đã xóa món ăn khỏi giỏ hàng', 'info');
  };

  const handleClearCart = () => {
    if (!currentCustomer) return;
    setCarts((prev) => ({ ...prev, [currentCustomer.id]: [] }));
    recordApiCall('DELETE', '/api/v1/cart', 204, 'Đã làm trống giỏ hàng');
    showToast('Đã xóa toàn bộ món trong giỏ hàng', 'info');
  };

  // --- ĐẶT LẠI ĐƠN CŨ (RE-ORDER) ---
  const handleReorder = (order) => {
    if (!currentCustomer) return;
    const shop = shops.find((s) => s.id === order.shopId);
    if (!shop || shop.status !== 'OPEN') {
      showToast('Cửa hàng của đơn này hiện đang đóng cửa!', 'error');
      return;
    }
    const items = orderItems.filter((oi) => oi.orderId === order.id);
    const availableNewCart = [];
    items.forEach((it, idx) => {
      const dish = dishes.find((d) => d.id === it.dishId);
      if (dish && dish.status === 'AVAILABLE') {
        availableNewCart.push({ id: Date.now() + idx, dishId: dish.id, quantity: it.quantity });
      }
    });
    if (availableNewCart.length === 0) {
      showToast('Các món trong đơn này hiện đều tạm ngừng bán!', 'error');
      return;
    }
    setCarts((prev) => ({ ...prev, [currentCustomer.id]: availableNewCart }));
    recordApiCall('POST', `/api/v1/orders/${order.id}/reorder`, 200, 'Đã sao chép món từ đơn cũ vào giỏ hàng');
    showToast(`Đã thêm ${availableNewCart.length} món từ đơn #${order.id} vào giỏ hàng!`);
    setCustomerPage('cart');
  };

  // --- NGHIỆP VỤ ĐẶT HÀNG & THANH TOÁN (UC7, UC8) ---
  const handlePlaceOrder = ({ recipientName, recipientPhone, deliveryAddress, note, paymentMethod }) => {
    if (!currentCustomer || currentCartItems.length === 0) return;

    const shop = currentCartShop;
    if (!shop || shop.status !== 'OPEN') {
      showToast('Cửa hàng hiện đã đóng cửa, không thể đặt hàng!', 'error');
      return;
    }
    const unavailableItem = currentCartItems.find((i) => i.dish.status !== 'AVAILABLE');
    if (unavailableItem) {
      showToast(`Món "${unavailableItem.dish.name}" vừa ngừng bán, vui lòng xóa khỏi giỏ!`, 'error');
      return;
    }

    const newOrderId = Math.max(0, ...orders.map((o) => o.id)) + 1;
    const nowStr = '2026-11-09 21:15:00';

    const newOrder = {
      id: newOrderId,
      createdAt: nowStr,
      updatedAt: nowStr,
      totalAmount: currentCartTotal,
      status: 'PENDING',
      recipientName,
      recipientPhone,
      deliveryAddress,
      note: note || null,
      reason: null,
      customerId: currentCustomer.id,
      shopId: shop.id,
    };

    const newItems = currentCartItems.map((item, idx) => ({
      id: Math.max(0, ...orderItems.map((oi) => oi.id)) + idx + 1,
      orderId: newOrderId,
      dishId: item.dish.id,
      quantity: item.quantity,
      unitPrice: item.dish.price,
    }));

    const newPaymentId = Math.max(0, ...payments.map((p) => p.id)) + 1;
    const newPayment = {
      id: newPaymentId,
      transactionCode: null,
      method: paymentMethod,
      amount: currentCartTotal,
      status: 'UNPAID',
      paidAt: null,
      orderId: newOrderId,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setOrderItems((prev) => [...prev, ...newItems]);
    setPayments((prev) => [...prev, newPayment]);
    setCarts((prev) => ({ ...prev, [currentCustomer.id]: [] }));
    setSelectedOrderId(newOrderId);

    recordApiCall('POST', '/api/v1/orders', 201, 'Đặt hàng thành công', {
      orderId: newOrderId,
      totalAmount: currentCartTotal,
      status: 'PENDING',
    });

    if (paymentMethod === 'COD') {
      showToast(`Đặt hàng thành công (Mã đơn #${newOrderId})! Thanh toán COD khi nhận hàng.`);
      setCustomerPage('order-detail');
    } else {
      setPaymentSandboxModal({
        orderId: newOrderId,
        paymentId: newPaymentId,
        amount: currentCartTotal,
        method: paymentMethod,
      });
    }
  };

  const handleCompleteSandboxPayment = (isSuccess) => {
    if (!paymentSandboxModal) return;
    const { orderId, paymentId, method, amount } = paymentSandboxModal;
    const nowStr = '2026-11-09 21:16:00';
    const txPrefix = method === 'VNPAY' ? 'VNP' : 'MOCK';
    const generatedTxCode = `${txPrefix}20261109${String(paymentId).padStart(3, '0')}`;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: isSuccess ? 'PAID' : 'FAILED',
              transactionCode: isSuccess ? generatedTxCode : null,
              paidAt: isSuccess ? nowStr : null,
            }
          : p
      )
    );

    recordApiCall(
      'POST',
      '/api/v1/payments',
      isSuccess ? 200 : 400,
      isSuccess ? `Thanh toán ${method} thành công` : `Thanh toán ${method} thất bại`,
      { orderId, status: isSuccess ? 'PAID' : 'FAILED', transactionCode: isSuccess ? generatedTxCode : null },
      isSuccess ? null : 'PAYMENT_FAILED'
    );

    setPaymentSandboxModal(null);
    setSelectedOrderId(orderId);
    setCustomerPage('order-detail');

    if (isSuccess) {
      showToast(`Thanh toán ${formatVND(amount)} qua ${method} thành công! Mã GD: ${generatedTxCode}`);
    } else {
      showToast(`Giao dịch ${method} thất bại! Đơn #${orderId} vẫn được giữ để bạn thanh toán lại.`, 'error');
    }
  };

  // --- NGHIỆP VỤ KHÁCH HỦY ĐƠN (UC10) & TỰ ĐỘNG HOÀN TIỀN NẾU ĐÃ PAID ---
  const handleCustomerCancelOrder = (order, reason) => {
    if (order.status !== 'PENDING') {
      showToast('Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận (PENDING)!', 'error');
      return;
    }
    const nowStr = '2026-11-09 21:20:00';
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: 'CANCELLED', reason, updatedAt: nowStr } : o
      )
    );

    const payment = payments.find((p) => p.orderId === order.id);
    if (payment && payment.status === 'PAID') {
      setPayments((prev) =>
        prev.map((p) => (p.id === payment.id ? { ...p, status: 'REFUNDED' } : p))
      );
      const newRefundId = Math.max(0, ...refunds.map((r) => r.id)) + 1;
      setRefunds((prev) => [
        ...prev,
        {
          id: newRefundId,
          amount: payment.amount,
          reason: `Khách hủy đơn: ${reason}`,
          refundedAt: nowStr,
          paymentId: payment.id,
        },
      ]);
      recordApiCall('PATCH', `/api/v1/orders/${order.id}/cancel`, 200, 'Đã hủy đơn và tạo bản ghi hoàn tiền', {
        orderId: order.id,
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED',
      });
      showToast(`Đã hủy đơn #${order.id} và tự động hoàn tiền ${formatVND(payment.amount)}!`);
    } else {
      recordApiCall('PATCH', `/api/v1/orders/${order.id}/cancel`, 200, 'Đã hủy đơn hàng thành công');
      showToast(`Đã hủy đơn hàng #${order.id} thành công.`);
    }
    setCancelOrderModal(null);
  };

  // --- NGHIỆP VỤ NGƯỜI BÁN XỬ LÝ ĐƠN HÀNG (UC16, UC18) & TÍCH ĐIỂM ---
  const handleSellerAdvanceOrderStatus = (order) => {
    const nextStatusMap = {
      PENDING: { status: 'CONFIRMED', action: 'confirm' },
      CONFIRMED: { status: 'PREPARING', action: 'prepare' },
      PREPARING: { status: 'DELIVERING', action: 'deliver' },
      DELIVERING: { status: 'COMPLETED', action: 'complete' },
    };
    const nextInfo = nextStatusMap[order.status];
    if (!nextInfo) return;
    const nextStatus = nextInfo.status;

    const nowStr = '2026-11-09 21:25:00';
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus, updatedAt: nowStr } : o))
    );

    if (nextStatus === 'COMPLETED') {
      setPayments((prev) =>
        prev.map((p) =>
          p.orderId === order.id && p.status === 'UNPAID'
            ? { ...p, status: 'PAID', paidAt: nowStr, transactionCode: `COD20261109${order.id}` }
            : p
        )
      );
      const earnedPoints = Math.floor(order.totalAmount / 10000);
      if (earnedPoints > 0) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === order.customerId ? { ...c, loyaltyPoints: c.loyaltyPoints + earnedPoints } : c
          )
        );
      }
      recordApiCall(
        'PATCH',
        `/api/v1/orders/${order.id}/${nextInfo.action}`,
        200,
        `Hoàn tất đơn #${order.id}, cộng +${earnedPoints} điểm tích lũy`,
        { orderId: order.id, status: 'COMPLETED', earnedPoints }
      );
      showToast(`Đơn #${order.id} đã HOÀN TẤT! Khách hàng được +${earnedPoints} điểm tích lũy.`);
    } else {
      recordApiCall(
        'PATCH',
        `/api/v1/orders/${order.id}/${nextInfo.action}`,
        200,
        `Chuyển trạng thái đơn sang ${nextStatus}`
      );
      showToast(`Đơn #${order.id} đã chuyển sang trạng thái: ${ORDER_STATUS_META[nextStatus].label}`);
    }
  };

  const handleSellerRejectOrder = (order, reason) => {
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      showToast('Chỉ được từ chối đơn khi ở trạng thái PENDING hoặc CONFIRMED!', 'error');
      return;
    }
    const nowStr = '2026-11-09 21:28:00';
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: 'REJECTED', reason, updatedAt: nowStr } : o
      )
    );

    const payment = payments.find((p) => p.orderId === order.id);
    if (payment && payment.status === 'PAID') {
      setPayments((prev) =>
        prev.map((p) => (p.id === payment.id ? { ...p, status: 'REFUNDED' } : p))
      );
      const newRefundId = Math.max(0, ...refunds.map((r) => r.id)) + 1;
      setRefunds((prev) => [
        ...prev,
        {
          id: newRefundId,
          amount: payment.amount,
          reason: `Người bán từ chối đơn: ${reason}`,
          refundedAt: nowStr,
          paymentId: payment.id,
        },
      ]);
      recordApiCall('PATCH', `/api/v1/orders/${order.id}/reject`, 200, 'Từ chối đơn và hoàn tiền thành công');
      showToast(`Đã từ chối đơn #${order.id} và hoàn tiền ${formatVND(payment.amount)} cho khách!`);
    } else {
      recordApiCall('PATCH', `/api/v1/orders/${order.id}/reject`, 200, 'Từ chối đơn thành công');
      showToast(`Đã từ chối đơn #${order.id}.`);
    }
    setRejectOrderModal(null);
  };

  // --- NGHIỆP VỤ ĐÁNH GIÁ MÓN ĂN (UC12) ---
  const handleSubmitReview = ({ orderId, dishId, rating, comment }) => {
    if (!currentCustomer) return;
    const exists = reviews.some((r) => r.orderId === orderId && r.dishId === dishId);
    if (exists) {
      showToast('Bạn đã đánh giá món ăn này trong đơn hàng này rồi!', 'error');
      return;
    }
    const newReview = {
      id: Math.max(0, ...reviews.map((r) => r.id)) + 1,
      rating: Number(rating),
      comment: comment.trim() || 'Món ăn rất ngon, đóng gói cẩn thận!',
      createdAt: '2026-11-09 21:30:00',
      customerId: currentCustomer.id,
      dishId,
      orderId,
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewModal(null);
    recordApiCall('POST', `/api/v1/dishes/${dishId}/reviews`, 201, 'Đánh giá món ăn thành công', newReview);
    showToast('Cảm ơn bạn đã gửi đánh giá món ăn!');
  };

  // ============================================================================
  // 4. MENU CHUYỂN ĐỔI TÀI KHOẢN THƯƠNG MẠI (ACCOUNT SWITCHER POPOVER)
  // ============================================================================

  const renderAccountDropdownMenu = () => {
    if (!accountMenuOpen) return null;
    return (
      <>
        <div
          className="fixed inset-0 z-40"
          onClick={() => setAccountMenuOpen(false)}
        />
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-stone-200/90 py-3 z-50 text-stone-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Thông tin tài khoản đang đăng nhập */}
          {currentAccount && (
            <div className="px-4 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white font-extrabold text-base flex items-center justify-center shadow-sm">
                  {getAccountDisplayName(currentAccount).charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-stone-900 truncate">
                    {getAccountDisplayName(currentAccount)}
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    @{currentAccount.username} •{' '}
                    {currentAccount.role === 'CUSTOMER'
                      ? 'Khách hàng thành viên'
                      : currentAccount.role === 'SELLER'
                      ? 'Đối tác Cửa hàng'
                      : 'Quản trị viên'}
                  </p>
                </div>
              </div>

              {currentCustomer && (
                <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-xs">
                  <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" /> Điểm thưởng tích lũy
                  </span>
                  <span className="font-extrabold text-amber-700">{currentCustomer.loyaltyPoints} điểm</span>
                </div>
              )}
            </div>
          )}

          {/* Điều hướng cá nhân cho Khách hàng */}
          {currentAccount?.role === 'CUSTOMER' && (
            <div className="py-1.5 px-2 border-b border-stone-100">
              <button
                onClick={() => {
                  setCustomerPage('profile');
                  setAccountMenuOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors"
              >
                <User className="w-4 h-4 text-stone-400" /> Hồ sơ cá nhân & Bảo mật
              </button>
              <button
                onClick={() => {
                  setCustomerPage('orders');
                  setAccountMenuOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors"
              >
                <Receipt className="w-4 h-4 text-stone-400" /> Đơn hàng của tôi
              </button>
            </div>
          )}

          {/* Chuyển đổi nhanh tài khoản */}
          <div className="py-2 px-3 border-b border-stone-100 max-h-64 overflow-y-auto">
            <p className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
              Chuyển đổi nhanh tài khoản
            </p>
            <div className="space-y-1">
              {accounts.map((acc) => {
                const isCurrent = acc.id === currentAccountId;
                const displayName = getAccountDisplayName(acc);
                const roleBadge =
                  acc.role === 'CUSTOMER'
                    ? { text: 'Khách hàng', cls: 'bg-orange-50 text-orange-700' }
                    : acc.role === 'SELLER'
                    ? {
                        text: acc.status === 'PENDING_APPROVAL' ? 'Quán mới' : 'Cửa hàng',
                        cls: 'bg-amber-50 text-amber-700',
                      }
                    : { text: 'Quản trị', cls: 'bg-emerald-50 text-emerald-700' };

                return (
                  <button
                    key={acc.id}
                    onClick={() => handleQuickSwitchAccount(acc.id)}
                    className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-orange-50/90 border border-orange-200 text-orange-700'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${
                          isCurrent ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {displayName.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold truncate">{displayName}</p>
                        <p className="text-[10px] text-stone-400">@{acc.username}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${roleBadge.cls}`}>
                      {roleBadge.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tiện ích & Đăng xuất */}
          <div className="pt-1.5 px-2 space-y-1">
            <button
              onClick={handleResetDatabaseSeed}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 flex items-center gap-2.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" /> Khôi phục dữ liệu mặc định
            </button>
            <button
              onClick={() => {
                handleQuickSwitchAccount(null);
                showToast('Đã đăng xuất khỏi hệ thống', 'info');
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
            </button>
          </div>
        </div>
      </>
    );
  };

  // ============================================================================
  // 5. MÀN HÌNH ĐĂNG NHẬP & ĐĂNG KÝ
  // ============================================================================

  const AuthView = () => {
    const [loginUsername, setLoginUsername] = useState('kh_an');
    const [loginPassword, setLoginPassword] = useState('123456');
    const [regForm, setRegForm] = useState({
      username: '',
      password: '',
      role: 'CUSTOMER',
      fullName: '',
      email: '',
      phone: '',
      address: '',
    });

    const handleLoginSubmit = (e) => {
      e.preventDefault();
      const found = accounts.find((a) => a.username.toLowerCase() === loginUsername.trim().toLowerCase());
      if (!found) {
        showToast('Tên đăng nhập không tồn tại!', 'error');
        return;
      }
      if (found.status === 'LOCKED') {
        showToast('Tài khoản của bạn đã bị khóa bởi Quản trị viên!', 'error');
        return;
      }
      handleQuickSwitchAccount(found.id);
    };

    const handleRegisterSubmit = (e) => {
      e.preventDefault();
      if (!regForm.username.trim() || !regForm.fullName.trim() || !regForm.email.trim() || !regForm.phone.trim()) {
        showToast('Vui lòng điền đầy đủ các trường bắt buộc!', 'error');
        return;
      }
      if (accounts.some((a) => a.username.toLowerCase() === regForm.username.trim().toLowerCase())) {
        showToast('Tên đăng nhập này đã được sử dụng, vui lòng chọn tên khác!', 'error');
        return;
      }
      const emailExists =
        customers.some((c) => c.email.toLowerCase() === regForm.email.trim().toLowerCase()) ||
        sellers.some((s) => s.email.toLowerCase() === regForm.email.trim().toLowerCase());
      if (emailExists) {
        showToast('Địa chỉ Email này đã được đăng ký!', 'error');
        return;
      }

      const newAccId = Math.max(0, ...accounts.map((a) => a.id)) + 1;
      const newAcc = {
        id: newAccId,
        username: regForm.username.trim(),
        role: regForm.role,
        status: regForm.role === 'SELLER' ? 'PENDING_APPROVAL' : 'ACTIVE',
        createdAt: '2026-11-10 20:00:00',
      };
      setAccounts((prev) => [...prev, newAcc]);

      if (regForm.role === 'CUSTOMER') {
        const newCustId = Math.max(0, ...customers.map((c) => c.id)) + 1;
        setCustomers((prev) => [
          ...prev,
          {
            id: newCustId,
            fullName: regForm.fullName,
            email: regForm.email,
            phone: regForm.phone,
            address: regForm.address || 'Hà Nội',
            loyaltyPoints: 0,
            accountId: newAccId,
          },
        ]);
        setCarts((prev) => ({ ...prev, [newCustId]: [] }));
      } else {
        const newSellerId = Math.max(0, ...sellers.map((s) => s.id)) + 1;
        setSellers((prev) => [
          ...prev,
          {
            id: newSellerId,
            fullName: regForm.fullName,
            email: regForm.email,
            phone: regForm.phone,
            accountId: newAccId,
          },
        ]);
      }

      setCurrentAccountId(newAccId);
      if (regForm.role === 'CUSTOMER') setCustomerPage('home');
      if (regForm.role === 'SELLER') setSellerPage('shop-info');
      showToast(`Chào mừng ${regForm.fullName} đến với FoodHub!`);
    };

    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden grid md:grid-cols-5">
          {/* Cột trái: Banner thương hiệu */}
          <div className="md:col-span-2 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold tracking-tight">FoodHub</span>
                  <p className="text-xs text-orange-100">Đặt món ngon • Giao nóng hổi</p>
                </div>
              </div>
              <h2 className="text-2xl font-bold leading-snug mb-3">
                Thưởng thức ẩm thực chuẩn vị ngay tại nhà!
              </h2>
              <p className="text-sm text-orange-100 leading-relaxed">
                Kết nối thực khách với hàng trăm quán ăn uy tín tại Hà Nội. Tích điểm đổi quà, thanh toán trực tuyến an toàn và nhanh chóng.
              </p>
            </div>

            <div className="relative z-10 mt-8 bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/15 space-y-2">
              <div className="flex items-center gap-2 text-amber-200 text-xs font-bold">
                <Sparkles className="w-4 h-4" /> Đặc quyền Thành viên FoodHub
              </div>
              <p className="text-xs text-orange-50 leading-relaxed">
                Miễn phí giao hàng bán kính 5km và tích lũy điểm thưởng cho mọi đơn hàng hoàn tất.
              </p>
            </div>
          </div>

          {/* Cột phải: Form Đăng nhập / Đăng ký */}
          <div className="md:col-span-3 p-8">
            <div className="flex gap-2 p-1 bg-stone-100 rounded-xl mb-6">
              <button
                onClick={() => setAuthTab('login')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  authTab === 'login' ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setAuthTab('register')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  authTab === 'register' ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-600 hover:bg-stone-900'
                }`}
              >
                Đăng ký tài khoản
              </button>
            </div>

            {authTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập của bạn..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all"
                >
                  Đăng nhập
                </button>

                <div className="pt-4 border-t border-stone-100">
                  <p className="text-xs text-stone-500 mb-2.5 font-semibold">
                    Đăng nhập nhanh bằng tài khoản có sẵn:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {accounts.map((acc) => (
                      <button
                        type="button"
                        key={acc.id}
                        onClick={() => handleQuickSwitchAccount(acc.id)}
                        className="text-left p-2 rounded-xl bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-orange-200 transition-all flex items-center justify-between"
                      >
                        <div className="truncate pr-1">
                          <p className="text-xs font-bold text-stone-800 truncate">{getAccountDisplayName(acc)}</p>
                          <p className="text-[10px] text-stone-400">@{acc.username}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-stone-200 font-bold text-stone-600 shrink-0">
                          {acc.role === 'CUSTOMER' ? 'Khách' : acc.role === 'SELLER' ? 'Quán' : 'Admin'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Tên đăng nhập *</label>
                    <input
                      type="text"
                      required
                      value={regForm.username}
                      onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                      placeholder="vd: kh_tuan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Loại tài khoản *</label>
                    <select
                      value={regForm.role}
                      onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm bg-white"
                    >
                      <option value="CUSTOMER">Khách hàng đặt món</option>
                      <option value="SELLER">Đối tác Nhà hàng / Quán ăn</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={regForm.fullName}
                      onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                      placeholder="Nguyễn Văn Tuấn"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Số điện thoại *</label>
                    <input
                      type="text"
                      required
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="0901234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="tuan.nguyen@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>

                {regForm.role === 'CUSTOMER' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Địa chỉ nhận hàng</label>
                    <input
                      type="text"
                      value={regForm.address}
                      onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                      placeholder="Số nhà, đường, quận/huyện, Hà Nội"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Đăng ký ngay
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 6. GIAO DIỆN KHÁCH HÀNG (CUSTOMER LAYOUT)
  // ============================================================================

  const renderCustomerLayout = () => {
    // Lọc món ăn đa chiều
    const filteredDishes = dishes.filter((dish) => {
      const shop = shops.find((s) => s.id === dish.shopId);
      if (!shop || ['PENDING_APPROVAL', 'REJECTED'].includes(shop.status)) return false;

      const matchCategory = selectedCategoryId === 'ALL' || dish.categoryId === Number(selectedCategoryId);
      const matchShop = filterShopId === 'ALL' || dish.shopId === Number(filterShopId);
      const matchAvail = !onlyAvailableFilter || (dish.status === 'AVAILABLE' && shop.status === 'OPEN');

      let matchPrice = true;
      if (priceRangeFilter === 'UNDER_30K') matchPrice = dish.price < 30000;
      if (priceRangeFilter === '30K_50K') matchPrice = dish.price >= 30000 && dish.price <= 50000;
      if (priceRangeFilter === 'OVER_50K') matchPrice = dish.price > 50000;

      const kw = searchKeyword.trim().toLowerCase();
      const matchKeyword =
        !kw ||
        dish.name.toLowerCase().includes(kw) ||
        (dish.description && dish.description.toLowerCase().includes(kw)) ||
        shop.name.toLowerCase().includes(kw);

      return matchCategory && matchShop && matchAvail && matchPrice && matchKeyword;
    });

    // Sắp xếp món ăn
    if (priceSort === 'ASC') filteredDishes.sort((a, b) => a.price - b.price);
    if (priceSort === 'DESC') filteredDishes.sort((a, b) => b.price - a.price);
    if (priceSort === 'BEST_SELLING') {
      filteredDishes.sort((a, b) => getDishSoldCount(b.id) - getDishSoldCount(a.id));
    }
    if (priceSort === 'RATING') {
      filteredDishes.sort((a, b) => getDishRatingInfo(b.id).avg - getDishRatingInfo(a.id).avg);
    }

    // Phân trang
    const totalPages = Math.max(1, Math.ceil(filteredDishes.length / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedDishes = filteredDishes.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

    // Gợi ý Autocomplete trên thanh tìm kiếm
    const kwSuggest = searchKeyword.trim().toLowerCase();
    const searchSuggestions = !kwSuggest
      ? { dishes: [], shops: [] }
      : {
          dishes: dishes.filter((d) => d.name.toLowerCase().includes(kwSuggest)).slice(0, 4),
          shops: shops
            .filter((s) => s.status === 'OPEN' && s.name.toLowerCase().includes(kwSuggest))
            .slice(0, 2),
        };

    const customerOrders = orders.filter((o) => o.customerId === currentCustomer?.id);
    const filteredCustomerOrders = customerOrders.filter((o) => {
      const matchSt = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      const kw = orderSearchQuery.trim().toLowerCase();
      const shop = shops.find((s) => s.id === o.shopId);
      const matchKw =
        !kw ||
        String(o.id).includes(kw) ||
        (shop && shop.name.toLowerCase().includes(kw)) ||
        o.recipientName.toLowerCase().includes(kw);
      return matchSt && matchKw;
    });

    return (
      <div className="min-h-screen bg-[#FFFDF9] text-stone-800 flex flex-col">
        {/* TOPBAR THƯƠNG MẠI (CAM ĐỎ) */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-200" />
                Giao đến: <strong className="underline cursor-pointer" onClick={() => setCustomerPage('profile')}>{currentCustomer?.address || 'Cầu Giấy, Hà Nội'}</strong>
              </span>
              <span className="hidden sm:inline text-white/40">|</span>
              <span className="hidden sm:flex items-center gap-1 text-orange-100">
                <Flame className="w-3.5 h-3.5 text-amber-300" /> Miễn phí giao hàng bán kính 5km
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleQuickSwitchAccount(5)}
                className="hover:text-amber-200 font-semibold transition-colors hidden md:inline"
              >
                Kênh Đối tác Cửa hàng
              </button>
              <span className="hidden md:inline text-white/40">|</span>
              <span className="flex items-center gap-1 text-orange-100">
                <Phone className="w-3 h-3" /> Hotline: 1900 6868
              </span>
            </div>
          </div>
        </div>

        {/* HEADER KHÁCH HÀNG CHÍNH (STICKY) */}
        <header className="bg-white/95 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
            {/* Logo thương hiệu */}
            <button
              onClick={() => setCustomerPage('home')}
              className="flex items-center gap-3 text-left group shrink-0"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent tracking-tight">
                  FoodHub
                </span>
                <span className="block text-[11px] text-stone-500 font-medium">
                  Giao nhanh • Món ngon nóng hổi
                </span>
              </div>
            </button>

            {/* Ô tìm kiếm thông minh có Autocomplete Dropdown */}
            <div className="hidden md:flex items-center flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-orange-500 absolute left-3.5" />
              <input
                type="text"
                value={searchKeyword}
                onFocus={() => setShowSearchSuggest(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggest(false), 200)}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCustomerPage('search');
                    setShowSearchSuggest(false);
                  }
                }}
                placeholder="Tìm cơm tấm, phở bò, trà sữa, quán ngon..."
                className="w-full pl-10 pr-20 py-2.5 bg-stone-100/80 border border-stone-200/80 focus:border-orange-500 focus:bg-white rounded-full text-sm outline-none transition-all"
              />
              {searchKeyword && (
                <button
                  onClick={() => {
                    setSearchKeyword('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-14 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setCustomerPage('search')}
                className="absolute right-1.5 px-3.5 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
              >
                Tìm
              </button>

              {/* Gợi ý tìm kiếm nhanh */}
              {showSearchSuggest && searchKeyword.trim() && (
                <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-xl border border-orange-100 p-3 z-50 space-y-2">
                  {searchSuggestions.shops.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-stone-400 px-2 mb-1">Quán ăn đối tác</p>
                      {searchSuggestions.shops.map((sh) => (
                        <div
                          key={sh.id}
                          onMouseDown={() => {
                            setSelectedShopId(sh.id);
                            setCustomerPage('shop-detail');
                          }}
                          className="p-2 rounded-xl hover:bg-orange-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-stone-900 flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-orange-500" /> {sh.name}
                          </span>
                          <span className="text-emerald-600 font-semibold">{sh.openHours}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchSuggestions.dishes.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-stone-400 px-2 mb-1">Món ăn</p>
                      {searchSuggestions.dishes.map((d) => (
                        <div
                          key={d.id}
                          onMouseDown={() => {
                            setSelectedDishId(d.id);
                            setDishDetailQty(1);
                            setCustomerPage('dish-detail');
                          }}
                          className="p-2 rounded-xl hover:bg-orange-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <img src={d.image} alt={d.name} className="w-8 h-8 rounded-lg object-cover" />
                            <span className="font-bold text-stone-800">{d.name}</span>
                          </div>
                          <span className="font-extrabold text-orange-600">{formatVND(d.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchSuggestions.dishes.length === 0 && searchSuggestions.shops.length === 0 && (
                    <p className="text-xs text-stone-400 text-center py-2">
                      Nhấn Enter để tìm kiếm "{searchKeyword}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Menu điều hướng & Tài khoản */}
            <nav className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setCustomerPage('home')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  customerPage === 'home'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden lg:inline">Trang chủ</span>
              </button>

              <button
                onClick={() => setCustomerPage('search')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  customerPage === 'search'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span className="hidden lg:inline">Thực đơn</span>
              </button>

              <button
                onClick={() => setCustomerPage('orders')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  customerPage === 'orders' || customerPage === 'order-detail'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span className="hidden lg:inline">Đơn hàng</span>
                {customerOrders.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                    {customerOrders.length}
                  </span>
                )}
              </button>

              {/* Huy hiệu Điểm tích lũy */}
              {currentCustomer && (
                <button
                  onClick={() => setCustomerPage('profile')}
                  title="Điểm thưởng thành viên"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-all"
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{currentCustomer.loyaltyPoints} điểm</span>
                </button>
              )}

              {/* Nút mở Drawer Giỏ hàng nhanh */}
              <button
                onClick={() => setQuickCartOpen(true)}
                className="relative px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">{formatVND(currentCartTotal)}</span>
                <span className="w-5 h-5 rounded-full bg-white text-orange-600 text-xs font-extrabold flex items-center justify-center">
                  {currentCartItems.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </button>

              {/* Nút Menu Tài khoản & Chuyển tài khoản nhanh */}
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="pl-2 pr-3 py-1.5 rounded-xl border border-stone-200 hover:border-orange-300 bg-white hover:bg-orange-50/40 flex items-center gap-2 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-extrabold text-xs flex items-center justify-center">
                    {currentCustomer?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden xl:inline text-xs font-bold text-stone-700 max-w-[110px] truncate">
                    {currentCustomer?.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>
                {renderAccountDropdownMenu()}
              </div>
            </nav>
          </div>
        </header>

        {/* DRAWER GIỎ HÀNG TRƯỢT NHANH (SLIDE-OVER QUICK CART) */}
        {quickCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
            <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-orange-500" />
                    <h3 className="font-extrabold text-lg text-stone-900">Giỏ hàng của bạn</h3>
                  </div>
                  <button
                    onClick={() => setQuickCartOpen(false)}
                    className="p-2 rounded-xl hover:bg-stone-100 text-stone-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {currentCartItems.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
                    <p className="font-bold text-stone-700">Giỏ hàng đang trống</p>
                    <p className="text-xs text-stone-500">Hãy chọn món ăn yêu thích để thêm vào giỏ nhé!</p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-800 flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-orange-600" /> {currentCartShop?.name}
                      </span>
                      <button
                        onClick={handleClearCart}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Xóa hết
                      </button>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {currentCartItems.map((it) => (
                        <div key={it.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <img src={it.dish.image} alt={it.dish.name} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <p className="font-bold text-xs text-stone-900 line-clamp-1">{it.dish.name}</p>
                              <p className="text-xs text-orange-600 font-semibold">{formatVND(it.dish.price)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                              <button
                                onClick={() => handleUpdateCartQty(it.dish.id, -1)}
                                className="p-1.5 text-stone-600 hover:text-orange-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold">{it.quantity}</span>
                              <button
                                onClick={() => handleUpdateCartQty(it.dish.id, 1)}
                                className="p-1.5 text-stone-600 hover:text-orange-600"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveCartItem(it.dish.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {currentCartItems.length > 0 && (
                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-stone-600">Tổng tạm tính:</span>
                    <span className="text-xl font-extrabold text-orange-600">{formatVND(currentCartTotal)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        setQuickCartOpen(false);
                        setCustomerPage('cart');
                      }}
                      className="py-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 font-bold text-xs hover:bg-orange-100"
                    >
                      Xem chi tiết giỏ
                    </button>
                    <button
                      onClick={() => {
                        setQuickCartOpen(false);
                        setCustomerPage('checkout');
                      }}
                      className="py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xs shadow-md"
                    >
                      Đặt hàng ngay
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NỘI DUNG CHÍNH KHÁCH HÀNG */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          {/* 1. TRANG CHỦ & TRANG TÌM KIẾM */}
          {(customerPage === 'home' || customerPage === 'search') && (
            <div className="space-y-8">
              {/* Hero Banner (chỉ hiện ở Trang chủ) */}
              {customerPage === 'home' && (
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-950 via-red-950 to-orange-900 text-white shadow-xl border border-orange-200/20">
                  <div className="absolute inset-0 opacity-35 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
                  <div className="relative z-10 p-6 sm:p-10 md:p-12 grid md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/30 border border-orange-400/40 backdrop-blur-sm text-amber-200 text-xs font-bold">
                        <Flame className="w-4 h-4 text-orange-400" /> Freeship 0đ bán kính 5km • Tích điểm đổi quà
                      </div>
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                        Vị Ngon Truyền Thống, <br />
                        <span className="text-amber-400">Giao Nhanh Nóng Hổi!</span>
                      </h1>
                      <p className="text-stone-200 text-sm sm:text-base leading-relaxed max-w-xl">
                        Đặt ngay Cơm tấm sườn nướng mật ong Cô Ba, Phở bò tái ninh xương 12 tiếng hay Trà sữa trân châu đường đen. Hoàn tất đơn nhận ngay +1 điểm tích lũy cho mỗi 10.000đ!
                      </p>
                      <div className="flex flex-wrap gap-3 pt-1">
                        <button
                          onClick={() => setCustomerPage('search')}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-sm shadow-lg shadow-orange-500/30 flex items-center gap-2 transition-all"
                        >
                          Khám phá Thực đơn ngay <ChevronRight className="w-4 h-4" />
                        </button>
                        {currentCustomer && (
                          <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="truncate max-w-xs">Giao đến: {currentCustomer.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thẻ Ưu đãi & Cam kết chất lượng */}
                    <div className="hidden md:flex flex-col gap-3 bg-black/35 backdrop-blur-md p-5 rounded-2xl border border-white/15">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Thanh toán VNPAY & Tiền mặt</p>
                          <p className="text-xs text-stone-300">Hoàn tiền tự động 100% nếu đơn hủy</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Tích điểm Thành viên</p>
                          <p className="text-xs text-stone-300">Tặng 1 điểm thưởng cho mỗi 10.000đ</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danh sách Cửa hàng nổi bật (chỉ hiện ở Trang chủ) */}
              {customerPage === 'home' && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
                        <Store className="w-5 h-5 text-orange-600" /> Quán Ngon Đối Tác Nổi Bật
                      </h2>
                      <p className="text-xs text-stone-500">
                        Chọn quán yêu thích để khám phá thực đơn tươi ngon mỗi ngày
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    {shops.map((shop) => {
                      const ratingInfo = getShopRatingInfo(shop.id);
                      const dishCount = dishes.filter((d) => d.shopId === shop.id && d.status === 'AVAILABLE').length;
                      return (
                        <div
                          key={shop.id}
                          onClick={() => {
                            if (shop.status === 'PENDING_APPROVAL' || shop.status === 'REJECTED') {
                              showToast('Cửa hàng này hiện đang chờ phê duyệt hoạt động!', 'info');
                              return;
                            }
                            setSelectedShopId(shop.id);
                            setShopDetailCatId('ALL');
                            setCustomerPage('shop-detail');
                          }}
                          className="bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col"
                        >
                          <div className="h-40 relative overflow-hidden">
                            <img
                              src={shop.coverImage}
                              alt={shop.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${
                                  SHOP_STATUS_META[shop.status]?.color
                                }`}
                              >
                                {SHOP_STATUS_META[shop.status]?.label}
                              </span>
                            </div>
                            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-stone-800 flex items-center gap-1 shadow">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{ratingInfo.avg}</span>
                              <span className="text-stone-400">({ratingInfo.count} đánh giá)</span>
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-base text-stone-900 group-hover:text-orange-600 transition-colors">
                                {shop.name}
                              </h3>
                              <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" /> {shop.address}
                              </p>
                              <p className="text-xs text-stone-500 line-clamp-2 mt-1.5">{shop.description}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-orange-500" /> {shop.openHours}
                              </span>
                              <span className="font-bold text-orange-600">{dishCount} món đang phục vụ</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Bộ lọc Danh mục, Khoảng giá, Trạng thái & Phân trang */}
              <section className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm space-y-4">
                  {/* Dòng 1: Các nút Danh mục */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                      onClick={() => {
                        setSelectedCategoryId('ALL');
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategoryId === 'ALL'
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      🍽️ Tất cả ({dishes.length})
                    </button>
                    {categories.map((cat) => {
                      const count = dishes.filter((d) => d.categoryId === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            setCurrentPage(1);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            Number(selectedCategoryId) === cat.id
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-stone-100 text-stone-600 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                        >
                          <span>{cat.icon || '🍴'}</span>
                          <span>{cat.name}</span>
                          <span className="opacity-75">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dòng 2: Bộ lọc nâng cao */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={filterShopId}
                        onChange={(e) => {
                          setFilterShopId(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 outline-none"
                      >
                        <option value="ALL">🏪 Tất cả cửa hàng</option>
                        {shops
                          .filter((s) => s.status === 'OPEN' || s.status === 'CLOSED')
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                      </select>

                      <select
                        value={priceRangeFilter}
                        onChange={(e) => {
                          setPriceRangeFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 outline-none"
                      >
                        <option value="ALL">💰 Mọi mức giá</option>
                        <option value="UNDER_30K">Dưới 30.000đ</option>
                        <option value="30K_50K">Từ 30.000đ - 50.000đ</option>
                        <option value="OVER_50K">Trên 50.000đ</option>
                      </select>

                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onlyAvailableFilter}
                          onChange={(e) => {
                            setOnlyAvailableFilter(e.target.checked);
                            setCurrentPage(1);
                          }}
                          className="rounded text-orange-500"
                        />
                        <span>Chỉ hiện món đang bán</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 outline-none"
                      >
                        <option value="DEFAULT">Sắp xếp: Mặc định</option>
                        <option value="BEST_SELLING">🔥 Bán chạy nhất</option>
                        <option value="RATING">⭐ Điểm đánh giá cao</option>
                        <option value="ASC">Giá: Thấp đến Cao</option>
                        <option value="DESC">Giá: Cao đến Thấp</option>
                      </select>

                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 outline-none"
                      >
                        <option value={8}>8 món / trang</option>
                        <option value={12}>12 món / trang</option>
                        <option value={24}>Hiển thị tất cả</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Danh sách Món ăn */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-stone-900">
                    Thực đơn Món Ngon ({filteredDishes.length} món)
                  </h2>
                  {(selectedCategoryId !== 'ALL' ||
                    filterShopId !== 'ALL' ||
                    priceRangeFilter !== 'ALL' ||
                    searchKeyword) && (
                    <button
                      onClick={() => {
                        setSelectedCategoryId('ALL');
                        setFilterShopId('ALL');
                        setPriceRangeFilter('ALL');
                        setSearchKeyword('');
                        setOnlyAvailableFilter(false);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-bold text-orange-600 hover:underline"
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </div>

                {paginatedDishes.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                    <Utensils className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <p className="font-bold text-stone-700">Không tìm thấy món ăn phù hợp</p>
                    <p className="text-xs text-stone-500 mt-1">Hãy thử đổi từ khóa hoặc bộ lọc khoảng giá/danh mục</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {paginatedDishes.map((dish) => {
                      const shop = shops.find((s) => s.id === dish.shopId);
                      const category = categories.find((c) => c.id === dish.categoryId);
                      const ratingInfo = getDishRatingInfo(dish.id);
                      const soldCount = getDishSoldCount(dish.id);
                      const isAvailable = dish.status === 'AVAILABLE' && shop?.status === 'OPEN';

                      return (
                        <div
                          key={dish.id}
                          className="bg-white rounded-2xl border border-orange-100/80 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col group"
                        >
                          <div
                            onClick={() => {
                              setSelectedDishId(dish.id);
                              setDishDetailQty(1);
                              setCustomerPage('dish-detail');
                            }}
                            className="h-44 relative overflow-hidden cursor-pointer"
                          >
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                                !isAvailable ? 'grayscale opacity-75' : ''
                              }`}
                            />
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-900/75 text-white backdrop-blur-sm">
                                {category?.name}
                              </span>
                              {soldCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white shadow">
                                  Đã bán {soldCount}
                                </span>
                              )}
                            </div>
                            {dish.status === 'UNAVAILABLE' && (
                              <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
                                <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow">
                                  Tạm ngưng phục vụ
                                </span>
                              </div>
                            )}
                            {ratingInfo.count > 0 && (
                              <div className="absolute bottom-2.5 right-2.5 bg-white/95 px-2 py-0.5 rounded-full text-xs font-bold text-stone-800 flex items-center gap-1 shadow">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                {ratingInfo.avg} ({ratingInfo.count})
                              </div>
                            )}
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <button
                                onClick={() => {
                                  setSelectedShopId(shop.id);
                                  setShopDetailCatId('ALL');
                                  setCustomerPage('shop-detail');
                                }}
                                className="text-[11px] font-semibold text-orange-600 hover:underline flex items-center gap-1 mb-1"
                              >
                                <Store className="w-3 h-3" /> {shop?.name}
                              </button>
                              <h3
                                onClick={() => {
                                  setSelectedDishId(dish.id);
                                  setDishDetailQty(1);
                                  setCustomerPage('dish-detail');
                                }}
                                className="font-bold text-stone-900 group-hover:text-orange-600 transition-colors cursor-pointer line-clamp-1"
                              >
                                {dish.name}
                              </h3>
                              <p className="text-xs text-stone-500 line-clamp-2 mt-1">{dish.description}</p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                              <span className="text-base font-extrabold text-orange-600">
                                {formatVND(dish.price)}
                              </span>
                              <button
                                disabled={!isAvailable}
                                onClick={() => handleAddToCart(dish, 1)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                                  isAvailable
                                    ? 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-200'
                                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" /> Thêm
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Thanh Phân trang */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      disabled={safePage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold disabled:opacity-40 hover:bg-orange-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all ${
                          safePage === page
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-orange-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      disabled={safePage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold disabled:opacity-40 hover:bg-orange-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* 2. CHI TIẾT MÓN ĂN, ĐÁNH GIÁ & MÓN CÙNG QUÁN */}
          {customerPage === 'dish-detail' && (() => {
            const dish = dishes.find((d) => d.id === selectedDishId) || dishes[0];
            const shop = shops.find((s) => s.id === dish.shopId);
            const category = categories.find((c) => c.id === dish.categoryId);
            const ratingInfo = getDishRatingInfo(dish.id);
            const soldCount = getDishSoldCount(dish.id);
            const isAvailable = dish.status === 'AVAILABLE' && shop?.status === 'OPEN';
            const sameShopDishes = dishes
              .filter((d) => d.shopId === dish.shopId && d.id !== dish.id && d.status === 'AVAILABLE')
              .slice(0, 4);

            return (
              <div className="space-y-6">
                <button
                  onClick={() => setCustomerPage('home')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-orange-600"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại thực đơn
                </button>

                <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden grid md:grid-cols-2 gap-6 p-6">
                  <div className="h-72 sm:h-96 rounded-2xl overflow-hidden relative">
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-stone-900/80 text-white text-xs font-bold">
                      {category?.name}
                    </span>
                  </div>

                  <div className="flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            dish.status === 'AVAILABLE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {dish.status === 'AVAILABLE' ? 'Đang phục vụ' : 'Tạm ngưng bán'}
                        </span>
                        <span className="text-xs font-bold text-orange-600">• Đã bán {soldCount} phần</span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">{dish.name}</h1>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-4 h-4 fill-amber-500" />
                          <span>{ratingInfo.count > 0 ? ratingInfo.avg : 'Chưa có đánh giá'}</span>
                        </div>
                        <span className="text-stone-300">|</span>
                        <span className="text-stone-600">{ratingInfo.count} nhận xét từ thực khách</span>
                      </div>

                      <p className="text-2xl font-extrabold text-orange-600 pt-1">
                        {formatVND(dish.price)}
                      </p>

                      <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        {dish.description}
                      </p>

                      {/* Thông tin cửa hàng */}
                      {shop && (
                        <div
                          onClick={() => {
                            setSelectedShopId(shop.id);
                            setShopDetailCatId('ALL');
                            setCustomerPage('shop-detail');
                          }}
                          className="p-4 rounded-2xl border border-orange-100 bg-orange-50/40 flex items-center justify-between cursor-pointer hover:bg-orange-50 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-orange-600 flex items-center gap-1">
                              <Store className="w-3.5 h-3.5" /> {shop.name}
                            </p>
                            <p className="text-xs text-stone-500">{shop.address}</p>
                            <p className="text-xs text-stone-500">Giờ mở cửa: {shop.openHours}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-orange-500" />
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center gap-4">
                      <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50">
                        <button
                          onClick={() => setDishDetailQty((q) => Math.max(1, q - 1))}
                          className="p-3 text-stone-600 hover:text-orange-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-bold text-sm">{dishDetailQty}</span>
                        <button
                          onClick={() => setDishDetailQty((q) => q + 1)}
                          className="p-3 text-stone-600 hover:text-orange-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        disabled={!isAvailable}
                        onClick={() => handleAddToCart(dish, dishDetailQty)}
                        className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                          isAvailable
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-orange-500/25'
                            : 'bg-stone-200 text-stone-500 cursor-not-allowed shadow-none'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {isAvailable
                          ? `Thêm vào giỏ • ${formatVND(dish.price * dishDetailQty)}`
                          : 'Món đang tạm ngưng phục vụ'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danh sách đánh giá của món ăn */}
                <div className="bg-white rounded-3xl border border-orange-100 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      Đánh giá từ Thực khách ({ratingInfo.count})
                    </h3>
                    <span className="text-xs text-stone-400">
                      Đánh giá xác thực từ các đơn hàng đã hoàn tất
                    </span>
                  </div>

                  {ratingInfo.reviews.length === 0 ? (
                    <p className="text-sm text-stone-500 py-6 text-center">
                      Chưa có nhận xét nào cho món ăn này. Hãy đặt món và thưởng thức ngay hôm nay!
                    </p>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {ratingInfo.reviews.map((rev) => {
                        const reviewer = customers.find((c) => c.id === rev.customerId);
                        return (
                          <div key={rev.id} className="py-4 flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-stone-900">
                                  {reviewer?.fullName || 'Khách hàng'}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                                  Đã thưởng thức
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((st) => (
                                  <Star
                                    key={st}
                                    className={`w-3.5 h-3.5 ${
                                      st <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-stone-700 pt-1">{rev.comment}</p>
                            </div>
                            <span className="text-xs text-stone-400">{rev.createdAt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Gợi ý món ăn cùng cửa hàng */}
                {sameShopDishes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-extrabold text-stone-900">
                      Món ngon khác tại {shop?.name}
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {sameShopDishes.map((d) => (
                        <div
                          key={d.id}
                          className="bg-white rounded-2xl border border-orange-100 p-3 flex items-center justify-between gap-3"
                        >
                          <div
                            onClick={() => {
                              setSelectedDishId(d.id);
                              setDishDetailQty(1);
                            }}
                            className="flex items-center gap-2.5 cursor-pointer"
                          >
                            <img src={d.image} alt={d.name} className="w-14 h-14 rounded-xl object-cover" />
                            <div>
                              <p className="font-bold text-xs text-stone-900 line-clamp-1">{d.name}</p>
                              <p className="text-xs font-extrabold text-orange-600 mt-0.5">{formatVND(d.price)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddToCart(d, 1)}
                            className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white font-bold"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 3. TRANG CHI TIẾT CỬA HÀNG */}
          {customerPage === 'shop-detail' && (() => {
            const shop = shops.find((s) => s.id === selectedShopId) || shops[0];
            const allShopDishes = dishes.filter((d) => d.shopId === shop.id);
            const filteredShopDishes = allShopDishes.filter(
              (d) => shopDetailCatId === 'ALL' || d.categoryId === Number(shopDetailCatId)
            );
            const ratingInfo = getShopRatingInfo(shop.id);

            return (
              <div className="space-y-6">
                <button
                  onClick={() => setCustomerPage('home')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-orange-600"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
                </button>

                <div className="bg-white rounded-3xl border border-orange-100 overflow-hidden shadow-sm">
                  <div className="h-56 relative">
                    <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex items-end p-6">
                      <div className="text-white space-y-1 w-full">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${SHOP_STATUS_META[shop.status]?.color}`}>
                            {SHOP_STATUS_META[shop.status]?.label}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-stone-950" /> {ratingInfo.avg} ({ratingInfo.count} đánh giá)
                          </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold">{shop.name}</h1>
                        <p className="text-xs sm:text-sm text-stone-200">{shop.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50/50 flex flex-wrap gap-6 text-xs text-stone-600 border-t border-orange-100">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-orange-500" /> <strong>Địa chỉ:</strong> {shop.address}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-orange-500" /> <strong>Giờ mở cửa:</strong> {shop.openHours}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-orange-500" /> <strong>SĐT:</strong> {shop.phone}
                    </span>
                  </div>
                </div>

                {/* Tab Danh mục trong quán */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setShopDetailCatId('ALL')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${
                      shopDetailCatId === 'ALL'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border border-stone-200 text-stone-600'
                    }`}
                  >
                    Tất cả ({allShopDishes.length})
                  </button>
                  {categories.map((c) => {
                    const cnt = allShopDishes.filter((d) => d.categoryId === c.id).length;
                    if (cnt === 0) return null;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setShopDetailCatId(c.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold ${
                          Number(shopDetailCatId) === c.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-white border border-stone-200 text-stone-600'
                        }`}
                      >
                        {c.icon} {c.name} ({cnt})
                      </button>
                    );
                  })}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredShopDishes.map((dish) => {
                    const isAvailable = dish.status === 'AVAILABLE' && shop.status === 'OPEN';
                    const dRating = getDishRatingInfo(dish.id);
                    return (
                      <div
                        key={dish.id}
                        className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden flex flex-col"
                      >
                        <div
                          onClick={() => {
                            setSelectedDishId(dish.id);
                            setCustomerPage('dish-detail');
                          }}
                          className="h-40 relative cursor-pointer"
                        >
                          <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                          {dish.status === 'UNAVAILABLE' && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold">
                                Tạm ngừng bán
                              </span>
                            </div>
                          )}
                          {dRating.count > 0 && (
                            <span className="absolute bottom-2 right-2 bg-white/95 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {dRating.avg}
                            </span>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-stone-900">{dish.name}</h3>
                            <p className="text-xs text-stone-500 mt-1 line-clamp-2">{dish.description}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                            <span className="font-extrabold text-orange-600">{formatVND(dish.price)}</span>
                            <button
                              disabled={!isAvailable}
                              onClick={() => handleAddToCart(dish, 1)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                                isAvailable
                                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                              }`}
                            >
                              + Thêm
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 4. GIỎ HÀNG CHI TIẾT */}
          {customerPage === 'cart' && (() => {
            const upsellDishes = currentCartShop
              ? dishes
                  .filter(
                    (d) =>
                      d.shopId === currentCartShop.id &&
                      d.status === 'AVAILABLE' &&
                      !currentCartItems.some((ci) => ci.dish.id === d.id)
                  )
                  .slice(0, 3)
              : [];

            return (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-orange-500" /> Giỏ hàng của bạn
                  </h1>
                  <div className="flex items-center gap-3">
                    {currentCartItems.length > 0 && (
                      <button
                        onClick={handleClearCart}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Làm trống giỏ
                      </button>
                    )}
                    <button
                      onClick={() => setCustomerPage('home')}
                      className="text-sm font-semibold text-orange-600 hover:underline"
                    >
                      + Chọn thêm món
                    </button>
                  </div>
                </div>

                {currentCartItems.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-orange-100 p-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-800">Giỏ hàng của bạn đang trống</h3>
                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                      Hãy khám phá các món ăn hấp dẫn từ Cơm Tấm Cô Ba hoặc Phở Gia Truyền & Trà Sữa nhé!
                    </p>
                    <button
                      onClick={() => setCustomerPage('home')}
                      className="px-6 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-md hover:bg-orange-600"
                    >
                      Khám phá thực đơn ngay
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <div className="bg-white rounded-3xl border border-orange-100 p-6 space-y-4">
                        <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-sm text-stone-900">
                              Quán phục vụ: {currentCartShop?.name}
                            </span>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium">
                            Giao nhanh trong 25 phút
                          </span>
                        </div>

                        <div className="divide-y divide-stone-100">
                          {currentCartItems.map((item) => (
                            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5">
                                <img
                                  src={item.dish.image}
                                  alt={item.dish.name}
                                  className="w-16 h-16 rounded-2xl object-cover border border-stone-100"
                                />
                                <div>
                                  <h4 className="font-bold text-stone-900 text-sm">{item.dish.name}</h4>
                                  <p className="text-xs text-stone-500">{formatVND(item.dish.price)} / phần</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50">
                                  <button
                                    onClick={() => handleUpdateCartQty(item.dish.id, -1)}
                                    className="p-2 text-stone-600 hover:text-orange-600"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-3 text-xs font-bold">{item.quantity}</span>
                                  <button
                                    onClick={() => handleUpdateCartQty(item.dish.id, 1)}
                                    className="p-2 text-stone-600 hover:text-orange-600"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <span className="font-extrabold text-sm text-orange-600 w-24 text-right">
                                  {formatVND(item.subtotal)}
                                </span>

                                <button
                                  onClick={() => handleRemoveCartItem(item.dish.id)}
                                  className="p-2 text-stone-400 hover:text-rose-600"
                                  title="Xóa món"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Gợi ý gọi kèm cùng quán */}
                      {upsellDishes.length > 0 && (
                        <div className="bg-orange-50/50 rounded-3xl border border-orange-100 p-5 space-y-3">
                          <p className="text-xs font-extrabold uppercase text-orange-800">
                            🍹 Gợi ý gọi kèm từ {currentCartShop?.name}
                          </p>
                          <div className="grid sm:grid-cols-3 gap-3">
                            {upsellDishes.map((d) => (
                              <div
                                key={d.id}
                                className="bg-white p-2.5 rounded-2xl border border-orange-100 flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2">
                                  <img src={d.image} alt={d.name} className="w-10 h-10 rounded-xl object-cover" />
                                  <div>
                                    <p className="font-bold text-xs text-stone-800 line-clamp-1">{d.name}</p>
                                    <p className="text-[11px] font-bold text-orange-600">{formatVND(d.price)}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAddToCart(d, 1)}
                                  className="p-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tóm tắt thanh toán */}
                    <div className="bg-white rounded-3xl border border-orange-100 p-6 h-fit space-y-4">
                      <h3 className="font-extrabold text-base text-stone-900">Chi tiết Thanh toán</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-stone-600">
                          <span>Số lượng món:</span>
                          <span className="font-semibold">
                            {currentCartItems.reduce((s, i) => s + i.quantity, 0)} phần
                          </span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Phí giao hàng:</span>
                          <span className="text-emerald-600 font-semibold">Miễn phí (0 đ)</span>
                        </div>
                        <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                          <span className="font-bold text-stone-900">Tổng tạm tính:</span>
                          <span className="text-xl font-extrabold text-orange-600">
                            {formatVND(currentCartTotal)}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                          🎁 Hoàn tất đơn hàng này bạn sẽ nhận được{' '}
                          <strong>+{Math.floor(currentCartTotal / 10000)} điểm thưởng</strong>!
                        </p>
                      </div>

                      <button
                        onClick={() => setCustomerPage('checkout')}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all"
                      >
                        Tiến hành Đặt hàng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 5. TRANG ĐẶT HÀNG & THANH TOÁN */}
          {customerPage === 'checkout' && <CheckoutView />}

          {/* 6. LỊCH SỬ ĐƠN HÀNG CỦA KHÁCH */}
          {customerPage === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-stone-900">Đơn hàng của tôi</h1>
                  <p className="text-xs text-stone-500">
                    Theo dõi trạng thái giao hàng, thanh toán trực tuyến hoặc đặt lại món yêu thích
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Tìm mã đơn #1, tên quán..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED', 'REJECTED'].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        orderStatusFilter === st
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-orange-50'
                      }`}
                    >
                      {st === 'ALL' ? 'Tất cả' : ORDER_STATUS_META[st]?.label}
                    </button>
                  )
                )}
              </div>

              {filteredCustomerOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
                  <p className="font-bold text-stone-700">Chưa có đơn hàng nào trong mục này</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCustomerOrders.map((order) => {
                    const shop = shops.find((s) => s.id === order.shopId);
                    const payment = payments.find((p) => p.orderId === order.id);
                    const items = orderItems.filter((oi) => oi.orderId === order.id);

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-sm text-stone-900">Đơn hàng #{order.id}</span>
                            <span className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                              <Store className="w-3.5 h-3.5" /> {shop?.name}
                            </span>
                            <span className="text-xs text-stone-400">{order.createdAt}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {payment && (
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  PAYMENT_STATUS_META[payment.status]?.color
                                }`}
                              >
                                {payment.method}: {PAYMENT_STATUS_META[payment.status]?.label}
                              </span>
                            )}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                ORDER_STATUS_META[order.status]?.color
                              }`}
                            >
                              {ORDER_STATUS_META[order.status]?.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="space-y-1 text-xs text-stone-600">
                            {items.map((it) => {
                              const d = dishes.find((x) => x.id === it.dishId);
                              return (
                                <div key={it.id} className="flex items-center gap-2">
                                  <span className="font-bold text-stone-800">{it.quantity}x</span>
                                  <span>{d?.name}</span>
                                  <span className="text-stone-400">({formatVND(it.unitPrice)})</span>
                                </div>
                              );
                            })}
                            {order.reason && (
                              <p className="text-rose-600 font-medium pt-1">Lý do: {order.reason}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            <div className="text-right mr-2">
                              <span className="text-xs text-stone-400 block">Tổng thanh toán</span>
                              <span className="text-lg font-extrabold text-orange-600">
                                {formatVND(order.totalAmount)}
                              </span>
                            </div>

                            <button
                              onClick={() => handleReorder(order)}
                              className="px-3 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1"
                              title="Đặt lại các món trong đơn này"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
                            </button>

                            <button
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                setCustomerPage('order-detail');
                              }}
                              className="px-4 py-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white font-bold text-xs transition-all flex items-center gap-1"
                            >
                              Xem chi tiết <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 7. CHI TIẾT & THEO DÕI ĐƠN HÀNG */}
          {customerPage === 'order-detail' && (() => {
            const order = orders.find((o) => o.id === selectedOrderId) || orders[0];
            const shop = shops.find((s) => s.id === order.shopId);
            const payment = payments.find((p) => p.orderId === order.id);
            const refund = payment ? refunds.find((r) => r.paymentId === payment.id) : null;
            const items = orderItems.filter((oi) => oi.orderId === order.id);

            const steps = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED'];
            const currentStepIdx = steps.indexOf(order.status);

            return (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCustomerPage('orders')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-orange-600"
                  >
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đơn hàng
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Đặt lại đơn này
                    </button>
                    <button
                      onClick={() => setInvoiceModalOrder(order)}
                      className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> In hóa đơn
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-orange-100 p-6 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-extrabold text-stone-900">Đơn hàng #{order.id}</h1>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            ORDER_STATUS_META[order.status]?.color
                          }`}
                        >
                          {ORDER_STATUS_META[order.status]?.label}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Thời gian đặt: {order.createdAt} • Cập nhật lần cuối: {order.updatedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Nút Thanh toán lại nếu đơn PENDING và UNPAID/FAILED */}
                      {order.status === 'PENDING' &&
                        payment &&
                        ['UNPAID', 'FAILED'].includes(payment.status) && (
                          <button
                            onClick={() =>
                              setPaymentSandboxModal({
                                orderId: order.id,
                                paymentId: payment.id,
                                amount: order.totalAmount,
                                method: payment.method === 'COD' ? 'VNPAY' : payment.method,
                              })
                            }
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <CreditCard className="w-4 h-4" /> Thanh toán trực tuyến ngay
                          </button>
                        )}

                      {/* Nút Hủy đơn hàng - Chỉ khi PENDING */}
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => setCancelOrderModal({ order })}
                          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold"
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Thanh tiến trình 5 bước */}
                  {!['CANCELLED', 'REJECTED'].includes(order.status) ? (
                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {steps.map((st, idx) => {
                        const isDone = idx <= currentStepIdx;
                        return (
                          <div key={st} className="text-center space-y-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isDone ? 'bg-orange-500' : 'bg-stone-200'
                              }`}
                            />
                            <p
                              className={`text-xs font-bold ${
                                isDone ? 'text-orange-600' : 'text-stone-400'
                              }`}
                            >
                              {ORDER_STATUS_META[st].label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">
                          Đơn hàng đã {order.status === 'CANCELLED' ? 'được hủy theo yêu cầu' : 'bị từ chối bởi cửa hàng'}
                        </p>
                        {order.reason && <p className="text-xs mt-1">Lý do: {order.reason}</p>}
                      </div>
                    </div>
                  )}

                  {/* Thông tin người nhận & Thanh toán / Hoàn tiền */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs">
                      <p className="font-bold text-stone-900 text-sm mb-2">Địa chỉ Nhận món</p>
                      <p>
                        <strong>Người nhận:</strong> {order.recipientName} ({order.recipientPhone})
                      </p>
                      <p>
                        <strong>Địa chỉ giao:</strong> {order.deliveryAddress}
                      </p>
                      <p>
                        <strong>Ghi chú:</strong> {order.note || 'Không có ghi chú'}
                      </p>
                      <p>
                        <strong>Quán chuẩn bị:</strong> {shop?.name} ({shop?.phone})
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs">
                      <p className="font-bold text-stone-900 text-sm mb-2">Thông tin Giao dịch</p>
                      {payment ? (
                        <>
                          <p>
                            <strong>Phương thức:</strong> {payment.method === 'VNPAY' ? 'Ví VNPAY / Ngân hàng' : payment.method === 'COD' ? 'Tiền mặt khi nhận hàng (COD)' : 'Cổng thanh toán trực tuyến'}
                          </p>
                          <p>
                            <strong>Trạng thái:</strong>{' '}
                            <span className="font-bold">{PAYMENT_STATUS_META[payment.status]?.label}</span>
                          </p>
                          <p>
                            <strong>Mã tham chiếu:</strong> {payment.transactionCode || 'Chưa phát sinh'}
                          </p>
                          <p>
                            <strong>Thời gian thanh toán:</strong> {payment.paidAt || 'Chưa thanh toán'}
                          </p>
                        </>
                      ) : (
                        <p>Chưa có thông tin thanh toán</p>
                      )}

                      {refund && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 space-y-1">
                          <p className="font-bold flex items-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5" /> Hoàn tiền thành công
                          </p>
                          <p>Số tiền đã hoàn: <strong>{formatVND(refund.amount)}</strong></p>
                          <p>Nội dung: {refund.reason}</p>
                          <p>Thời gian hoàn: {refund.refundedAt}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Danh sách món trong đơn & Nút Đánh giá */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-sm text-stone-900">
                      Danh sách Món đã đặt
                    </h3>
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                      {items.map((it) => {
                        const dish = dishes.find((d) => d.id === it.dishId);
                        const existingReview = reviews.find(
                          (r) => r.orderId === order.id && r.dishId === it.dishId
                        );

                        return (
                          <div
                            key={it.id}
                            className="p-4 bg-white flex flex-wrap items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              {dish && (
                                <img
                                  src={dish.image}
                                  alt={dish.name}
                                  className="w-14 h-14 rounded-xl object-cover"
                                />
                              )}
                              <div>
                                <p className="font-bold text-sm text-stone-900">{dish?.name}</p>
                                <p className="text-xs text-stone-500">
                                  Đơn giá: {formatVND(it.unitPrice)} × {it.quantity}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-sm text-orange-600">
                                {formatVND(it.unitPrice * it.quantity)}
                              </span>

                              {order.status === 'COMPLETED' && (
                                <>
                                  {existingReview ? (
                                    <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                      Đã đánh giá {existingReview.rating} sao
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => setReviewModal({ orderId: order.id, dish })}
                                      className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm"
                                    >
                                      Viết đánh giá
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end items-baseline gap-3 pt-2">
                      <span className="text-sm font-bold text-stone-600">Tổng thanh toán:</span>
                      <span className="text-2xl font-extrabold text-orange-600">
                        {formatVND(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 8. TRANG QUẢN LÝ HỒ SƠ CÁ NHÂN & ĐIỂM TÍCH LŨY */}
          {customerPage === 'profile' && <CustomerProfileView />}
        </main>

        {/* FOOTER THƯƠNG MẠI */}
        <footer className="bg-stone-900 text-stone-400 text-xs py-10 px-4 mt-12 border-t border-stone-800">
          <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-8 pb-8 border-b border-stone-800">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-white text-base">FoodHub Vietnam</span>
              </div>
              <p className="text-stone-400 leading-relaxed">
                Nền tảng đặt đồ ăn trực tuyến kết nối thực khách với các quán ăn ngon, giao hàng tận nơi nhanh chóng và an toàn.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-white uppercase tracking-wider">Dành cho Thực khách</p>
              <p className="hover:text-white cursor-pointer" onClick={() => setCustomerPage('search')}>Khám phá Thực đơn</p>
              <p className="hover:text-white cursor-pointer" onClick={() => setCustomerPage('orders')}>Theo dõi Đơn hàng</p>
              <p className="hover:text-white cursor-pointer" onClick={() => setCustomerPage('profile')}>Chính sách Điểm thưởng</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-white uppercase tracking-wider">Hợp tác & Liên hệ</p>
              <p className="hover:text-white cursor-pointer" onClick={() => handleQuickSwitchAccount(5)}>Kênh Đối tác Nhà hàng</p>
              <p>Trung tâm CSKH: 1900 6868 (06:00 - 22:00)</p>
              <p>Địa chỉ: Quận Cầu Giấy, Thành phố Hà Nội</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-6 flex flex-wrap items-center justify-between gap-4">
            <p>© 2026 FoodHub Vietnam. Bảo lưu mọi quyền.</p>
            <p className="text-stone-500">Thanh toán an toàn qua VNPAY • Hoàn tiền tự động</p>
          </div>
        </footer>
      </div>
    );
  };

  // --- SUB-COMPONENT: TRANG CHECKOUT ---
  const CheckoutView = () => {
    const [recipientName, setRecipientName] = useState(currentCustomer?.fullName || '');
    const [recipientPhone, setRecipientPhone] = useState(currentCustomer?.phone || '');
    const [deliveryAddress, setDeliveryAddress] = useState(currentCustomer?.address || '');
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('VNPAY');

    const quickNotes = ['Ít cơm', 'Không hành', 'Gọi trước khi giao', 'Lấy thêm đũa muỗng', 'Để tại quầy lễ tân'];

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!recipientName.trim() || !recipientPhone.trim() || !deliveryAddress.trim()) {
        showToast('Vui lòng nhập đầy đủ người nhận, số điện thoại và địa chỉ giao!', 'error');
        return;
      }
      handlePlaceOrder({ recipientName, recipientPhone, deliveryAddress, note, paymentMethod });
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => setCustomerPage('cart')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-orange-600"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại giỏ hàng
        </button>

        <h1 className="text-2xl font-extrabold text-stone-900">
          Xác nhận Đặt hàng & Thanh toán
        </h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl border border-orange-100 p-6 space-y-4">
            <h3 className="font-bold text-base text-stone-900">1. Thông tin Người nhận</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Họ và tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Số điện thoại nhận hàng *</label>
                <input
                  type="text"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Địa chỉ giao hàng chi tiết *</label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Ghi chú cho nhà hàng</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Ít cơm, không hành, gọi trước khi giao..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickNotes.map((qn) => (
                  <button
                    type="button"
                    key={qn}
                    onClick={() => setNote((prev) => (prev ? `${prev}, ${qn}` : qn))}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-orange-50 hover:text-orange-600 text-[11px] font-medium text-stone-600"
                  >
                    + {qn}
                  </button>
                ))}
              </div>
            </div>

            <h3 className="font-bold text-base text-stone-900 pt-2">
              2. Phương thức Thanh toán
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { id: 'VNPAY', title: 'Ví VNPAY / QR', desc: 'Quét mã QR hoặc Thẻ ATM' },
                { id: 'MOCK', title: 'Thẻ Quốc tế / Ví ĐT', desc: 'Cổng thanh toán nhanh' },
                { id: 'COD', title: 'Tiền mặt (COD)', desc: 'Thanh toán khi nhận món' },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === m.id
                      ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-200'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <p className="font-extrabold text-sm text-stone-900">{m.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-orange-100 p-6 h-fit space-y-4">
            <h3 className="font-bold text-base text-stone-900">Đơn hàng từ {currentCartShop?.name}</h3>
            <div className="divide-y divide-stone-100 text-xs space-y-2">
              {currentCartItems.map((it) => (
                <div key={it.id} className="pt-2 flex justify-between">
                  <span>
                    <strong>{it.quantity}x</strong> {it.dish.name}
                  </span>
                  <span className="font-semibold">{formatVND(it.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="font-bold text-sm">Tổng thanh toán:</span>
              <span className="text-xl font-extrabold text-orange-600">{formatVND(currentCartTotal)}</span>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-sm shadow-lg"
            >
              Xác nhận Đặt hàng
            </button>
          </div>
        </form>
      </div>
    );
  };

  // --- SUB-COMPONENT: HỒ SƠ KHÁCH HÀNG, ĐỔI MẬT KHẨU & LỊCH SỬ TÍCH ĐIỂM ---
  const CustomerProfileView = () => {
    const [fullName, setFullName] = useState(currentCustomer?.fullName || '');
    const [email, setEmail] = useState(currentCustomer?.email || '');
    const [phone, setPhone] = useState(currentCustomer?.phone || '');
    const [address, setAddress] = useState(currentCustomer?.address || '');
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');

    const completedMyOrders = orders.filter(
      (o) => o.customerId === currentCustomer?.id && o.status === 'COMPLETED'
    );

    const handleSave = (e) => {
      e.preventDefault();
      if (!currentCustomer) return;
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === currentCustomer.id ? { ...c, fullName, email, phone, address } : c
        )
      );
      showToast('Đã cập nhật thông tin cá nhân thành công!');
    };

    const handleChangePassword = (e) => {
      e.preventDefault();
      if (!oldPass || !newPass) {
        showToast('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!', 'error');
        return;
      }
      setOldPass('');
      setNewPass('');
      showToast('Đã cập nhật mật khẩu mới thành công!');
    };

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Award className="w-7 h-7 text-white" />
              </div>
              <p className="text-xs uppercase font-bold tracking-wider text-amber-100">
                Hạng Thành Viên FoodHub
              </p>
              <h2 className="text-2xl font-extrabold">{currentCustomer?.fullName}</h2>
              <p className="text-xs text-orange-100">Tài khoản: @{currentAccount?.username}</p>
            </div>

            <div className="mt-8 bg-black/20 backdrop-blur rounded-2xl p-4 border border-white/15">
              <span className="text-xs text-amber-200 block">Điểm thưởng tích lũy hiện có</span>
              <span className="text-3xl font-extrabold">{currentCustomer?.loyaltyPoints} điểm</span>
              <p className="text-[11px] text-orange-100 mt-1">
                Tích lũy tự động +1 điểm cho mỗi 10.000đ trên các đơn hàng hoàn tất.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSave}
            className="md:col-span-2 bg-white rounded-3xl border border-orange-100 p-6 space-y-4 shadow-sm"
          >
            <h3 className="text-lg font-extrabold text-stone-900">
              Thông tin Cá nhân
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Địa chỉ Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Địa chỉ giao hàng mặc định</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow"
            >
              Lưu thay đổi
            </button>
          </form>
        </div>

        {/* Đổi mật khẩu & Lịch sử cộng điểm */}
        <div className="grid md:grid-cols-2 gap-6">
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-3xl border border-orange-100 p-6 space-y-4 shadow-sm"
          >
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-orange-500" /> Đổi mật khẩu bảo mật
            </h3>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
            >
              Cập nhật mật khẩu
            </button>
          </form>

          <div className="bg-white rounded-3xl border border-orange-100 p-6 space-y-3 shadow-sm">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Lịch sử Tích điểm thưởng
            </h3>
            {completedMyOrders.length === 0 ? (
              <p className="text-xs text-stone-500 py-4">Chưa có đơn hàng hoàn tất nào.</p>
            ) : (
              <div className="divide-y divide-stone-100 text-xs">
                {completedMyOrders.map((o) => (
                  <div key={o.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-800">Đơn hàng #{o.id}</span>
                      <span className="text-stone-400 ml-2">({o.updatedAt})</span>
                      <p className="text-stone-500">Giá trị đơn: {formatVND(o.totalAmount)}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-extrabold border border-amber-200">
                      +{Math.floor(o.totalAmount / 10000)} điểm
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 7. GIAO DIỆN NGƯỜI BÁN (SELLER DASHBOARD LAYOUT)
  // ============================================================================

  const renderSellerLayout = () => {
    const shop = currentSellerShop;
    const shopOrders = shop ? orders.filter((o) => o.shopId === shop.id) : [];
    const activeShopOrders = shopOrders.filter((o) =>
      ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING'].includes(o.status)
    );
    const historyShopOrders = shopOrders.filter((o) =>
      ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status)
    );
    const shopDishes = shop ? dishes.filter((d) => d.shopId === shop.id) : [];

    // Doanh thu chỉ tính đơn COMPLETED & PAID
    const completedPaidOrders = shopOrders.filter((o) => {
      const p = payments.find((pay) => pay.orderId === o.id);
      return o.status === 'COMPLETED' && p?.status === 'PAID';
    });
    const totalRevenue = completedPaidOrders.reduce((s, o) => s + o.totalAmount, 0);

    // Thống kê món bán chạy của quán
    const dishSalesStats = shopDishes
      .map((d) => {
        const qty = completedPaidOrders.reduce((acc, ord) => {
          const item = orderItems.find((oi) => oi.orderId === ord.id && oi.dishId === d.id);
          return acc + (item ? item.quantity : 0);
        }, 0);
        const rev = completedPaidOrders.reduce((acc, ord) => {
          const item = orderItems.find((oi) => oi.orderId === ord.id && oi.dishId === d.id);
          return acc + (item ? item.quantity * item.unitPrice : 0);
        }, 0);
        return { ...d, soldQty: qty, revenue: rev };
      })
      .sort((a, b) => b.soldQty - a.soldQty);

    // Xóa món an toàn (Không xóa cứng món đã có trong đơn hàng)
    const handleSafeDeleteDish = (dish) => {
      const hasBeenOrdered = orderItems.some((oi) => oi.dishId === dish.id);
      if (hasBeenOrdered) {
        setDishes((prev) =>
          prev.map((d) => (d.id === dish.id ? { ...d, status: 'UNAVAILABLE' } : d))
        );
        showToast(
          `Món "${dish.name}" đã có trong lịch sử đơn hàng nên được chuyển sang Tạm ngưng bán!`,
          'info'
        );
      } else {
        setDishes((prev) => prev.filter((d) => d.id !== dish.id));
        showToast(`Đã xóa món "${dish.name}" khỏi thực đơn!`);
      }
    };

    return (
      <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
        {/* SIDEBAR NGƯỜI BÁN */}
        <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-bold shadow-sm">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-stone-900 text-base">FoodHub Merchant</h2>
                <p className="text-xs text-stone-500">Kênh Đối tác Nhà hàng</p>
              </div>
            </div>

            {shop ? (
              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100 space-y-1">
                <p className="font-bold text-xs text-stone-900">{shop.name}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    SHOP_STATUS_META[shop.status]?.color
                  }`}
                >
                  {SHOP_STATUS_META[shop.status]?.label}
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
                Chưa đăng ký thông tin quán
              </div>
            )}

            <nav className="space-y-1">
              {[
                { id: 'orders', label: 'Đơn hàng đang xử lý', icon: Package, badge: activeShopOrders.length },
                { id: 'history', label: 'Lịch sử đơn hàng', icon: Receipt, badge: historyShopOrders.length },
                { id: 'menu', label: 'Quản lý Thực đơn', icon: Utensils, badge: shopDishes.length },
                { id: 'shop-info', label: 'Hồ sơ Cửa hàng', icon: Store },
                { id: 'revenue', label: 'Báo cáo Doanh thu', icon: TrendingUp },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSellerPage(item.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                      sellerPage === item.id
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" /> {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] ${
                          sellerPage === item.id ? 'bg-white text-orange-600' : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <button
            onClick={() => handleQuickSwitchAccount(null)}
            className="mt-6 w-full py-2.5 px-4 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </aside>

        {/* KHUNG NỘI DUNG NGƯỜI BÁN KÈM TOP HEADER SẠCH SẼ */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-stone-800">
                {shop ? shop.name : 'Thiết lập Cửa hàng mới'}
              </span>
              {shop && (
                <span className="text-xs text-stone-400 hidden sm:inline">• Giờ mở cửa: {shop.openHours}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-orange-300 bg-white flex items-center gap-2 text-xs font-bold text-stone-700"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center">
                    {currentSeller?.fullName?.charAt(0) || 'S'}
                  </div>
                  <span>{currentSeller?.fullName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>
                {renderAccountDropdownMenu()}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {shop?.status === 'PENDING_APPROVAL' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-sm">Hồ sơ cửa hàng "{shop.name}" đang chờ Ban quản trị phê duyệt</p>
                    <p>Sau khi cửa hàng được duyệt mở bán, bạn có thể đăng tải thực đơn và nhận đơn đặt món từ khách hàng.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCurrentAccountId(1);
                    setAdminPage('approvals');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shrink-0 shadow-xs"
                >
                  Chuyển sang Quản trị viên để duyệt
                </button>
              </div>
            )}

            {/* QUẢN LÝ ĐƠN HÀNG ĐANG XỬ LÝ */}
            {sellerPage === 'orders' && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-stone-900">
                    Đơn hàng Đang xử lý
                  </h1>
                  <p className="text-xs text-stone-500">
                    Tiếp nhận và cập nhật tiến độ chế biến, giao hàng theo từng bước cho thực khách
                  </p>
                </div>

                {activeShopOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
                    <p className="font-bold text-stone-600">Hiện không có đơn hàng nào đang chờ xử lý</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {activeShopOrders.map((order) => {
                      const payment = payments.find((p) => p.orderId === order.id);
                      const items = orderItems.filter((oi) => oi.orderId === order.id);

                      const nextActionLabel = {
                        PENDING: 'Xác nhận nhận đơn',
                        CONFIRMED: 'Bắt đầu chế biến',
                        PREPARING: 'Giao cho tài xế',
                        DELIVERING: 'Xác nhận hoàn tất đơn',
                      }[order.status];

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-base text-stone-900">Đơn hàng #{order.id}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_META[order.status]?.color}`}>
                                {ORDER_STATUS_META[order.status]?.label}
                              </span>
                              {payment && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PAYMENT_STATUS_META[payment.status]?.color}`}>
                                  {payment.method}: {PAYMENT_STATUS_META[payment.status]?.label}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-stone-500">Đặt lúc: {order.createdAt}</span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-stone-800">Khách nhận: {order.recipientName} ({order.recipientPhone})</p>
                              <p className="text-stone-600">Địa chỉ giao: {order.deliveryAddress}</p>
                              {order.note && <p className="text-orange-600 font-semibold">Ghi chú: "{order.note}"</p>}
                            </div>
                            <div className="space-y-1">
                              {items.map((it) => {
                                const d = dishes.find((x) => x.id === it.dishId);
                                return (
                                  <div key={it.id} className="flex justify-between">
                                    <span><strong>{it.quantity}x</strong> {d?.name}</span>
                                    <span className="font-semibold">{formatVND(it.unitPrice * it.quantity)}</span>
                                  </div>
                                );
                              })}
                              <div className="pt-2 border-t border-stone-100 flex justify-between font-extrabold text-sm text-orange-600">
                                <span>Tổng cộng:</span>
                                <span>{formatVND(order.totalAmount)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-end gap-2">
                            {['PENDING', 'CONFIRMED'].includes(order.status) && (
                              <button
                                onClick={() => setRejectOrderModal({ order })}
                                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold"
                              >
                                Từ chối đơn & Hoàn tiền
                              </button>
                            )}

                            <button
                              onClick={() => handleSellerAdvanceOrderStatus(order)}
                              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" /> {nextActionLabel}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LỊCH SỬ ĐƠN HÀNG CỦA QUÁN */}
            {sellerPage === 'history' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-extrabold text-stone-900">
                  Lịch sử Đơn hàng
                </h1>
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-600 uppercase">
                      <tr>
                        <th className="p-3.5">Mã đơn</th>
                        <th className="p-3.5">Khách hàng</th>
                        <th className="p-3.5">Ngày đặt</th>
                        <th className="p-3.5">Tổng tiền</th>
                        <th className="p-3.5">Trạng thái</th>
                        <th className="p-3.5">Ghi chú / Lý do</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {historyShopOrders.map((o) => (
                        <tr key={o.id}>
                          <td className="p-3.5 font-bold">#{o.id}</td>
                          <td className="p-3.5">{o.recipientName}</td>
                          <td className="p-3.5 text-stone-500">{o.createdAt}</td>
                          <td className="p-3.5 font-bold text-orange-600">{formatVND(o.totalAmount)}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold ${ORDER_STATUS_META[o.status]?.color}`}>
                              {ORDER_STATUS_META[o.status]?.label}
                            </span>
                          </td>
                          <td className="p-3.5 text-stone-500">{o.reason || o.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* QUẢN LÝ THỰC ĐƠN */}
            {sellerPage === 'menu' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold text-stone-900">Quản lý Thực đơn</h1>
                    <p className="text-xs text-stone-500">
                      Cập nhật món ăn, giá bán và trạng thái phục vụ tại cửa hàng
                    </p>
                  </div>
                  <button
                    disabled={!shop || shop.status !== 'OPEN'}
                    onClick={() =>
                      setDishFormModal({
                        mode: 'add',
                        dish: {
                          name: '',
                          price: 45000,
                          categoryId: 1,
                          description: '',
                          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
                          status: 'AVAILABLE',
                        },
                      })
                    }
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                      shop?.status === 'OPEN'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" /> Thêm món ăn mới
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shopDishes.map((dish) => {
                    const cat = categories.find((c) => c.id === dish.categoryId);
                    const sold = getDishSoldCount(dish.id);
                    return (
                      <div
                        key={dish.id}
                        className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between"
                      >
                        <div className="flex gap-3 p-4">
                          <img src={dish.image} alt={dish.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-orange-600">{cat?.name}</span>
                            <h3 className="font-bold text-stone-900 text-sm">{dish.name}</h3>
                            <p className="font-extrabold text-sm text-orange-600">{formatVND(dish.price)}</p>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  dish.status === 'AVAILABLE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-stone-200 text-stone-700'
                                }`}
                              >
                                {dish.status === 'AVAILABLE' ? 'Đang bán' : 'Tạm ngưng'}
                              </span>
                              <span className="text-[10px] text-stone-400">Đã bán: {sold}</span>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setDishFormModal({ mode: 'edit', dish })}
                              className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold text-stone-700 hover:bg-stone-100 flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Sửa
                            </button>
                            <button
                              onClick={() => handleSafeDeleteDish(dish)}
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                              title="Xóa món"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              const nextSt = dish.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
                              setDishes((prev) =>
                                prev.map((d) => (d.id === dish.id ? { ...d, status: nextSt } : d))
                              );
                              showToast(
                                `Đã chuyển "${dish.name}" sang trạng thái ${
                                  nextSt === 'AVAILABLE' ? 'Đang bán' : 'Tạm ngưng'
                                }`
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              dish.status === 'AVAILABLE'
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {dish.status === 'AVAILABLE' ? 'Tạm ngưng bán' : 'Mở bán lại'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUẢN LÝ THÔNG TIN CỬA HÀNG */}
            {sellerPage === 'shop-info' && <SellerShopInfoView shop={shop} />}

            {/* THỐNG KÊ DOANH THU QUÁN & BIỂU ĐỒ */}
            {sellerPage === 'revenue' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-extrabold text-stone-900">
                  Báo cáo Doanh thu & Hiệu quả Kinh doanh
                </h1>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200">
                    <span className="text-xs text-stone-500">Tổng doanh thu thực nhận</span>
                    <p className="text-2xl font-extrabold text-orange-600 mt-1">{formatVND(totalRevenue)}</p>
                    <span className="text-[11px] text-emerald-600 font-semibold">Đã trừ các đơn hủy/hoàn tiền</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-stone-200">
                    <span className="text-xs text-stone-500">Đơn hàng thành công</span>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">{completedPaidOrders.length} đơn</p>
                    <span className="text-[11px] text-stone-400">Trên tổng số {shopOrders.length} đơn đặt</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-stone-200">
                    <span className="text-xs text-stone-500">Điểm đánh giá cửa hàng</span>
                    <p className="text-2xl font-extrabold text-amber-500 mt-1">
                      ⭐ {shop ? getShopRatingInfo(shop.id).avg : '—'}
                    </p>
                    <span className="text-[11px] text-stone-400">Tổng hợp từ phản hồi món ăn</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Bảng Top Món Bán Chạy kèm thanh tỷ lệ trực quan */}
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
                    <h3 className="font-bold text-sm text-stone-900">🔥 Xếp hạng Món bán chạy nhất</h3>
                    <div className="space-y-3.5">
                      {dishSalesStats.slice(0, 6).map((d, idx) => {
                        const maxRev = Math.max(1, dishSalesStats[0]?.revenue || 1);
                        const pct = Math.min(100, Math.round((d.revenue / maxRev) * 100));
                        return (
                          <div key={d.id} className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-extrabold flex items-center justify-center text-[11px]">
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-stone-800">{d.name}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-stone-600">{d.soldQty} phần</span>
                                <span className="text-orange-600 font-extrabold ml-3">{formatVND(d.revenue)}</span>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chi tiết các đơn hàng tính vào doanh thu */}
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
                    <h3 className="font-bold text-sm text-stone-900">Đơn hàng đã tất toán</h3>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 text-stone-600">
                        <tr>
                          <th className="p-2.5">Mã đơn</th>
                          <th className="p-2.5">Khách hàng</th>
                          <th className="p-2.5">Thời gian hoàn tất</th>
                          <th className="p-2.5">Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {completedPaidOrders.map((o) => (
                          <tr key={o.id}>
                            <td className="p-2.5 font-bold">#{o.id}</td>
                            <td className="p-2.5">{o.recipientName}</td>
                            <td className="p-2.5 text-stone-500">{o.updatedAt}</td>
                            <td className="p-2.5 font-extrabold text-emerald-600">{formatVND(o.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  };

  // --- SUB-COMPONENT: ĐĂNG KÝ MỚI HOẶC CẬP NHẬT CỬA HÀNG ---
  const SellerShopInfoView = ({ shop }) => {
    const [name, setName] = useState(shop?.name || '');
    const [address, setAddress] = useState(shop?.address || '');
    const [phone, setPhone] = useState(shop?.phone || '');
    const [openHours, setOpenHours] = useState(shop?.openHours || '07:00 - 21:00');
    const [description, setDescription] = useState(shop?.description || '');

    const handleSaveShop = (e) => {
      e.preventDefault();
      if (!currentSeller) return;

      if (!shop) {
        const newShopId = Math.max(0, ...shops.map((s) => s.id)) + 1;
        const createdShop = {
          id: newShopId,
          name,
          address,
          phone,
          openHours,
          description,
          status: 'PENDING_APPROVAL',
          rejectReason: null,
          createdAt: '2026-11-10 20:10:00',
          sellerId: currentSeller.id,
          coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
        };
        setShops((prev) => [...prev, createdShop]);
        showToast('Đã gửi hồ sơ đăng ký cửa hàng! Vui lòng chờ Ban quản trị phê duyệt.');
        return;
      }

      setShops((prev) =>
        prev.map((s) =>
          s.id === shop.id ? { ...s, name, address, phone, openHours, description } : s
        )
      );
      showToast('Đã lưu thông tin cửa hàng thành công!');
    };

    const toggleOpenClose = () => {
      if (!shop || !['OPEN', 'CLOSED'].includes(shop.status)) return;
      const nextSt = shop.status === 'OPEN' ? 'CLOSED' : 'OPEN';
      setShops((prev) => prev.map((s) => (s.id === shop.id ? { ...s, status: nextSt } : s)));
      showToast(`Đã chuyển trạng thái cửa hàng sang: ${SHOP_STATUS_META[nextSt].label}`);
    };

    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-stone-900">
            {shop ? 'Hồ sơ Cửa hàng' : 'Đăng ký Mở Cửa hàng Mới'}
          </h1>
          {shop && ['OPEN', 'CLOSED'].includes(shop.status) && (
            <button
              onClick={toggleOpenClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                shop.status === 'OPEN'
                  ? 'bg-stone-800 text-white hover:bg-stone-900'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {shop.status === 'OPEN' ? 'Tạm đóng cửa quán' : 'Mở cửa đón khách'}
            </button>
          )}
        </div>

        <form onSubmit={handleSaveShop} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Tên cửa hàng *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Khung giờ mở cửa</label>
              <input
                type="text"
                value={openHours}
                onChange={(e) => setOpenHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Số điện thoại liên hệ *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Địa chỉ cửa hàng *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">Giới thiệu cửa hàng</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow"
          >
            {shop ? 'Lưu thông tin Cửa hàng' : 'Gửi hồ sơ Đăng ký Cửa hàng'}
          </button>
        </form>
      </div>
    );
  };

  // ============================================================================
  // 8. GIAO DIỆN QUẢN TRỊ VIÊN (ADMIN DASHBOARD LAYOUT)
  // ============================================================================

  const renderAdminLayout = () => {
    const pendingShops = shops.filter((s) => s.status === 'PENDING_APPROVAL');
    const systemRevenue = orders
      .filter((o) => {
        const p = payments.find((pay) => pay.orderId === o.id);
        return o.status === 'COMPLETED' && p?.status === 'PAID';
      })
      .reduce((s, o) => s + o.totalAmount, 0);

    const filteredAdminAccounts = accounts.filter((acc) => {
      const matchRole = adminAccountRoleFilter === 'ALL' || acc.role === adminAccountRoleFilter;
      const kw = adminAccountSearch.trim().toLowerCase();
      const displayName = getAccountDisplayName(acc).toLowerCase();
      const matchKw = !kw || acc.username.toLowerCase().includes(kw) || displayName.includes(kw);
      return matchRole && matchKw;
    });

    return (
      <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
        {/* SIDEBAR ADMIN */}
        <aside className="w-full md:w-64 bg-stone-900 text-stone-200 p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-base">FoodHub Admin</h2>
                <p className="text-xs text-stone-400">Trung tâm Quản trị</p>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'statistics', label: 'Tổng quan Hệ thống', icon: BarChart3 },
                { id: 'approvals', label: 'Phê duyệt Cửa hàng', icon: Store, badge: pendingShops.length },
                { id: 'accounts', label: 'Quản lý Tài khoản', icon: Users, badge: accounts.length },
                { id: 'categories', label: 'Danh mục Ẩm thực', icon: Layers, badge: categories.length },
                { id: 'transactions', label: 'Giám sát Giao dịch', icon: CreditCard, badge: orders.length },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAdminPage(item.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                      adminPage === item.id
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" /> {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-stone-800 text-stone-200">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <button
            onClick={() => setCurrentAccountId(null)}
            className="mt-6 w-full py-2.5 px-4 rounded-xl border border-stone-700 text-xs font-bold text-stone-300 hover:bg-rose-950 hover:text-rose-300 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </aside>

        {/* KHUNG NỘI DUNG ADMIN KÈM TOP HEADER */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-stone-800">Hệ thống Quản trị FoodHub Vietnam</span>
              {pendingShops.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  {pendingShops.length} hồ sơ quán chờ duyệt
                </span>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen((v) => !v)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-orange-300 bg-white flex items-center gap-2 text-xs font-bold text-stone-700"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center">
                  A
                </div>
                <span>Quản trị viên</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>
              {renderAccountDropdownMenu()}
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* THỐNG KÊ HỆ THỐNG */}
            {adminPage === 'statistics' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-extrabold text-stone-900">
                  Tổng quan Hoạt động Hệ thống
                </h1>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200">
                    <span className="text-xs text-stone-500">Tổng số Tài khoản</span>
                    <p className="text-2xl font-extrabold text-stone-900 mt-1">{accounts.length} người dùng</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-stone-200">
                    <span className="text-xs text-stone-500">Cửa hàng Đang hoạt động</span>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                      {shops.filter((s) => s.status === 'OPEN').length} / {shops.length} quán
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-stone-200">
                    <span className="text-xs text-stone-500">Tổng số Đơn đặt hàng</span>
                    <p className="text-2xl font-extrabold text-orange-600 mt-1">{orders.length} đơn</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-stone-200">
                    <span className="text-xs text-stone-500">Tổng Doanh thu Toàn sàn</span>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">{formatVND(systemRevenue)}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
                  <h3 className="font-bold text-sm text-stone-900">Doanh thu theo Đối tác Cửa hàng</h3>
                  <div className="space-y-3">
                    {shops.map((sh) => {
                      const rev = orders
                        .filter((o) => {
                          const p = payments.find((pay) => pay.orderId === o.id);
                          return o.shopId === sh.id && o.status === 'COMPLETED' && p?.status === 'PAID';
                        })
                        .reduce((s, o) => s + o.totalAmount, 0);
                      return (
                        <div key={sh.id} className="p-3.5 rounded-xl bg-stone-50 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-stone-900">{sh.name}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${SHOP_STATUS_META[sh.status]?.color}`}>
                                {SHOP_STATUS_META[sh.status]?.label}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">{sh.address}</p>
                          </div>
                          <span className="font-extrabold text-orange-600">{formatVND(rev)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* DUYỆT NGƯỜI BÁN & CỬA HÀNG */}
            {adminPage === 'approvals' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-extrabold text-stone-900">
                  Phê duyệt Đối tác Cửa hàng
                </h1>
                <div className="grid gap-4">
                  {shops.map((sh) => {
                    const seller = sellers.find((s) => s.id === sh.sellerId);
                    return (
                      <div
                        key={sh.id}
                        className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-stone-900">{sh.name}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${SHOP_STATUS_META[sh.status]?.color}`}>
                              {SHOP_STATUS_META[sh.status]?.label}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600">
                            Đại diện: <strong>{seller?.fullName}</strong> ({seller?.email} • {seller?.phone})
                          </p>
                          <p className="text-xs text-stone-500">
                            Địa chỉ: {sh.address} • Giờ mở cửa: {sh.openHours}
                          </p>
                          {sh.rejectReason && (
                            <p className="text-xs text-rose-600 font-semibold">
                              Lý do từ chối: {sh.rejectReason}
                            </p>
                          )}
                        </div>

                        {sh.status === 'PENDING_APPROVAL' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setRejectShopModal({ shop: sh })}
                              className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold"
                            >
                              Từ chối hồ sơ
                            </button>
                            <button
                              onClick={() => {
                                setShops((prev) =>
                                  prev.map((s) => (s.id === sh.id ? { ...s, status: 'OPEN', rejectReason: null } : s))
                                );
                                if (seller) {
                                  setAccounts((prev) =>
                                    prev.map((a) => (a.id === seller.accountId ? { ...a, status: 'ACTIVE' } : a))
                                  );
                                }
                                showToast(`Đã phê duyệt mở cửa hàng "${sh.name}"!`);
                              }}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                            >
                              Phê duyệt hoạt động
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUẢN LÝ TÀI KHOẢN */}
            {adminPage === 'accounts' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h1 className="text-2xl font-extrabold text-stone-900">
                    Quản lý Tài khoản Người dùng
                  </h1>
                  <div className="flex items-center gap-2">
                    <select
                      value={adminAccountRoleFilter}
                      onChange={(e) => setAdminAccountRoleFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold"
                    >
                      <option value="ALL">Tất cả vai trò</option>
                      <option value="CUSTOMER">Khách hàng</option>
                      <option value="SELLER">Người bán</option>
                      <option value="ADMIN">Quản trị viên</option>
                    </select>
                    <input
                      type="text"
                      value={adminAccountSearch}
                      onChange={(e) => setAdminAccountSearch(e.target.value)}
                      placeholder="Tìm tên hoặc tài khoản..."
                      className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-600 uppercase">
                      <tr>
                        <th className="p-3.5">Mã TK</th>
                        <th className="p-3.5">Họ tên / Đơn vị</th>
                        <th className="p-3.5">Tên đăng nhập</th>
                        <th className="p-3.5">Vai trò</th>
                        <th className="p-3.5">Trạng thái</th>
                        <th className="p-3.5">Ngày đăng ký</th>
                        <th className="p-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredAdminAccounts.map((acc) => (
                        <tr key={acc.id}>
                          <td className="p-3.5 font-bold">#{acc.id}</td>
                          <td className="p-3.5 font-bold text-stone-900">{getAccountDisplayName(acc)}</td>
                          <td className="p-3.5 text-stone-600">@{acc.username}</td>
                          <td className="p-3.5">
                            {acc.role === 'CUSTOMER' ? 'Khách hàng' : acc.role === 'SELLER' ? 'Người bán' : 'Quản trị viên'}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold ${
                                acc.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : acc.status === 'LOCKED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {acc.status === 'ACTIVE' ? 'Đang hoạt động' : acc.status === 'LOCKED' ? 'Đã khóa' : 'Chờ duyệt'}
                            </span>
                          </td>
                          <td className="p-3.5 text-stone-500">{acc.createdAt}</td>
                          <td className="p-3.5 text-right">
                            {acc.role === 'ADMIN' ? (
                              <span className="text-stone-400 italic">Mặc định</span>
                            ) : (
                              <button
                                onClick={() => {
                                  const nextSt = acc.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
                                  setAccounts((prev) =>
                                    prev.map((a) => (a.id === acc.id ? { ...a, status: nextSt } : a))
                                  );
                                  showToast(
                                    `Đã ${nextSt === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản @${acc.username}`
                                  );
                                }}
                                className={`px-3 py-1.5 rounded-lg font-bold ${
                                  acc.status === 'LOCKED'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                                }`}
                              >
                                {acc.status === 'LOCKED' ? 'Mở khóa' : 'Khóa tài khoản'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* QUẢN LÝ DANH MỤC */}
            {adminPage === 'categories' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold text-stone-900">
                      Quản lý Danh mục Ẩm thực
                    </h1>
                    <p className="text-xs text-stone-500">
                      Phân loại thực đơn trên toàn hệ thống
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setCategoryFormModal({
                        mode: 'add',
                        category: { name: '', description: '', icon: '🍲' },
                      })
                    }
                    className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Thêm danh mục
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-600 uppercase">
                      <tr>
                        <th className="p-3.5">Mã</th>
                        <th className="p-3.5">Tên danh mục</th>
                        <th className="p-3.5">Mô tả</th>
                        <th className="p-3.5">Số lượng món</th>
                        <th className="p-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {categories.map((cat) => {
                        const count = dishes.filter((d) => d.categoryId === cat.id).length;
                        return (
                          <tr key={cat.id}>
                            <td className="p-3.5 font-bold">#{cat.id}</td>
                            <td className="p-3.5 font-bold text-stone-900">
                              {cat.icon} {cat.name}
                            </td>
                            <td className="p-3.5 text-stone-600">{cat.description}</td>
                            <td className="p-3.5 font-semibold">{count} món</td>
                            <td className="p-3.5 text-right space-x-2">
                              <button
                                onClick={() => setCategoryFormModal({ mode: 'edit', category: cat })}
                                className="px-3 py-1 rounded-lg border border-stone-200 font-bold text-stone-700"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => {
                                  if (count > 0) {
                                    showToast(
                                      `Không thể xóa danh mục "${cat.name}" vì đang có ${count} món ăn thuộc danh mục này!`,
                                      'error'
                                    );
                                    return;
                                  }
                                  setCategories((prev) => prev.filter((c) => c.id !== cat.id));
                                  showToast(`Đã xóa danh mục "${cat.name}"`);
                                }}
                                className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GIÁM SÁT ĐƠN HÀNG, GIAO DỊCH & HOÀN TIỀN */}
            {adminPage === 'transactions' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-extrabold text-stone-900">
                  Giám sát Đơn hàng & Giao dịch Thanh toán
                </h1>
                <p className="text-xs text-stone-500">
                  Theo dõi trạng thái đơn hàng, đối soát thanh toán trực tuyến và lịch sử hoàn tiền toàn hệ thống
                </p>

                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-600 uppercase">
                      <tr>
                        <th className="p-3.5">Mã đơn</th>
                        <th className="p-3.5">Cửa hàng</th>
                        <th className="p-3.5">Khách nhận</th>
                        <th className="p-3.5">Tổng tiền</th>
                        <th className="p-3.5">Trạng thái Đơn</th>
                        <th className="p-3.5">Giao dịch Thanh toán</th>
                        <th className="p-3.5">Thông tin Hoàn tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.map((o) => {
                        const shop = shops.find((s) => s.id === o.shopId);
                        const pay = payments.find((p) => p.orderId === o.id);
                        const ref = pay ? refunds.find((r) => r.paymentId === pay.id) : null;
                        return (
                          <tr key={o.id}>
                            <td className="p-3.5 font-bold">#{o.id}</td>
                            <td className="p-3.5 font-semibold">{shop?.name}</td>
                            <td className="p-3.5">{o.recipientName}</td>
                            <td className="p-3.5 font-bold text-orange-600">{formatVND(o.totalAmount)}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full font-bold ${ORDER_STATUS_META[o.status]?.color}`}>
                                {ORDER_STATUS_META[o.status]?.label}
                              </span>
                            </td>
                            <td className="p-3.5">
                              {pay ? (
                                <div>
                                  <span className={`px-2 py-0.5 rounded-full font-bold ${PAYMENT_STATUS_META[pay.status]?.color}`}>
                                    {pay.method}: {PAYMENT_STATUS_META[pay.status]?.label}
                                  </span>
                                  {pay.transactionCode && (
                                    <span className="block text-[10px] text-stone-400 mt-0.5">
                                      Mã GD: {pay.transactionCode}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="p-3.5">
                              {ref ? (
                                <span className="text-amber-700 font-semibold">
                                  Đã hoàn {formatVND(ref.amount)} ({ref.reason})
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 9. CÁC HỘP THOẠI MODAL TƯƠNG TÁC NGHIỆP VỤ
  // ============================================================================

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Hiển thị thông báo Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-bold ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : toast.type === 'info'
                ? 'bg-stone-900 text-white border-stone-700'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Điều hướng Layout theo Vai trò */}
      {!currentAccount ? (
        <AuthView />
      ) : currentAccount.role === 'CUSTOMER' ? (
        renderCustomerLayout()
      ) : currentAccount.role === 'SELLER' ? (
        renderSellerLayout()
      ) : (
        renderAdminLayout()
      )}

      {/* MODAL PHIẾU HÓA ĐƠN (INVOICE PREVIEW) */}
      {invoiceModalOrder && (() => {
        const shop = shops.find((s) => s.id === invoiceModalOrder.shopId);
        const pay = payments.find((p) => p.orderId === invoiceModalOrder.id);
        const items = orderItems.filter((oi) => oi.orderId === invoiceModalOrder.id);
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
              <div className="text-center border-b border-dashed border-stone-300 pb-4">
                <h3 className="font-extrabold text-lg text-stone-900">PHIẾU HÓA ĐƠN FOODHUB</h3>
                <p className="text-xs text-stone-500">{shop?.name} — {shop?.address}</p>
                <p className="text-xs text-stone-400 mt-1">Mã đơn: #{invoiceModalOrder.id} • {invoiceModalOrder.createdAt}</p>
              </div>
              <div className="text-xs space-y-1">
                <p><strong>Khách nhận:</strong> {invoiceModalOrder.recipientName} ({invoiceModalOrder.recipientPhone})</p>
                <p><strong>Địa chỉ giao:</strong> {invoiceModalOrder.deliveryAddress}</p>
                <p><strong>Thanh toán:</strong> {pay?.method} ({PAYMENT_STATUS_META[pay?.status]?.label})</p>
              </div>
              <div className="border-t border-b border-dashed border-stone-300 py-3 space-y-2 text-xs">
                {items.map((it) => {
                  const d = dishes.find((x) => x.id === it.dishId);
                  return (
                    <div key={it.id} className="flex justify-between">
                      <span>{it.quantity}x {d?.name}</span>
                      <span className="font-bold">{formatVND(it.unitPrice * it.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-sm">TỔNG THANH TOÁN:</span>
                <span className="text-xl font-extrabold text-orange-600">{formatVND(invoiceModalOrder.totalAmount)}</span>
              </div>
              <button
                onClick={() => setInvoiceModalOrder(null)}
                className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Đóng hóa đơn
              </button>
            </div>
          </div>
        );
      })()}

      {/* MODAL 1: CẢNH BÁO GIỎ HÀNG KHÁC CỬA HÀNG */}
      {conflictCartModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-orange-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-stone-900">
              Bạn muốn tạo giỏ hàng mới tại quán này?
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Giỏ hàng hiện tại của bạn đang có món từ quán{' '}
              <strong className="text-stone-900">{conflictCartModal.currentShopName}</strong>. Mỗi đơn hàng chỉ được đặt từ một cửa hàng. Bạn có muốn làm mới giỏ hàng để thêm món{' '}
              <strong className="text-orange-600">{conflictCartModal.dish.name}</strong> từ quán{' '}
              <strong className="text-stone-900">{conflictCartModal.newShopName}</strong> không?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConflictCartModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 font-bold text-xs text-stone-600"
              >
                Giữ giỏ hàng cũ
              </button>
              <button
                onClick={confirmReplaceCartWithNewShop}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
              >
                Tạo giỏ mới & Thêm món
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CỔNG THANH TOÁN TRỰC TUYẾN */}
      {paymentSandboxModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-orange-100">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <span className="font-extrabold text-base text-stone-900">
                  Cổng Thanh Toán Trực Tuyến ({paymentSandboxModal.method})
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                Đơn #{paymentSandboxModal.orderId}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1">
              <span className="text-xs text-stone-500">Số tiền thanh toán</span>
              <p className="text-2xl font-extrabold text-orange-600">
                {formatVND(paymentSandboxModal.amount)}
              </p>
            </div>

            <p className="text-xs text-stone-500 text-center">
              Xác nhận thực hiện giao dịch thanh toán cho đơn hàng của bạn:
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleCompleteSandboxPayment(true)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" /> Xác nhận Thanh toán Thành công
              </button>
              <button
                onClick={() => handleCompleteSandboxPayment(false)}
                className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-sm flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Hủy giao dịch / Tạm hoãn thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: KHÁCH HỦY ĐƠN HÀNG */}
      {cancelOrderModal && (
        <ReasonPromptModal
          title={`Hủy đơn hàng #${cancelOrderModal.order.id}`}
          subtitle="Đơn hàng đang ở trạng thái chờ quán xác nhận. Nếu bạn đã thanh toán trực tuyến, tiền sẽ được hoàn lại tự động."
          placeholder="Nhập lý do hủy đơn (Ví dụ: Đổi ý, đặt nhầm địa chỉ...)"
          defaultReason="Khách đổi ý, hủy khi đơn đang chờ xác nhận"
          confirmText="Xác nhận Hủy đơn"
          onClose={() => setCancelOrderModal(null)}
          onConfirm={(reason) => handleCustomerCancelOrder(cancelOrderModal.order, reason)}
        />
      )}

      {/* MODAL 4: NGƯỜI BÁN TỪ CHỐI ĐƠN & HOÀN TIỀN */}
      {rejectOrderModal && (
        <ReasonPromptModal
          title={`Từ chối đơn hàng #${rejectOrderModal.order.id}`}
          subtitle="Vui lòng nhập lý do từ chối để thông báo cho khách hàng. Nếu đơn đã thanh toán, hệ thống sẽ tự động hoàn tiền."
          placeholder="Nhập lý do từ chối (Ví dụ: Quán hết nguyên liệu...)"
          defaultReason="Quán tạm hết nguyên liệu chế biến món này"
          confirmText="Từ chối & Hoàn tiền"
          onClose={() => setRejectOrderModal(null)}
          onConfirm={(reason) => handleSellerRejectOrder(rejectOrderModal.order, reason)}
        />
      )}

      {/* MODAL 5: ADMIN TỪ CHỐI DUYỆT CỬA HÀNG */}
      {rejectShopModal && (
        <ReasonPromptModal
          title={`Từ chối duyệt quán "${rejectShopModal.shop.name}"`}
          subtitle="Nhập lý do từ chối để đối tác cửa hàng cập nhật lại hồ sơ."
          placeholder="Nhập lý do từ chối..."
          defaultReason="Thông tin địa chỉ và giấy phép an toàn thực phẩm chưa đầy đủ"
          confirmText="Xác nhận Từ chối"
          onClose={() => setRejectShopModal(null)}
          onConfirm={(reason) => {
            setShops((prev) =>
              prev.map((s) =>
                s.id === rejectShopModal.shop.id
                  ? { ...s, status: 'REJECTED', rejectReason: reason }
                  : s
              )
            );
            setRejectShopModal(null);
            showToast('Đã từ chối hồ sơ đăng ký cửa hàng', 'info');
          }}
        />
      )}

      {/* MODAL 6: ĐÁNH GIÁ MÓN ĂN */}
      {reviewModal && (
        <ReviewFormModal
          orderId={reviewModal.orderId}
          dish={reviewModal.dish}
          onClose={() => setReviewModal(null)}
          onSubmit={handleSubmitReview}
        />
      )}

      {/* MODAL 7: THÊM / SỬA MÓN ĂN */}
      {dishFormModal && (
        <DishEditorModal
          mode={dishFormModal.mode}
          initialDish={dishFormModal.dish}
          categories={categories}
          onClose={() => setDishFormModal(null)}
          onSave={(dishData) => {
            if (dishFormModal.mode === 'add') {
              const newId = Math.max(0, ...dishes.map((d) => d.id)) + 1;
              setDishes((prev) => [
                ...prev,
                { ...dishData, id: newId, shopId: currentSellerShop.id },
              ]);
              showToast(`Đã thêm món "${dishData.name}" vào thực đơn!`);
            } else {
              setDishes((prev) =>
                prev.map((d) => (d.id === dishData.id ? { ...d, ...dishData } : d))
              );
              showToast(`Đã cập nhật món "${dishData.name}"!`);
            }
            setDishFormModal(null);
          }}
        />
      )}

      {/* MODAL 8: THÊM / SỬA DANH MỤC */}
      {categoryFormModal && (
        <CategoryEditorModal
          mode={categoryFormModal.mode}
          initialCategory={categoryFormModal.category}
          onClose={() => setCategoryFormModal(null)}
          onSave={(catData) => {
            if (categoryFormModal.mode === 'add') {
              const newId = Math.max(0, ...categories.map((c) => c.id)) + 1;
              setCategories((prev) => [...prev, { ...catData, id: newId }]);
              showToast(`Đã thêm danh mục "${catData.name}"!`);
            } else {
              setCategories((prev) =>
                prev.map((c) => (c.id === catData.id ? { ...c, ...catData } : c))
              );
              showToast(`Đã cập nhật danh mục "${catData.name}"!`);
            }
            setCategoryFormModal(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// 10. CÁC COMPONENT MODAL PHỤ TRỢ
// ============================================================================

function ReasonPromptModal({ title, subtitle, placeholder, defaultReason, confirmText, onClose, onConfirm }) {
  const [reason, setReason] = useState(defaultReason || '');
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <h3 className="text-lg font-extrabold text-stone-900">{title}</h3>
        <p className="text-xs text-stone-500">{subtitle}</p>
        <textarea
          rows={3}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 rounded-xl border border-stone-200 text-sm outline-none focus:border-orange-500"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) return;
              onConfirm(reason.trim());
            }}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewFormModal({ orderId, dish, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Món ăn rất ngon, đóng gói sạch sẽ, giao nhanh!');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <h3 className="text-lg font-extrabold text-stone-900">
          Đánh giá chất lượng món ăn (Đơn #{orderId})
        </h3>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50">
          <img src={dish?.image} alt={dish?.name} className="w-12 h-12 rounded-xl object-cover" />
          <span className="font-bold text-sm text-stone-900">{dish?.name}</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-600 mb-2">Mức độ hài lòng (1 - 5 sao):</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setRating(st)}
                className={`p-2.5 rounded-xl border flex items-center gap-1 font-bold text-xs ${
                  rating >= st
                    ? 'bg-amber-50 border-amber-400 text-amber-600'
                    : 'border-stone-200 text-stone-400'
                }`}
              >
                <Star className={`w-4 h-4 ${rating >= st ? 'fill-amber-500 text-amber-500' : ''}`} />
                {st}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-600 mb-1">Nhận xét của bạn:</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 rounded-xl border border-stone-200 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600"
          >
            Hủy
          </button>
          <button
            onClick={() => onSubmit({ orderId, dishId: dish.id, rating, comment })}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
          >
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
}

function DishEditorModal({ mode, initialDish, categories, onClose, onSave }) {
  const [form, setForm] = useState({ ...initialDish });
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <h3 className="text-lg font-extrabold text-stone-900">
          {mode === 'add' ? 'Thêm Món Ăn Mới' : 'Cập nhật Thông tin Món Ăn'}
        </h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-stone-600 block mb-1">Tên món ăn *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-600 block mb-1">Giá bán (VNĐ) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
              />
            </div>
            <div>
              <label className="font-bold text-stone-600 block mb-1">Danh mục *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="font-bold text-stone-600 block mb-1">Đường dẫn Hình ảnh</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_FOOD_IMAGES.map((img) => (
                <button
                  type="button"
                  key={img.label}
                  onClick={() => setForm({ ...form, image: img.url })}
                  className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-semibold"
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-bold text-stone-600 block mb-1">Mô tả món ăn</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              if (!form.name.trim() || form.price <= 0) return;
              onSave(form);
            }}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
          >
            Lưu món ăn
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryEditorModal({ mode, initialCategory, onClose, onSave }) {
  const [form, setForm] = useState({ ...initialCategory });
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <h3 className="text-lg font-extrabold text-stone-900">
          {mode === 'add' ? 'Thêm Danh mục Ẩm thực' : 'Cập nhật Danh mục'}
        </h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-stone-600 block mb-1">Tên danh mục *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
            />
          </div>
          <div>
            <label className="font-bold text-stone-600 block mb-1">Mô tả</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              if (!form.name.trim()) return;
              onSave(form);
            }}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
          >
            Lưu danh mục
          </button>
        </div>
      </div>
    </div>
  );
}