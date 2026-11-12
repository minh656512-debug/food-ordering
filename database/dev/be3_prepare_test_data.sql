-- =====================================================================
-- Chuẩn bị dữ liệu để thử BE3 bằng Postman, dùng các tài khoản ĐĂNG KÝ QUA API của BE1
-- (không dùng tài khoản mẫu trong 02_seed.sql, không cần biết mật khẩu mẫu).
--
-- File này KHÔNG sửa cấu trúc bảng và KHÔNG đụng dữ liệu của 02_seed.sql. Nó chỉ làm những việc mà
-- hiện chưa có API: duyệt cửa hàng, tạo tài khoản admin, tạo món ăn, nạp giỏ hàng.
-- Khi BE1 có API duyệt cửa hàng/admin và BE2 có API món + giỏ hàng thì thay bằng gọi API và bỏ file này.
--
-- Cách dùng:
--   1. Trong Postman chạy thư mục "1. Đăng ký" cho tới request "DỪNG LẠI" (nó hiện số suffix).
--   2. Sửa dòng SET @suffix bên dưới thành đúng số đó, rồi chạy cả file này trên database food_ordering
--      (MySQL Workbench: chọn schema food_ordering rồi Execute, hoặc: mysql -u root -p food_ordering < file).
--   3. Quay lại Postman chạy tiếp từ thư mục "2. Đăng nhập".
--
-- Chạy lại file này với cùng suffix chỉ nạp lại giỏ hàng cho 4 khách (dùng khi cần đặt thêm đơn).
-- Tài khoản admin do file tạo: ad_<suffix>, mật khẩu 123456.
-- =====================================================================

USE food_ordering;
-- Cùng kiểu so sánh chữ với các bảng (utf8mb4_unicode_ci), tránh lỗi "Illegal mix of collations"
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @suffix = '1234567';

SET @kh_a = CONCAT('khA_', @suffix);
SET @kh_b = CONCAT('khB_', @suffix);
SET @kh_c = CONCAT('khC_', @suffix);
SET @kh_d = CONCAT('khD_', @suffix);
SET @nb_1 = CONCAT('nb1_', @suffix);
SET @nb_2 = CONCAT('nb2_', @suffix);
SET @admin = CONCAT('ad_', @suffix);

-- 1. Tài khoản admin (mật khẩu 123456, mã băm BCrypt)
INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, VaiTro, TrangThai)
SELECT @admin, '$2b$10$8Q5pKwLRV./zCgPXcndfqOO/MvgJOr4ie8tiGYAi0j5GX.zNyvV/G', 'ADMIN', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM TAI_KHOAN WHERE TenDangNhap = @admin);

-- 2. Duyệt hai người bán và cửa hàng của họ (đăng ký xong ở trạng thái chờ duyệt)
UPDATE TAI_KHOAN SET TrangThai = 'ACTIVE' WHERE TenDangNhap IN (@nb_1, @nb_2);

UPDATE CUA_HANG c
JOIN NGUOI_BAN n ON n.MaNguoiBan = c.NGUOI_BANMaNguoiBan
JOIN TAI_KHOAN a ON a.MaTaiKhoan = n.TAI_KHOANMaTaiKhoan
SET c.TrangThai = 'OPEN'
WHERE a.TenDangNhap IN (@nb_1, @nb_2);

-- 3. Hai món của cửa hàng người bán nb1
INSERT INTO DANH_MUC (TenDanhMuc, MoTa)
SELECT 'Món thử nghiệm BE3', 'Danh mục dùng cho thử nghiệm'
WHERE NOT EXISTS (SELECT 1 FROM DANH_MUC WHERE TenDanhMuc = 'Món thử nghiệm BE3');
SET @cat = (SELECT MaDanhMuc FROM DANH_MUC WHERE TenDanhMuc = 'Món thử nghiệm BE3');

SET @shop1 = (
  SELECT c.MaCuaHang FROM CUA_HANG c
  JOIN NGUOI_BAN n ON n.MaNguoiBan = c.NGUOI_BANMaNguoiBan
  JOIN TAI_KHOAN a ON a.MaTaiKhoan = n.TAI_KHOANMaTaiKhoan
  WHERE a.TenDangNhap = @nb_1
  ORDER BY c.MaCuaHang DESC LIMIT 1
);

INSERT INTO MON_AN (TenMonAn, MoTa, GiaBan, TrangThai, DANH_MUCMaDanhMuc, CUA_HANGMaCuaHang)
SELECT 'Cơm gà xối mỡ', 'Món thử nghiệm', 35000, 'AVAILABLE', @cat, @shop1
WHERE NOT EXISTS (SELECT 1 FROM MON_AN WHERE TenMonAn = 'Cơm gà xối mỡ' AND CUA_HANGMaCuaHang = @shop1);

