USE food_ordering;
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- TAI_KHOAN: 1 admin, 3 khách hàng, 3 người bán
-- ---------------------------------------------------------------------
INSERT INTO TAI_KHOAN (MaTaiKhoan, TenDangNhap, MatKhau, VaiTro, TrangThai, NgayTao) VALUES
(1, 'admin',    '$2b$10$DMo5fR9kP28ZsaHf7Pbfh..nu0Y0qBwmfhfoHBG7sR0Xir0k09zue', 'ADMIN',    'ACTIVE',           '2026-10-01 08:00:00'),
(2, 'kh_an',    '$2b$10$DMo5fR9kP28ZsaHf7Pbfh..nu0Y0qBwmfhfoHBG7sR0Xir0k09zue', 'CUSTOMER', 'ACTIVE',           '2026-10-05 09:00:00'),
(3, 'kh_binh',  '$2b$10$DMo5fR9kP28ZsaHf7Pbfh..nu0Y0qBwmfhfoHBG7sR0Xir0k09zue', 'CUSTOMER', 'ACTIVE',           '2026-10-06 10:30:00'),
(4, 'kh_chau',  '$2b$10$DMo5fR9kP28ZsaHf7Pbfh..nu0Y0qBwmfhfoHBG7sR0Xir0k09zue', 'CUSTOMER', 'ACTIVE',           '2026-10-07 14:15:00'),
(5, 'nb_hung',  '$2b$10$DMo5fR9kP28ZsaHf7Pbfh..nu0Y0qBwmfhfoHBG7sR0Xir0k09zue', 'SELLER',   'ACTIVE',           '2026-10-02 08:30:00'),
(6, 'nb_lan',   '$2b$10$DMo5fR9kP28ZsaHf7Pbfh..nu0Y0qBwmfhfoHBG7sR0Xir0k09zue', 'SELLER',   'ACTIVE',           '2026-10-03 08:45:00'),
(7, 'nb_minh',  '$2b$10$DMo5fR9kP28ZsaHf7Pbfh..nu0Y0qBwmfhfoHBG7sR0Xir0k09zue', 'SELLER',   'PENDING_APPROVAL', '2026-11-05 16:00:00');

INSERT INTO KHACH_HANG (MaKhachHang, HoTen, Email, SoDienThoai, DiaChi, DiemTichLuy, TAI_KHOANMaTaiKhoan) VALUES
(1, 'Nguyễn Văn An',  'an.nguyen@example.com',  '0901000001', '12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội',    10, 2),
(2, 'Trần Thị Bình',  'binh.tran@example.com',  '0901000002', '88 Nguyễn Trãi, Thanh Xuân, Hà Nội',        12, 3),
(3, 'Lê Minh Châu',   'chau.le@example.com',    '0901000003', '5 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', 0, 4);

INSERT INTO NGUOI_BAN (MaNguoiBan, HoTen, Email, SoDienThoai, TAI_KHOANMaTaiKhoan) VALUES
(1, 'Phạm Quốc Hùng', 'hung.pham@example.com',  '0902000001', 5),
(2, 'Đỗ Thị Lan',     'lan.do@example.com',     '0902000002', 6),
(3, 'Vũ Đức Minh',    'minh.vu@example.com',    '0902000003', 7);

-- ---------------------------------------------------------------------
-- CUA_HANG: 2 cửa hàng đang mở, 1 cửa hàng chờ duyệt
-- ---------------------------------------------------------------------
INSERT INTO CUA_HANG (MaCuaHang, TenCuaHang, DiaChi, SoDienThoai, MoTa, GioMoCua, TrangThai, LyDoTuChoi, NgayTao, NGUOI_BANMaNguoiBan) VALUES
(1, 'Cơm Tấm Cô Ba', '25 Tạ Quang Bửu, Hai Bà Trưng, Hà Nội', '0243000001',
    'Cơm tấm, bún và đồ uống nấu tại chỗ, giao nhanh trong bán kính 5 km.', '07:00 - 21:00', 'OPEN', NULL, '2026-10-02 09:00:00', 1),
(2, 'Phở Gia Truyền & Trà Sữa', '102 Xuân Thủy, Cầu Giấy, Hà Nội', '0243000002',
    'Phở nước dùng ninh xương 12 tiếng, thêm trà sữa và đồ ăn vặt.', '06:00 - 22:00', 'OPEN', NULL, '2026-10-03 09:00:00', 2),
(3, 'Bánh Mì Chảo Minh Béo', '7 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội', '0243000003',
    'Bánh mì chảo, xúc xích, trứng ốp la.', '06:30 - 14:00', 'PENDING_APPROVAL', NULL, '2026-11-05 16:10:00', 3);

