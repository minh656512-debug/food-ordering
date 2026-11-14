# Website đặt món ăn trực tuyến

Đồ án nhóm. Backend: Node.js + Express + Prisma + MySQL. Frontend: React + Vite + Tailwind.

```
food-ordering/
├── backend/    API (cổng 5001)
├── frontend/   Giao diện (cổng 5173)
├── database/   01_schema.sql (tạo bảng), 02_seed.sql (dữ liệu mẫu)
├── postman/    Collection test API
└── docs/       Tài liệu
```

## 1. Cài đặt

Cần: Node.js LTS (>= 20), MySQL 8 (hoặc MariaDB 10.6+).

```bash
# 1. Tạo database + dữ liệu mẫu (chạy trong thư mục database/)
mysql -u root -p < 01_schema.sql
mysql -u root -p < 02_seed.sql

# 2. Backend
cd backend
cp .env.example .env     # mở .env, sửa DATABASE_URL (đúng user/mật khẩu MySQL) và JWT_SECRET
npm install
npx prisma generate
npm run dev              # http://localhost:5001

# 3. Frontend (mở terminal khác)
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

Frontend có 2 chế độ, chỉnh trong `frontend/.env` (đổi xong phải chạy lại `npm run dev`):

| Chế độ | Cấu hình | Ghi chú |
| --- | --- | --- |
| Dữ liệu giả | `VITE_USE_MOCK=true` | Không cần backend / MySQL |
| API thật | `VITE_USE_MOCK=false` | Backend phải đang chạy ở cổng 5001 |

## 2. Tài khoản mẫu

Mật khẩu của **tất cả** tài khoản mẫu: `Password@123`

| Vai trò | Tên đăng nhập |
| --- | --- |
| Quản trị viên | `admin` |
| Khách hàng | `kh_an`, `kh_binh`, `kh_chau` |
| Người bán | `nb_hung`, `nb_lan` (đã duyệt), `nb_minh` (chờ duyệt) |

## 3. Cách test

### Test tự động
```bash
cd backend  && npm test    # test đơn vị backend (không cần MySQL)
cd frontend && npm test    # test giao diện (dữ liệu giả, không cần backend)
```

### Test tay API
- Kiểm tra: http://localhost:5001/api/v1/health
- Tài liệu Swagger: http://localhost:5001/api-docs
- Postman: nhập các file trong `postman/`.

API công khai (không cần đăng nhập):

| API | Ví dụ |
| --- | --- |
| Danh mục | `GET /api/v1/categories` |
| Danh sách món (tìm, lọc, phân trang) | `GET /api/v1/dishes?keyword=cơm&categoryId=1&page=1&limit=8` |
| Chi tiết món | `GET /api/v1/dishes/1` |
| Danh sách cửa hàng đang mở | `GET /api/v1/shops` |
| Chi tiết cửa hàng | `GET /api/v1/shops/1` |

Danh sách trả về dạng `{ items: [...], pagination: { page, limit, total, totalPages } }`.
Chỉ hiện món `AVAILABLE` của cửa hàng `OPEN`.

### Test tay giao diện
1. Mở http://localhost:5173 — thấy cửa hàng và món ăn, lọc danh mục, chuyển trang.
2. Gõ từ khóa ở ô tìm kiếm trên Header (ví dụ "phở").
3. Đăng nhập `kh_an` → về trang chủ. Đăng nhập `nb_hung` → khu Người bán. Đăng nhập `admin` → khu Quản trị.
4. Khi đã đăng nhập khách, gõ `/admin/accounts` lên thanh địa chỉ → bị chuyển về trang khách.
5. Bấm Đăng xuất → về trang đăng nhập, token bị xóa.

## 4. Quy ước nhanh
- Cổng backend: **5001**. Cổng frontend: **5173** (backend chỉ cho phép CORS từ cổng này).
- Không commit file `.env`.
- Chi tiết quy ước xem file kế hoạch phân công nhóm.