INSERT INTO MON_AN (TenMonAn, MoTa, GiaBan, TrangThai, DANH_MUCMaDanhMuc, CUA_HANGMaCuaHang)
SELECT 'Trà đá', 'Món thử nghiệm', 5000, 'AVAILABLE', @cat, @shop1
WHERE NOT EXISTS (SELECT 1 FROM MON_AN WHERE TenMonAn = 'Trà đá' AND CUA_HANGMaCuaHang = @shop1);

SET @dish_com = (SELECT MaMonAn FROM MON_AN WHERE TenMonAn = 'Cơm gà xối mỡ' AND CUA_HANGMaCuaHang = @shop1);
SET @dish_tra = (SELECT MaMonAn FROM MON_AN WHERE TenMonAn = 'Trà đá' AND CUA_HANGMaCuaHang = @shop1);

-- 4. Giỏ hàng cho bốn khách A, B, C, D: 2 x Cơm gà (35.000) + 1 x Trà đá (5.000) = 75.000
-- (đăng ký khách chưa tạo giỏ nên tạo giỏ nếu chưa có)
INSERT INTO GIO_HANG (TongTamTinh, KHACH_HANGMaKhachHang)
SELECT 0, k.MaKhachHang
FROM KHACH_HANG k
JOIN TAI_KHOAN a ON a.MaTaiKhoan = k.TAI_KHOANMaTaiKhoan
WHERE a.TenDangNhap IN (@kh_a, @kh_b, @kh_c, @kh_d)
  AND NOT EXISTS (SELECT 1 FROM GIO_HANG g WHERE g.KHACH_HANGMaKhachHang = k.MaKhachHang);

-- Xóa món cũ trong giỏ của bốn khách rồi nạp lại
DELETE ct FROM CHITIET_GIOHANG ct
JOIN GIO_HANG g ON g.MaGioHang = ct.GIO_HANGMaGioHang
JOIN KHACH_HANG k ON k.MaKhachHang = g.KHACH_HANGMaKhachHang
JOIN TAI_KHOAN a ON a.MaTaiKhoan = k.TAI_KHOANMaTaiKhoan
WHERE a.TenDangNhap IN (@kh_a, @kh_b, @kh_c, @kh_d);

INSERT INTO CHITIET_GIOHANG (SoLuong, GIO_HANGMaGioHang, MON_ANMaMonAn)
SELECT 2, g.MaGioHang, @dish_com
FROM GIO_HANG g
JOIN KHACH_HANG k ON k.MaKhachHang = g.KHACH_HANGMaKhachHang
JOIN TAI_KHOAN a ON a.MaTaiKhoan = k.TAI_KHOANMaTaiKhoan
WHERE a.TenDangNhap IN (@kh_a, @kh_b, @kh_c, @kh_d);

INSERT INTO CHITIET_GIOHANG (SoLuong, GIO_HANGMaGioHang, MON_ANMaMonAn)
SELECT 1, g.MaGioHang, @dish_tra
FROM GIO_HANG g
JOIN KHACH_HANG k ON k.MaKhachHang = g.KHACH_HANGMaKhachHang
JOIN TAI_KHOAN a ON a.MaTaiKhoan = k.TAI_KHOANMaTaiKhoan
WHERE a.TenDangNhap IN (@kh_a, @kh_b, @kh_c, @kh_d);

UPDATE GIO_HANG g
JOIN KHACH_HANG k ON k.MaKhachHang = g.KHACH_HANGMaKhachHang
JOIN TAI_KHOAN a ON a.MaTaiKhoan = k.TAI_KHOANMaTaiKhoan
SET g.TongTamTinh = 75000
WHERE a.TenDangNhap IN (@kh_a, @kh_b, @kh_c, @kh_d);

-- 5. Kiểm tra nhanh kết quả: phải thấy 4 giỏ, mỗi giỏ 75000, 2 cửa hàng OPEN, 1 admin
SELECT a.TenDangNhap AS khach, g.TongTamTinh AS tong_tam_tinh,
       (SELECT COUNT(*) FROM CHITIET_GIOHANG ct WHERE ct.GIO_HANGMaGioHang = g.MaGioHang) AS so_dong
FROM GIO_HANG g
JOIN KHACH_HANG k ON k.MaKhachHang = g.KHACH_HANGMaKhachHang
JOIN TAI_KHOAN a ON a.MaTaiKhoan = k.TAI_KHOANMaTaiKhoan
WHERE a.TenDangNhap IN (@kh_a, @kh_b, @kh_c, @kh_d);

SELECT a.TenDangNhap AS nguoi_ban, a.TrangThai AS tai_khoan, c.TenCuaHang, c.TrangThai AS cua_hang
FROM CUA_HANG c
JOIN NGUOI_BAN n ON n.MaNguoiBan = c.NGUOI_BANMaNguoiBan
JOIN TAI_KHOAN a ON a.MaTaiKhoan = n.TAI_KHOANMaTaiKhoan
WHERE a.TenDangNhap IN (@nb_1, @nb_2);