-- ---------------------------------------------------------------------
-- DANH_MUC: 5 danh mục
-- ---------------------------------------------------------------------
INSERT INTO DANH_MUC (MaDanhMuc, TenDanhMuc, MoTa) VALUES
(1, 'Cơm',               'Các món cơm'),
(2, 'Bún - Phở - Mì',    'Các món nước và món trộn'),
(3, 'Đồ uống',           'Nước ép, trà, cà phê, sinh tố'),
(4, 'Ăn vặt',            'Món ăn nhẹ, ăn kèm'),
(5, 'Tráng miệng',       'Chè, bánh ngọt');

-- ---------------------------------------------------------------------
-- MON_AN: 21 món (10 món cửa hàng 1, 11 món cửa hàng 2; món 21 đang ngừng bán)
-- Cửa hàng 3 chưa duyệt nên chưa có món.
-- HinhAnh là đường dẫn giả, thay bằng ảnh thật khi có upload.
-- ---------------------------------------------------------------------
INSERT INTO MON_AN (MaMonAn, TenMonAn, MoTa, GiaBan, HinhAnh, TrangThai, DANH_MUCMaDanhMuc, CUA_HANGMaCuaHang) VALUES
( 1, 'Cơm tấm sườn nướng',      'Sườn nướng mật ong, kèm dưa leo và nước mắm',        45000, '/uploads/dishes/com-tam-suon.jpg',     'AVAILABLE',   1, 1),
( 2, 'Cơm tấm sườn bì chả',     'Sườn, bì, chả trứng hấp',                            55000, '/uploads/dishes/com-tam-bi-cha.jpg',   'AVAILABLE',   1, 1),
( 3, 'Cơm gà xối mỡ',           'Đùi gà giòn da, cơm vàng',                           50000, '/uploads/dishes/com-ga-xoi-mo.jpg',    'AVAILABLE',   1, 1),
( 4, 'Cơm rang dưa bò',         'Cơm rang với dưa cải và thịt bò xào',                55000, '/uploads/dishes/com-rang-dua-bo.jpg',  'AVAILABLE',   1, 1),
( 5, 'Bún chả Hà Nội',          'Chả nướng than hoa, bún lá, nước chấm chua ngọt',    50000, '/uploads/dishes/bun-cha.jpg',          'AVAILABLE',   2, 1),
( 6, 'Bún bò Huế',              'Nước dùng sả ớt, giò heo, chả cua',                  55000, '/uploads/dishes/bun-bo-hue.jpg',       'AVAILABLE',   2, 1),
( 7, 'Nước chanh',              'Chanh tươi vắt, ít đường',                           15000, '/uploads/dishes/nuoc-chanh.jpg',       'AVAILABLE',   3, 1),
( 8, 'Trà đào cam sả',          'Trà đen, đào ngâm, cam, sả',                         30000, '/uploads/dishes/tra-dao-cam-sa.jpg',   'AVAILABLE',   3, 1),
( 9, 'Chè khúc bạch',           'Khúc bạch, nhãn, hạnh nhân',                         25000, '/uploads/dishes/che-khuc-bach.jpg',    'AVAILABLE',   5, 1),
(10, 'Nem rán',                 'Nem rán giòn, 4 cái/phần',                           35000, '/uploads/dishes/nem-ran.jpg',          'AVAILABLE',   4, 1),
(11, 'Phở bò tái',              'Bánh phở, bò tái, nước dùng ninh xương',             55000, '/uploads/dishes/pho-bo-tai.jpg',       'AVAILABLE',   2, 2),
(12, 'Phở gà',                  'Gà ta xé, hành lá, chanh',                           50000, '/uploads/dishes/pho-ga.jpg',           'AVAILABLE',   2, 2),
(13, 'Mì xào hải sản',          'Mì trứng xào tôm, mực, rau cải',                     60000, '/uploads/dishes/mi-xao-hai-san.jpg',   'AVAILABLE',   2, 2),
(14, 'Trà sữa trân châu',       'Trà sữa, trân châu đen nấu mỗi ngày',                35000, '/uploads/dishes/tra-sua-tran-chau.jpg','AVAILABLE',   3, 2),
(15, 'Cà phê sữa đá',           'Cà phê phin, sữa đặc',                               25000, '/uploads/dishes/ca-phe-sua-da.jpg',    'AVAILABLE',   3, 2),
(16, 'Sinh tố bơ',              'Bơ sáp xay với sữa đặc',                             35000, '/uploads/dishes/sinh-to-bo.jpg',       'AVAILABLE',   3, 2),
(17, 'Bánh flan',               'Flan caramel mềm mịn',                               20000, '/uploads/dishes/banh-flan.jpg',        'AVAILABLE',   5, 2),
(18, 'Khoai tây chiên',         'Khoai tây chiên giòn, sốt mayonnaise',               30000, '/uploads/dishes/khoai-tay-chien.jpg',  'AVAILABLE',   4, 2),
(19, 'Gỏi cuốn tôm thịt',       '2 cuốn/phần, nước chấm tương đậu phộng',             40000, '/uploads/dishes/goi-cuon.jpg',         'AVAILABLE',   4, 2),
(20, 'Cơm chiên dương châu',    'Cơm chiên trứng, lạp xưởng, tôm',                    45000, '/uploads/dishes/com-chien-duong-chau.jpg','AVAILABLE',1, 2),
(21, 'Bún riêu cua',            'Món theo mùa, hiện tạm ngừng bán',                   50000, '/uploads/dishes/bun-rieu.jpg',         'UNAVAILABLE', 2, 2);

