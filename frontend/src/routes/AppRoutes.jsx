import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import CustomerLayout from '../layouts/CustomerLayout';
import SellerLayout from '../layouts/SellerLayout';
import AdminLayout from '../layouts/AdminLayout';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

import HomePage from '../pages/customer/HomePage';
import SearchPage from '../pages/customer/SearchPage';
import DishDetailPage from '../pages/customer/DishDetailPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderDetailPage from '../pages/customer/OrderDetailPage';
import OrderHistoryPage from '../pages/customer/OrderHistoryPage';
import ProfilePage from '../pages/customer/ProfilePage';

import ShopRegisterPage from '../pages/seller/ShopRegisterPage';
import ShopInfoPage from '../pages/seller/ShopInfoPage';
import MenuManagePage from '../pages/seller/MenuManagePage';
import OrderManagePage from '../pages/seller/OrderManagePage';
import SellerOrderHistoryPage from '../pages/seller/OrderHistoryPage';
import RevenuePage from '../pages/seller/RevenuePage';

import SellerApprovalPage from '../pages/admin/SellerApprovalPage';
import AccountManagePage from '../pages/admin/AccountManagePage';
import CategoryManagePage from '../pages/admin/CategoryManagePage';
import TransactionMonitorPage from '../pages/admin/TransactionMonitorPage';
import StatisticPage from '../pages/admin/StatisticPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/dishes/:id" element={<DishDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><OrderHistoryPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><OrderDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><ProfilePage /></ProtectedRoute>} />
      </Route>

      <Route path="/seller" element={<ProtectedRoute allowedRoles={['SELLER']}><SellerLayout /></ProtectedRoute>}>
        <Route path="register-shop" element={<ShopRegisterPage />} />
        <Route path="shop-info" element={<ShopInfoPage />} />
        <Route path="menu" element={<MenuManagePage />} />
        <Route path="orders" element={<OrderManagePage />} />
        <Route path="orders/history" element={<SellerOrderHistoryPage />} />
        <Route path="revenue" element={<RevenuePage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
        <Route path="sellers" element={<SellerApprovalPage />} />
        <Route path="accounts" element={<AccountManagePage />} />
        <Route path="categories" element={<CategoryManagePage />} />
        <Route path="transactions" element={<TransactionMonitorPage />} />
        <Route path="statistics" element={<StatisticPage />} />
      </Route>
    </Routes>
  );
}
