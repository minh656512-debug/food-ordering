DROP DATABASE IF EXISTS food_ordering;
CREATE DATABASE food_ordering
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE food_ordering;

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- 1. TAI_KHOAN  (cả 3 vai trò: CUSTOMER, SELLER, ADMIN)
--    VaiTro:    CUSTOMER | SELLER | ADMIN
--    TrangThai: ACTIVE | LOCKED | PENDING_APPROVAL
-- ---------------------------------------------------------------------
CREATE TABLE TAI_KHOAN (
  MaTaiKhoan   INT           NOT NULL AUTO_INCREMENT,
  TenDangNhap  VARCHAR(50)   NOT NULL,
  MatKhau      VARCHAR(255)  NOT NULL COMMENT 'Mã băm BCrypt, không lưu mật khẩu thật',
  VaiTro       VARCHAR(20)   NOT NULL,
  TrangThai    VARCHAR(30)   NOT NULL DEFAULT 'ACTIVE',
  NgayTao      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (MaTaiKhoan),
  CONSTRAINT uq_tai_khoan_ten_dang_nhap UNIQUE (TenDangNhap),
  CONSTRAINT ck_tai_khoan_vai_tro
    CHECK (VaiTro IN ('CUSTOMER', 'SELLER', 'ADMIN')),
  CONSTRAINT ck_tai_khoan_trang_thai
    CHECK (TrangThai IN ('ACTIVE', 'LOCKED', 'PENDING_APPROVAL'))
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. KHACH_HANG  (1 tài khoản CUSTOMER <-> 1 khách hàng)
-- ---------------------------------------------------------------------
CREATE TABLE KHACH_HANG (
  MaKhachHang       INT           NOT NULL AUTO_INCREMENT,
  HoTen             VARCHAR(100)  NOT NULL,
  Email             VARCHAR(255)  NOT NULL COMMENT 'Sửa từ varbinary(255) trong ERD cũ',
  SoDienThoai       VARCHAR(15)   NOT NULL,
  DiaChi            VARCHAR(255)  NULL,
  DiemTichLuy       INT           NOT NULL DEFAULT 0 COMMENT 'Sửa từ varchar(255) trong ERD cũ',
  TAI_KHOANMaTaiKhoan INT         NOT NULL,
  PRIMARY KEY (MaKhachHang),
  CONSTRAINT uq_khach_hang_tai_khoan UNIQUE (TAI_KHOANMaTaiKhoan),
  CONSTRAINT uq_khach_hang_email UNIQUE (Email),
  CONSTRAINT uq_khach_hang_sdt UNIQUE (SoDienThoai),
  CONSTRAINT ck_khach_hang_diem CHECK (DiemTichLuy >= 0),
  CONSTRAINT fk_khach_hang_tai_khoan
    FOREIGN KEY (TAI_KHOANMaTaiKhoan) REFERENCES TAI_KHOAN (MaTaiKhoan)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. NGUOI_BAN  (1 tài khoản SELLER <-> 1 người bán)
-- ---------------------------------------------------------------------
CREATE TABLE NGUOI_BAN (
  MaNguoiBan        INT           NOT NULL AUTO_INCREMENT,
  HoTen             VARCHAR(100)  NOT NULL,
  Email             VARCHAR(255)  NOT NULL,
  SoDienThoai       VARCHAR(15)   NOT NULL,
  TAI_KHOANMaTaiKhoan INT         NOT NULL,
  PRIMARY KEY (MaNguoiBan),
  CONSTRAINT uq_nguoi_ban_tai_khoan UNIQUE (TAI_KHOANMaTaiKhoan),
  CONSTRAINT uq_nguoi_ban_email UNIQUE (Email),
  CONSTRAINT uq_nguoi_ban_sdt UNIQUE (SoDienThoai),
  CONSTRAINT fk_nguoi_ban_tai_khoan
    FOREIGN KEY (TAI_KHOANMaTaiKhoan) REFERENCES TAI_KHOAN (MaTaiKhoan)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. CUA_HANG
--    TrangThai: PENDING_APPROVAL | OPEN | CLOSED | REJECTED
--    (đăng ký mới = PENDING_APPROVAL; chỉ đăng món được khi đã duyệt)
-- ---------------------------------------------------------------------
CREATE TABLE CUA_HANG (
  MaCuaHang         INT           NOT NULL AUTO_INCREMENT,
  TenCuaHang        VARCHAR(150)  NOT NULL,
  DiaChi            VARCHAR(255)  NOT NULL,
  SoDienThoai       VARCHAR(15)   NOT NULL,
  MoTa              TEXT          NULL,
  GioMoCua          VARCHAR(50)   NULL COMMENT 'Ví dụ: 07:00 - 21:00',
  TrangThai         VARCHAR(30)   NOT NULL DEFAULT 'PENDING_APPROVAL',
  LyDoTuChoi        VARCHAR(255)  NULL COMMENT 'Đề xuất thêm: lý do khi admin từ chối',
  NgayTao           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  NGUOI_BANMaNguoiBan INT         NOT NULL,
  PRIMARY KEY (MaCuaHang),
  CONSTRAINT ck_cua_hang_trang_thai
    CHECK (TrangThai IN ('PENDING_APPROVAL', 'OPEN', 'CLOSED', 'REJECTED')),
  CONSTRAINT fk_cua_hang_nguoi_ban
    FOREIGN KEY (NGUOI_BANMaNguoiBan) REFERENCES NGUOI_BAN (MaNguoiBan)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. DANH_MUC  (do admin quản lý)
-- ---------------------------------------------------------------------
CREATE TABLE DANH_MUC (
  MaDanhMuc     INT           NOT NULL AUTO_INCREMENT,
  TenDanhMuc    VARCHAR(100)  NOT NULL,
  MoTa          VARCHAR(255)  NULL,
  PRIMARY KEY (MaDanhMuc),
  CONSTRAINT uq_danh_muc_ten UNIQUE (TenDanhMuc)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. MON_AN
--    TrangThai: AVAILABLE | UNAVAILABLE  (ngừng bán, không xóa món đã có trong đơn)
-- ---------------------------------------------------------------------
CREATE TABLE MON_AN (
  MaMonAn           INT             NOT NULL AUTO_INCREMENT,
  TenMonAn          VARCHAR(255)    NOT NULL,
  MoTa              TEXT            NULL,
  GiaBan            DECIMAL(19, 0)  NOT NULL,
  HinhAnh           VARCHAR(500)    NULL,
  TrangThai         VARCHAR(30)     NOT NULL DEFAULT 'AVAILABLE',
  DANH_MUCMaDanhMuc INT             NOT NULL,
  CUA_HANGMaCuaHang INT             NOT NULL,
  PRIMARY KEY (MaMonAn),
  CONSTRAINT ck_mon_an_gia CHECK (GiaBan > 0),
  CONSTRAINT ck_mon_an_trang_thai
    CHECK (TrangThai IN ('AVAILABLE', 'UNAVAILABLE')),
  CONSTRAINT fk_mon_an_danh_muc
    FOREIGN KEY (DANH_MUCMaDanhMuc) REFERENCES DANH_MUC (MaDanhMuc),
  CONSTRAINT fk_mon_an_cua_hang
    FOREIGN KEY (CUA_HANGMaCuaHang) REFERENCES CUA_HANG (MaCuaHang)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. GIO_HANG  (mỗi khách hàng một giỏ)
-- ---------------------------------------------------------------------
CREATE TABLE GIO_HANG (
  MaGioHang           INT             NOT NULL AUTO_INCREMENT,
  TongTamTinh         DECIMAL(19, 0)  NOT NULL DEFAULT 0,
  NgayCapNhat         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP,
  KHACH_HANGMaKhachHang INT           NOT NULL,
  PRIMARY KEY (MaGioHang),
  CONSTRAINT uq_gio_hang_khach_hang UNIQUE (KHACH_HANGMaKhachHang),
  CONSTRAINT ck_gio_hang_tong CHECK (TongTamTinh >= 0),
  CONSTRAINT fk_gio_hang_khach_hang
    FOREIGN KEY (KHACH_HANGMaKhachHang) REFERENCES KHACH_HANG (MaKhachHang)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. CHITIET_GIOHANG  (một món chỉ có một dòng trong giỏ, thêm lại thì cộng số lượng)
--    Quy tắc "một giỏ chỉ chứa món của một cửa hàng" kiểm tra ở service (BE2).
-- ---------------------------------------------------------------------
CREATE TABLE CHITIET_GIOHANG (
  MaChiTietGioHang    INT   NOT NULL AUTO_INCREMENT,
  SoLuong             INT   NOT NULL DEFAULT 1,
  GIO_HANGMaGioHang   INT   NOT NULL,
  MON_ANMaMonAn       INT   NOT NULL,
  PRIMARY KEY (MaChiTietGioHang),
  CONSTRAINT uq_chitiet_giohang_mon UNIQUE (GIO_HANGMaGioHang, MON_ANMaMonAn),
  CONSTRAINT ck_chitiet_giohang_sl CHECK (SoLuong >= 1),
  CONSTRAINT fk_chitiet_giohang_gio_hang
    FOREIGN KEY (GIO_HANGMaGioHang) REFERENCES GIO_HANG (MaGioHang) ON DELETE CASCADE,
  CONSTRAINT fk_chitiet_giohang_mon_an
    FOREIGN KEY (MON_ANMaMonAn) REFERENCES MON_AN (MaMonAn)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. DON_HANG
--    TrangThai: PENDING | CONFIRMED | PREPARING | DELIVERING |
--               COMPLETED | CANCELLED | REJECTED
--    LyDo: lý do hủy (khách) hoặc từ chối (người bán)
-- ---------------------------------------------------------------------
CREATE TABLE DON_HANG (
  MaDonHang           INT             NOT NULL AUTO_INCREMENT,
  NgayDat             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  NgayCapNhat         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP,
  TongTien            DECIMAL(19, 0)  NOT NULL,
  TrangThai           VARCHAR(30)     NOT NULL DEFAULT 'PENDING',
  TenNguoiNhan        VARCHAR(100)    NOT NULL,
  SoDienThoaiNhan     VARCHAR(15)     NOT NULL,
  DiaChiGiao          VARCHAR(255)    NOT NULL,
  GhiChu              VARCHAR(500)    NULL,
  LyDo                VARCHAR(255)    NULL,
  KHACH_HANGMaKhachHang INT           NOT NULL,
  CUA_HANGMaCuaHang     INT           NOT NULL,
  PRIMARY KEY (MaDonHang),
  CONSTRAINT ck_don_hang_tong CHECK (TongTien >= 0),
  CONSTRAINT ck_don_hang_trang_thai
    CHECK (TrangThai IN ('PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING',
                         'COMPLETED', 'CANCELLED', 'REJECTED')),
  CONSTRAINT fk_don_hang_khach_hang
    FOREIGN KEY (KHACH_HANGMaKhachHang) REFERENCES KHACH_HANG (MaKhachHang),
  CONSTRAINT fk_don_hang_cua_hang
    FOREIGN KEY (CUA_HANGMaCuaHang) REFERENCES CUA_HANG (MaCuaHang)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. CHITIET_DON_HANG  (DonGia = giá tại thời điểm đặt, không đổi khi món đổi giá)
-- ---------------------------------------------------------------------
CREATE TABLE CHITIET_DON_HANG (
  MaChiTietDonHang    INT             NOT NULL AUTO_INCREMENT,
  SoLuong             INT             NOT NULL,
  DonGia              DECIMAL(19, 0)  NOT NULL,
  DON_HANGMaDonHang   INT             NOT NULL,
  MON_ANMaMonAn       INT             NOT NULL,
  PRIMARY KEY (MaChiTietDonHang),
  CONSTRAINT uq_chitiet_don_hang_mon UNIQUE (DON_HANGMaDonHang, MON_ANMaMonAn),
  CONSTRAINT ck_chitiet_don_hang_sl CHECK (SoLuong >= 1),
  CONSTRAINT ck_chitiet_don_hang_gia CHECK (DonGia >= 0),
  CONSTRAINT fk_chitiet_don_hang_don_hang
    FOREIGN KEY (DON_HANGMaDonHang) REFERENCES DON_HANG (MaDonHang),
  CONSTRAINT fk_chitiet_don_hang_mon_an
    FOREIGN KEY (MON_ANMaMonAn) REFERENCES MON_AN (MaMonAn)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. THANH_TOAN  (PaymentStatus nằm ở cột TrangThai)
--    TrangThai: UNPAID | PAID | FAILED | REFUNDED
--    PhuongThuc: VNPAY | COD | MOCK  (MOCK = cổng thanh toán mô phỏng)
-- ---------------------------------------------------------------------
CREATE TABLE THANH_TOAN (
  MaThanhToan       INT             NOT NULL AUTO_INCREMENT,
  MaGiaoDich        VARCHAR(100)    NULL,
  PhuongThuc        VARCHAR(30)     NOT NULL,
  SoTien            DECIMAL(19, 0)  NOT NULL,
  TrangThai         VARCHAR(30)     NOT NULL DEFAULT 'UNPAID',
  NgayThanhToan     DATETIME        NULL,
  DON_HANGMaDonHang INT             NOT NULL,
  PRIMARY KEY (MaThanhToan),
  CONSTRAINT uq_thanh_toan_ma_giao_dich UNIQUE (MaGiaoDich),
  CONSTRAINT ck_thanh_toan_so_tien CHECK (SoTien >= 0),
  CONSTRAINT ck_thanh_toan_phuong_thuc
    CHECK (PhuongThuc IN ('VNPAY', 'COD', 'MOCK')),
  CONSTRAINT ck_thanh_toan_trang_thai
    CHECK (TrangThai IN ('UNPAID', 'PAID', 'FAILED', 'REFUNDED')),
  CONSTRAINT fk_thanh_toan_don_hang
    FOREIGN KEY (DON_HANGMaDonHang) REFERENCES DON_HANG (MaDonHang)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. HOAN_TIEN  (tạo khi hủy hoặc từ chối đơn đã thanh toán)
-- ---------------------------------------------------------------------
CREATE TABLE HOAN_TIEN (
  MaHoanTien          INT             NOT NULL AUTO_INCREMENT,
  SoTien              DECIMAL(19, 0)  NOT NULL,
  LyDo                VARCHAR(255)    NOT NULL,
  NgayHoanTien        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  THANH_TOANMaThanhToan INT           NOT NULL,
  PRIMARY KEY (MaHoanTien),
  CONSTRAINT uq_hoan_tien_thanh_toan UNIQUE (THANH_TOANMaThanhToan),
  CONSTRAINT ck_hoan_tien_so_tien CHECK (SoTien > 0),
  CONSTRAINT fk_hoan_tien_thanh_toan
    FOREIGN KEY (THANH_TOANMaThanhToan) REFERENCES THANH_TOAN (MaThanhToan)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 13. DANH_GIA  (đánh giá món; mỗi món trong một đơn chỉ đánh giá một lần)
--    Chỉ đơn COMPLETED của chính khách đó mới được đánh giá (kiểm tra ở service BE2).
--    Điểm cửa hàng = trung bình SoSao các món của cửa hàng.
-- ---------------------------------------------------------------------
CREATE TABLE DANH_GIA (
  MaDanhGia             INT           NOT NULL AUTO_INCREMENT,
  SoSao                 INT           NOT NULL,
  BinhLuan              VARCHAR(1000) NULL,
  NgayDanhGia           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KHACH_HANGMaKhachHang INT           NOT NULL,
  MON_ANMaMonAn         INT           NOT NULL,
  DON_HANGMaDonHang     INT           NOT NULL,
  PRIMARY KEY (MaDanhGia),
  CONSTRAINT uq_danh_gia_don_mon UNIQUE (DON_HANGMaDonHang, MON_ANMaMonAn),
  CONSTRAINT ck_danh_gia_so_sao CHECK (SoSao BETWEEN 1 AND 5),
  CONSTRAINT fk_danh_gia_khach_hang
    FOREIGN KEY (KHACH_HANGMaKhachHang) REFERENCES KHACH_HANG (MaKhachHang),
  CONSTRAINT fk_danh_gia_mon_an
    FOREIGN KEY (MON_ANMaMonAn) REFERENCES MON_AN (MaMonAn),
  CONSTRAINT fk_danh_gia_don_hang
    FOREIGN KEY (DON_HANGMaDonHang) REFERENCES DON_HANG (MaDonHang)
) ENGINE=InnoDB;

-- =====================================================================
-- CHỈ MỤC (index) cho cột hay tìm
-- (khóa ngoại và UNIQUE đã được MySQL tự đánh index)
-- =====================================================================
CREATE INDEX idx_mon_an_ten               ON MON_AN (TenMonAn);
CREATE INDEX idx_mon_an_trang_thai        ON MON_AN (TrangThai);
CREATE INDEX idx_cua_hang_ten             ON CUA_HANG (TenCuaHang);
CREATE INDEX idx_cua_hang_trang_thai      ON CUA_HANG (TrangThai);
CREATE INDEX idx_don_hang_trang_thai      ON DON_HANG (TrangThai);
-- Lọc đơn của một cửa hàng theo trạng thái và ngày; dùng cho thống kê doanh thu
CREATE INDEX idx_don_hang_cua_hang_ngay   ON DON_HANG (CUA_HANGMaCuaHang, TrangThai, NgayDat);
-- Lịch sử đơn của một khách hàng, mới nhất trước
CREATE INDEX idx_don_hang_khach_ngay      ON DON_HANG (KHACH_HANGMaKhachHang, NgayDat);
CREATE INDEX idx_thanh_toan_trang_thai    ON THANH_TOAN (TrangThai);