-- ---------------------------------------------------------------------
-- GIO_HANG: khách 1 có 2 món (cửa hàng 2), khách 2 giỏ trống, khách 3 có 2 món (cửa hàng 1)
-- ---------------------------------------------------------------------
INSERT INTO GIO_HANG (MaGioHang, TongTamTinh, KHACH_HANGMaKhachHang) VALUES
(1, 95000, 1),   -- 35.000 x 1 + 30.000 x 2
(2,     0, 2),
(3, 75000, 3);   -- 45.000 x 1 + 15.000 x 2

INSERT INTO CHITIET_GIOHANG (MaChiTietGioHang, SoLuong, GIO_HANGMaGioHang, MON_ANMaMonAn) VALUES
(1, 1, 1, 16),
(2, 2, 1, 18),
(3, 1, 3,  1),
(4, 2, 3,  7);

-- ---------------------------------------------------------------------
-- DON_HANG: 9 đơn phủ đủ 7 trạng thái
--   1 COMPLETED   2 COMPLETED   3 DELIVERING   4 PENDING (chưa thanh toán)
--   5 CANCELLED (đã hoàn tiền)  6 REJECTED (đã hoàn tiền)
--   7 PREPARING   8 PENDING (thanh toán thất bại)   9 CONFIRMED
-- ---------------------------------------------------------------------
INSERT INTO DON_HANG (MaDonHang, NgayDat, NgayCapNhat, TongTien, TrangThai, TenNguoiNhan, SoDienThoaiNhan, DiaChiGiao, GhiChu, LyDo, KHACH_HANGMaKhachHang, CUA_HANGMaCuaHang) VALUES
(1, '2026-10-20 11:30:00', '2026-10-20 12:40:00', 105000, 'COMPLETED',  'Nguyễn Văn An', '0901000001', '12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội',      'Ít cơm',               NULL, 1, 1),
(2, '2026-10-21 18:45:00', '2026-10-21 19:50:00', 125000, 'COMPLETED',  'Trần Thị Bình', '0901000002', '88 Nguyễn Trãi, Thanh Xuân, Hà Nội',          NULL,                   NULL, 2, 2),
(3, '2026-11-06 09:15:00', '2026-11-06 09:50:00',  80000, 'DELIVERING', 'Nguyễn Văn An', '0901000001', '12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội',      'Gọi trước khi giao',   NULL, 1, 2),
(4, '2026-11-06 10:05:00', '2026-11-06 10:05:00',  80000, 'PENDING',    'Lê Minh Châu',  '0901000003', '5 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', NULL,                   NULL, 3, 1),
(5, '2026-11-01 12:00:00', '2026-11-01 12:10:00',  55000, 'CANCELLED',  'Trần Thị Bình', '0901000002', '88 Nguyễn Trãi, Thanh Xuân, Hà Nội',          NULL,                   'Khách đổi ý, hủy khi đơn đang chờ xác nhận', 2, 1),
(6, '2026-11-02 19:20:00', '2026-11-02 19:30:00',  95000, 'REJECTED',   'Lê Minh Châu',  '0901000003', '5 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', NULL,                   'Quán hết nguyên liệu mì xào hải sản', 3, 2),
(7, '2026-11-06 09:40:00', '2026-11-06 09:55:00', 105000, 'PREPARING',  'Nguyễn Văn An', '0901000001', '12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội',      NULL,                   NULL, 1, 1),
(8, '2026-11-06 10:20:00', '2026-11-06 10:21:00',  95000, 'PENDING',    'Trần Thị Bình', '0901000002', '88 Nguyễn Trãi, Thanh Xuân, Hà Nội',          'Thanh toán lại sau',   NULL, 2, 2),
(9, '2026-11-06 09:55:00', '2026-11-06 10:02:00', 100000, 'CONFIRMED',  'Lê Minh Châu',  '0901000003', '5 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', NULL,                   NULL, 3, 2);

