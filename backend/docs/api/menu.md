# API công khai: danh mục, món ăn, cửa hàng (BE2)

Tiền tố `/api/v1`. Các API dưới đây **không cần đăng nhập**.
Phản hồi theo định dạng chung: `{ "success": true, "message": "...", "data": ... }`.
Danh sách có phân trang trả về `data = { items: [...], pagination: { page, limit, total, totalPages } }`.

## GET /categories
Danh sách danh mục. `data`: `[ { id, name, description } ]`.

## GET /dishes
Tìm món ăn. Chỉ trả món `AVAILABLE` của cửa hàng `OPEN`.

| Query | Kiểu | Mặc định | Ý nghĩa |
| --- | --- | --- | --- |
| `keyword` | chuỗi ≤ 100 | — | Tìm theo tên món (chứa từ khóa) |
| `categoryId` | số nguyên ≥ 1 | — | Lọc theo danh mục |
| `shopId` | số nguyên ≥ 1 | — | Lọc theo cửa hàng |
| `page` | số nguyên ≥ 1 | 1 | Trang |
| `limit` | 1–50 | 10 | Số món mỗi trang |

Mỗi phần tử trong `items`:
```json
{ "id": 1, "name": "Cơm tấm sườn nướng", "description": "...", "price": 45000, "image": "/uploads/dishes/x.jpg",
  "status": "AVAILABLE", "category": { "id": 1, "name": "Cơm" },
  "shop": { "id": 1, "name": "Cơm Tấm Cô Ba", "address": "...", "openingHours": "07:00 - 21:00" } }
```
Lỗi: `400 VALIDATION_ERROR` khi tham số sai (ví dụ `limit=999`).

## GET /dishes/{id}
Chi tiết món (cùng dạng như phần tử ở trên). Xem được cả món tạm hết (`UNAVAILABLE`) nếu cửa hàng đang mở.
Lỗi: `400 VALIDATION_ERROR` (id không phải số), `404 DISH_NOT_FOUND`.

## GET /shops
Danh sách cửa hàng đang mở (`OPEN`). Query: `keyword`, `page`, `limit` (như trên).
Mỗi phần tử: `{ id, name, address, phone, description, openingHours, status }`.

## GET /shops/{id}
Chi tiết một cửa hàng đang mở. Lỗi: `400 VALIDATION_ERROR`, `404 SHOP_NOT_FOUND`
(cửa hàng chờ duyệt, bị từ chối hoặc đã đóng cũng trả 404).
