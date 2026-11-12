# API module Đơn hàng và Thanh toán (BE3)

Tiền tố `/api/v1`. Định dạng phản hồi chung: `{ success, message, data }` hoặc `{ success: false, message, errorCode }`.
Tài liệu chi tiết từng endpoint (request, response, mã lỗi) xem Swagger tại `/api-docs`; collection thử nằm ở `postman/food-ordering-be3.postman_collection.json`.

## Danh sách endpoint

| Use case | Endpoint | Quyền |
| --- | --- | --- |
| Đặt hàng | `POST /orders` | Khách hàng |
| Thanh toán trực tuyến | `POST /payments` | Khách hàng |
| Kết quả VNPay | `GET /payments/vnpay-return`, `GET /payments/vnpay-ipn` | Công khai (kiểm tra chữ ký) |
| Theo dõi đơn | `GET /orders/{id}` | Khách (đơn của mình), người bán (đơn của cửa hàng), admin |
| Lịch sử đơn (khách) | `GET /orders/my?status=&page=&limit=` | Khách hàng |
| Hủy đơn | `PATCH /orders/{id}/cancel` | Khách hàng |
| Quản lý đơn (người bán) | `GET /seller/orders?status=&page=&limit=` | Người bán |
| Chuyển trạng thái | `PATCH /orders/{id}/confirm`, `/prepare`, `/deliver`, `/complete` | Người bán |
| Lịch sử đơn (người bán) | `GET /seller/orders/history?status=&from=&to=&page=&limit=` | Người bán |
| Từ chối đơn và hoàn tiền | `PATCH /orders/{id}/reject` | Người bán |
| Thống kê doanh thu | `GET /shops/{shopId}/statistics/revenue?groupBy=day\|week\|month&from=&to=` | Người bán (cửa hàng của mình) |
| Giám sát đơn hàng | `GET /admin/orders?status=&shopId=&customerId=&from=&to=&page=&limit=` | Quản trị viên |
| Giám sát giao dịch | `GET /admin/transactions?status=&method=&shopId=&from=&to=&page=&limit=` | Quản trị viên |
| Thống kê hệ thống | `GET /admin/statistics?groupBy=&from=&to=` | Quản trị viên |

## Ví dụ

`POST /orders` (đọc giỏ hàng của người đang đăng nhập, đơn mới PENDING, thanh toán UNPAID, giỏ được xóa):

```json
{
  "receiverName": "Nguyễn Văn An",
  "receiverPhone": "0901000001",
  "deliveryAddress": "12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội",
  "note": "Ít cơm",
  "paymentMethod": "MOCK"
}
```

`paymentMethod`: `VNPAY`, `COD` hoặc `MOCK` (cổng mô phỏng). Phản hồi 201 trả `Order` gồm `items` (kèm `price` chốt tại thời điểm đặt), `payment`, `refund`.

`POST /payments`:

```json
{ "orderId": 15, "method": "MOCK", "simulate": "SUCCESS" }
```

- `MOCK`: có kết quả ngay (`simulate` = `SUCCESS` hoặc `FAILED`).
- `VNPAY`: phản hồi có `paymentUrl`, frontend chuyển khách sang URL đó. VNPay gọi lại `vnpay-ipn` (server) và đưa khách về `vnpay-return`.
- Thanh toán thất bại thì đơn vẫn `PENDING`, gọi lại `POST /payments` để thử lại.

`PATCH /orders/{id}/reject` (bắt buộc có lý do):

```json
{ "reason": "Quán hết nguyên liệu" }
```

## Quy tắc nghiệp vụ

- Đặt hàng: giỏ không trống, chỉ món của một cửa hàng, cửa hàng `OPEN`, mọi món `AVAILABLE`; tạo đơn, sao chép món kèm đơn giá hiện tại, xóa giỏ trong một giao dịch.
- Hủy đơn: chỉ khi `PENDING`. Từ chối đơn: chỉ khi `PENDING` hoặc `CONFIRMED`, bắt buộc có lý do.
- Đơn đã thanh toán mà bị hủy hoặc từ chối: tạo `Refund` bằng đúng số tiền đã thanh toán, thanh toán chuyển `REFUNDED`, đơn chuyển `CANCELLED` hoặc `REJECTED`. Hiện chỉ ghi nhận trong hệ thống, chưa gọi API hoàn tiền của VNPay.
- Người bán chuyển trạng thái đúng thứ tự `PENDING` → `CONFIRMED` → `PREPARING` → `DELIVERING` → `COMPLETED`, không nhảy cóc, chỉ đơn của cửa hàng mình (đơn khác trả 404).
- Xác nhận đơn thanh toán online cần thanh toán `PAID` trước (`ORDER_NOT_PAID`); đơn COD xác nhận thẳng và được ghi nhận đã thu tiền khi hoàn tất.
- Khi đơn `COMPLETED`: khách được cộng 1 điểm cho mỗi 10.000 đồng (làm tròn xuống), đúng một lần cho mỗi đơn. Tỉ lệ chỉnh ở `LOYALTY_VND_PER_POINT` trong `order.rules.js`.
- Doanh thu chỉ tính đơn `COMPLETED` đã `PAID` (đơn hoàn tiền bị loại), nhóm theo ngày đặt đơn. Tuần bắt đầu từ thứ Hai.
- Danh sách có phân trang trả `{ items, pagination: { page, limit, total, totalPages } }`, `limit` tối đa 50.

## Mã lỗi riêng của module

| Mã | HTTP | Khi nào |
| --- | --- | --- |
| `CART_EMPTY` | 400 | Giỏ hàng trống |
| `CART_MULTIPLE_SHOPS` | 400 | Giỏ có món của nhiều cửa hàng |
| `SHOP_CLOSED` | 409 | Cửa hàng không nhận đơn |
| `DISH_OUT_OF_STOCK` | 409 | Có món đã ngừng bán |
| `CART_CHANGED` | 409 | Giỏ vừa thay đổi lúc đặt, thử lại |
| `ORDER_NOT_FOUND` | 404 | Không có đơn hoặc không thuộc quyền xem |
| `ORDER_NOT_CANCELLABLE` | 409 | Đơn không còn `PENDING` |
| `ORDER_NOT_REJECTABLE` | 409 | Đơn không ở `PENDING` hoặc `CONFIRMED` |
| `INVALID_ORDER_STATUS` | 409 | Chuyển trạng thái sai thứ tự |
| `ORDER_NOT_PAID` | 409 | Xác nhận đơn online chưa thanh toán |
| `ORDER_NOT_PAYABLE` | 409 | Đơn không còn `PENDING` hoặc đã hoàn tiền |
| `ALREADY_PAID` | 409 | Đơn đã thanh toán |
| `PAYMENT_IN_PROGRESS` | 409 | Thanh toán vừa thay đổi, thử lại |
| `PAYMENT_GATEWAY_NOT_CONFIGURED` | 503 | Chưa cấu hình VNPay, dùng `MOCK` |
| `SHOP_NOT_FOUND` / `SHOP_NOT_APPROVED` | 404 / 403 | Người bán chưa có cửa hàng hoặc chưa được duyệt |