INSERT INTO CHITIET_DON_HANG (MaChiTietDonHang, SoLuong, DonGia, DON_HANGMaDonHang, MON_ANMaMonAn) VALUES
-- Đơn 1 (105.000)
( 1, 2, 45000, 1,  1),
( 2, 1, 15000, 1,  7),
-- Đơn 2 (125.000)
( 3, 1, 55000, 2, 11),
( 4, 2, 35000, 2, 14),
-- Đơn 3 (80.000)
( 5, 1, 50000, 3, 12),
( 6, 1, 30000, 3, 18),
-- Đơn 4 (80.000)
( 7, 1, 50000, 4,  3),
( 8, 1, 30000, 4,  8),
-- Đơn 5 (55.000)
( 9, 1, 55000, 5,  2),
-- Đơn 6 (95.000)
(10, 1, 60000, 6, 13),
(11, 1, 35000, 6, 16),
-- Đơn 7 (105.000)
(12, 1, 50000, 7,  5),
(13, 1, 55000, 7,  6),
-- Đơn 8 (95.000)
(14, 1, 45000, 8, 20),
(15, 2, 25000, 8, 15),
-- Đơn 9 (100.000)
(16, 2, 40000, 9, 19),
(17, 1, 20000, 9, 17);

-- ---------------------------------------------------------------------
-- THANH_TOAN: đủ 4 trạng thái UNPAID, PAID, FAILED, REFUNDED
-- ---------------------------------------------------------------------
INSERT INTO THANH_TOAN (MaThanhToan, MaGiaoDich, PhuongThuc, SoTien, TrangThai, NgayThanhToan, DON_HANGMaDonHang) VALUES
(1, 'VNP20261020001',  'VNPAY', 105000, 'PAID',     '2026-10-20 11:32:00', 1),
(2, 'VNP20261021001',  'VNPAY', 125000, 'PAID',     '2026-10-21 18:47:00', 2),
(3, 'VNP20261106001',  'VNPAY',  80000, 'PAID',     '2026-11-06 09:16:00', 3),
(4, NULL,              'VNPAY',  80000, 'UNPAID',   NULL,                  4),
(5, 'VNP20261101001',  'VNPAY',  55000, 'REFUNDED', '2026-11-01 12:02:00', 5),
(6, 'MOCK20261102001', 'MOCK',   95000, 'REFUNDED', '2026-11-02 19:22:00', 6),
(7, 'VNP20261106002',  'VNPAY', 105000, 'PAID',     '2026-11-06 09:42:00', 7),
(8, NULL,              'VNPAY',  95000, 'FAILED',   NULL,                  8),
(9, 'MOCK20261106001', 'MOCK',  100000, 'PAID',     '2026-11-06 09:57:00', 9);

-- ---------------------------------------------------------------------
-- HOAN_TIEN: cho đơn 5 (khách hủy) và đơn 6 (người bán từ chối)
-- ---------------------------------------------------------------------
INSERT INTO HOAN_TIEN (MaHoanTien, SoTien, LyDo, NgayHoanTien, THANH_TOANMaThanhToan) VALUES
(1, 55000, 'Khách hủy đơn khi đơn đang chờ xác nhận',          '2026-11-01 12:10:00', 5),
(2, 95000, 'Người bán từ chối đơn: hết nguyên liệu',           '2026-11-02 19:30:00', 6);

-- ---------------------------------------------------------------------
-- DANH_GIA: chỉ có ở đơn đã hoàn tất (đơn 1 và 2)
-- ---------------------------------------------------------------------
INSERT INTO DANH_GIA (MaDanhGia, SoSao, BinhLuan, NgayDanhGia, KHACH_HANGMaKhachHang, MON_ANMaMonAn, DON_HANGMaDonHang) VALUES
(1, 5, 'Sườn nướng thơm, cơm dẻo, giao đúng giờ.',           '2026-10-20 13:10:00', 1,  1, 1),
(2, 4, 'Nước chanh vừa miệng, hơi nhiều đá.',                '2026-10-20 13:12:00', 1,  7, 1),
(3, 5, 'Nước phở đậm vị, bò mềm.',                           '2026-10-21 20:15:00', 2, 11, 2),
(4, 4, 'Trân châu dai ngon, trà hơi ngọt.',                  '2026-10-21 20:17:00', 2, 14, 2);
