# Hướng Dẫn Chạy Frontend - Website Đặt Món Ăn Trực Tuyến (`food-ordering`)

Dự án Frontend được tổ chức **đúng 100% theo Mục 5, 6, 8.3, 9.3, 10.1** của tài liệu *Kế hoạch phân công nhóm*.

## 1. Cấu trúc thư mục chuẩn (`frontend/src/`)

```text
frontend/src/
├── api/
│   ├── axiosClient.js        # Cấu hình Axios, tự gắn Bearer token, bắt lỗi 401
│   ├── authApi.js            # API module account (BE1): login, register, profile, shop, admin
│   ├── menuApi.js            # API module menu (BE2): category, dish, cart, review
│   └── orderApi.js           # API module order (BE3): order, payment, refund, statistic
├── components/
│   ├── common/               # Button.jsx, Input.jsx, Modal.jsx, Loading.jsx, Pagination.jsx, DishCard.jsx, ShopCard.jsx
│   └── layout/               # Header.jsx, Footer.jsx, Sidebar.jsx
├── layouts/                  # CustomerLayout.jsx, SellerLayout.jsx, AdminLayout.jsx
├── pages/
│   ├── auth/                 # LoginPage.jsx, RegisterPage.jsx
│   ├── customer/             # HomePage.jsx, SearchPage.jsx, DishDetailPage.jsx, CartPage.jsx, CheckoutPage.jsx, OrderDetailPage.jsx, OrderHistoryPage.jsx, ProfilePage.jsx
│   ├── seller/               # ShopRegisterPage.jsx, ShopInfoPage.jsx, MenuManagePage.jsx, OrderManagePage.jsx, OrderHistoryPage.jsx, RevenuePage.jsx
│   └── admin/                # SellerApprovalPage.jsx, AccountManagePage.jsx, CategoryManagePage.jsx, TransactionMonitorPage.jsx, StatisticPage.jsx
├── routes/                   # AppRoutes.jsx, ProtectedRoute.jsx
├── context/                  # AuthContext.jsx
├── hooks/                    # useAuth.js, useDebounce.js
├── utils/                    # constants.js, formatMoney.js, formatDate.js
├── mocks/                    # mockDatabase.js (Chuyển 100% dữ liệu từ DuLieu.sql)
├── App.jsx
└── main.jsx
```

## 2. Cách cài đặt và chạy dự án

### Bước 1: Cài đặt thư viện
Mở Terminal tại thư mục `frontend/` và chạy:
```bash
npm install
cp .env.example .env
```

### Bước 2: Chạy chế độ độc lập với Mock Data (`VITE_USE_MOCK=true`)
Khi các bạn BE1, BE2, BE3 chưa làm xong API:
```bash
npm run dev
```
Truy cập `http://localhost:5173`. Toàn bộ 19 màn hình hoạt động đầy đủ với dữ liệu từ `src/mocks/mockDatabase.js` (khớp với `DuLieu.sql`).

### Bước 3: Chuyển sang gọi API thật của Backend (`VITE_USE_MOCK=false`)
Khi Backend đã chạy ở `http://localhost:3000`:
1. Mở file `.env` và sửa `VITE_USE_MOCK=false`.
2. Các hàm trong `src/api/authApi.js`, `src/api/menuApi.js`, `src/api/orderApi.js` sẽ tự động gọi qua `axiosClient.js` mà không cần sửa code trong `src/pages/`.
