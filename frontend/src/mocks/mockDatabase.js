// Dữ liệu mẫu khớp 100% với DuLieu.sql và chuẩn camelCase (Mục 6.1)
export const initialMockDb = {
  accounts: [
    { id: 1, username: 'admin',   role: 'ADMIN',    status: 'ACTIVE',           createdAt: '2026-10-01 08:00:00' },
    { id: 2, username: 'kh_an',   role: 'CUSTOMER', status: 'ACTIVE',           createdAt: '2026-10-05 09:00:00' },
    { id: 3, username: 'kh_binh', role: 'CUSTOMER', status: 'ACTIVE',           createdAt: '2026-10-06 10:30:00' },
    { id: 4, username: 'kh_chau', role: 'CUSTOMER', status: 'ACTIVE',           createdAt: '2026-10-07 14:15:00' },
    { id: 5, username: 'nb_hung', role: 'SELLER',   status: 'ACTIVE',           createdAt: '2026-10-02 08:30:00' },
    { id: 6, username: 'nb_lan',  role: 'SELLER',   status: 'ACTIVE',           createdAt: '2026-10-03 08:45:00' },
    { id: 7, username: 'nb_minh', role: 'SELLER',   status: 'PENDING_APPROVAL', createdAt: '2026-11-05 16:00:00' }
  ],
  customers: [
    { id: 1, fullName: 'Nguyễn Văn An', email: 'an.nguyen@example.com', phone: '0901000001', address: '12 Ngõ 45 Trần Cung, Cầu Giấy, Hà Nội', loyaltyPoints: 10, accountId: 2 },
    { id: 2, fullName: 'Trần Thị Bình', email: 'binh.tran@example.com', phone: '0901000002', address: '88 Nguyễn Trãi, Thanh Xuân, Hà Nội', loyaltyPoints: 12, accountId: 3 },
    { id: 3, fullName: 'Lê Minh Châu',  email: 'chau.le@example.com',   phone: '0901000003', address: '5 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', loyaltyPoints: 0, accountId: 4 }
  ],
  sellers: [
    { id: 1, fullName: 'Phạm Quốc Hùng', email: 'hung.pham@example.com', phone: '0902000001', accountId: 5 },
    { id: 2, fullName: 'Đỗ Thị Lan',     email: 'lan.do@example.com',    phone: '0902000002', accountId: 6 },
    { id: 3, fullName: 'Vũ Đức Minh',    email: 'minh.vu@example.com',   phone: '0902000003', accountId: 7 }
  ],
  shops: [
    { id: 1, name: 'Cơm Tấm Cô Ba', address: '25 Tạ Quang Bửu, Hai Bà Trưng, Hà Nội', phone: '0243000001', description: 'Cơm tấm, bún và đồ uống nấu tại chỗ, giao nhanh trong bán kính 5 km.', openingHours: '07:00 - 21:00', status: 'OPEN', rejectReason: null, sellerId: 1 },
    { id: 2, name: 'Phở Gia Truyền & Trà Sữa', address: '102 Xuân Thủy, Cầu Giấy, Hà Nội', phone: '0243000002', description: 'Phở nước dùng ninh xương 12 tiếng, thêm trà sữa và đồ ăn vặt.', openingHours: '06:00 - 22:00', status: 'OPEN', rejectReason: null, sellerId: 2 },
    { id: 3, name: 'Bánh Mì Chảo Minh Béo', address: '7 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội', phone: '0243000003', description: 'Bánh mì chảo, xúc xích, trứng ốp la.', openingHours: '06:30 - 14:00', status: 'PENDING_APPROVAL', rejectReason: null, sellerId: 3 }
  ],
  categories: [
    { id: 1, name: 'Cơm',            description: 'Các món cơm' },
    { id: 2, name: 'Bún - Phở - Mì', description: 'Các món nước và món trộn' },
    { id: 3, name: 'Đồ uống',        description: 'Nước ép, trà, cà phê, sinh tố' },
    { id: 4, name: 'Ăn vặt',         description: 'Món ăn nhẹ, ăn kèm' },
    { id: 5, name: 'Tráng miệng',    description: 'Chè, bánh ngọt' }
  ],
  dishes: [
    { id: 1,  name: 'Cơm tấm sườn nướng',   description: 'Sườn nướng mật ong, kèm dưa leo và nước mắm', price: 45000, status: 'AVAILABLE', categoryId: 1, shopId: 1 },
    { id: 2,  name: 'Cơm tấm sườn bì chả',  description: 'Sườn, bì, chả trứng hấp', price: 55000, status: 'AVAILABLE', categoryId: 1, shopId: 1 },
    { id: 3,  name: 'Cơm gà xối mỡ',        description: 'Đùi gà giòn da, cơm vàng', price: 50000, status: 'AVAILABLE', categoryId: 1, shopId: 1 },
    { id: 4,  name: 'Cơm rang dưa bò',      description: 'Cơm rang với dưa cải và thịt bò xào', price: 55000, status: 'AVAILABLE', categoryId: 1, shopId: 1 },
    { id: 5,  name: 'Bún chả Hà Nội',       description: 'Chả nướng than hoa, bún lá, nước chấm chua ngọt', price: 50000, status: 'AVAILABLE', categoryId: 2, shopId: 1 },
    { id: 6,  name: 'Bún bò Huế',           description: 'Nước dùng sả ớt, giò heo, chả cua', price: 55000, status: 'AVAILABLE', categoryId: 2, shopId: 1 },
    { id: 7,  name: 'Nước chanh',           description: 'Chanh tươi vắt, ít đường', price: 15000, status: 'AVAILABLE', categoryId: 3, shopId: 1 },
    { id: 8,  name: 'Trà đào cam sả',       description: 'Trà đen, đào ngâm, cam, sả', price: 30000, status: 'AVAILABLE', categoryId: 3, shopId: 1 },
    { id: 9,  name: 'Chè khúc bạch',        description: 'Khúc bạch, nhãn, hạnh nhân', price: 25000, status: 'AVAILABLE', categoryId: 5, shopId: 1 },
    { id: 10, name: 'Nem rán',              description: 'Nem rán giòn, 4 cái/phần', price: 35000, status: 'AVAILABLE', categoryId: 4, shopId: 1 },
    { id: 11, name: 'Phở bò tái',           description: 'Bánh phở, bò tái, nước dùng ninh xương', price: 55000, status: 'AVAILABLE', categoryId: 2, shopId: 2 },
    { id: 12, name: 'Phở gà',               description: 'Gà ta xé, hành lá, chanh', price: 50000, status: 'AVAILABLE', categoryId: 2, shopId: 2 },
    { id: 13, name: 'Mì xào hải sản',       description: 'Mì trứng xào tôm, mực, rau cải', price: 60000, status: 'AVAILABLE', categoryId: 2, shopId: 2 },
    { id: 14, name: 'Trà sữa trân châu',    description: 'Trà sữa, trân châu đen nấu mỗi ngày', price: 35000, status: 'AVAILABLE', categoryId: 3, shopId: 2 },
    { id: 15, name: 'Cà phê sữa đá',        description: 'Cà phê phin, sữa đặc', price: 25000, status: 'AVAILABLE', categoryId: 3, shopId: 2 },
    { id: 16, name: 'Sinh tố bơ',           description: 'Bơ sáp xay với sữa đặc', price: 35000, status: 'AVAILABLE', categoryId: 3, shopId: 2 },
    { id: 17, name: 'Bánh flan',            description: 'Flan caramel mềm mịn', price: 20000, status: 'AVAILABLE', categoryId: 5, shopId: 2 },
    { id: 18, name: 'Khoai tây chiên',      description: 'Khoai tây chiên giòn, sốt mayonnaise', price: 30000, status: 'AVAILABLE', categoryId: 4, shopId: 2 },
    { id: 19, name: 'Gỏi cuốn tôm thịt',    description: '2 cuốn/phần, nước chấm tương đậu phộng', price: 40000, status: 'AVAILABLE', categoryId: 4, shopId: 2 },
    { id: 20, name: 'Cơm chiên dương châu', description: 'Cơm chiên trứng, lạp xưởng, tôm', price: 45000, status: 'AVAILABLE', categoryId: 1, shopId: 2 },
    { id: 21, name: 'Bún riêu cua',         description: 'Món theo mùa, hiện tạm ngừng bán', price: 50000, status: 'UNAVAILABLE', categoryId: 2, shopId: 2 }
  ]
};
