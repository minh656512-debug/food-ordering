import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function CustomerLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      {isAuthPage ? (
        <main className="flex-1 w-full flex flex-col p-0 m-0">
          <Outlet />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          <Outlet />
        </main>
      )}
      <Footer noMarginTop={isAuthPage} />
    </div>
  );
}
