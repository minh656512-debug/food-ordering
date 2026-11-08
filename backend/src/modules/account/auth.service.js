import bcrypt from "bcryptjs";
import { ACCOUNT_STATUS } from "../../common/constants/accountStatus.js";
import { ROLES } from "../../common/constants/roles.js";
import AppError from "../../common/utils/AppError.js";
import { signToken } from "../../common/utils/jwt.js";
import prisma from "../../config/prisma.js";
import * as authMapper from "./auth.mapper.js";
import * as authRepository from "./auth.repository.js";
import * as customerRepository from "./customer.repository.js";
import { assertContactAvailable } from "./profile.service.js";
import * as sellerRepository from "./seller.repository.js";

const SALT_ROUNDS = 10;

// Mỗi vai trò đăng ký được có một bảng hồ sơ riêng
const PROFILE_REPOSITORIES = {
    [ROLES.CUSTOMER]: customerRepository,
    [ROLES.SELLER]: sellerRepository
};

// Đăng ký: tạo Account + hồ sơ (Customer hoặc Seller) trong cùng một transaction,
// nếu bước nào lỗi thì cả hai cùng bị hủy, không để lại tài khoản "mồ côi".
export const register = async (input) => {
    const { username, password, role, ...contact } = input;

    if (await authRepository.findByUsername(username)) {
        throw new AppError(409, "USERNAME_ALREADY_USED", "Tên đăng nhập đã tồn tại");
    }

    const profileRepository = PROFILE_REPOSITORIES[role];
    await assertContactAvailable(profileRepository, contact);

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Khách hàng dùng được ngay; người bán phải chờ quản trị viên duyệt (giai đoạn 3)
    const status = role === ROLES.SELLER ? ACCOUNT_STATUS.PENDING_APPROVAL : ACCOUNT_STATUS.ACTIVE;

    const result = await prisma.$transaction(async (tx) => {
        const account = await authRepository.create(
            { username, password: passwordHash, role, status },
            tx
        );

        const profileData = {
            fullName: contact.fullName,
            email: contact.email,
            phone: contact.phone,
            accountId: account.id,
            // Bảng Seller không có cột địa chỉ
            ...(role === ROLES.CUSTOMER && { address: contact.address })
        };
        const profile = await profileRepository.create(profileData, tx);

        return { account, profile };
    });

    return authMapper.toRegisterResponse(result);
};

// Đăng nhập: kiểm tra mật khẩu, tài khoản không bị khóa, rồi cấp JWT.
export const login = async ({ username, password }) => {
    const account = await authRepository.findByUsername(username);
    const passwordMatches = account && (await bcrypt.compare(password, account.password));

    // Cùng một thông báo cho "sai tên đăng nhập" và "sai mật khẩu" để không lộ tài khoản nào tồn tại
    if (!passwordMatches) {
        throw new AppError(401, "INVALID_CREDENTIALS", "Sai tên đăng nhập hoặc mật khẩu");
    }
    if (account.status === ACCOUNT_STATUS.LOCKED) {
        throw new AppError(403, "ACCOUNT_LOCKED", "Tài khoản đã bị khóa");
    }

    const token = signToken({ accountId: account.id, role: account.role });
    return authMapper.toAuthResponse({ token, account });
};

// Đổi mật khẩu của chính người đang đăng nhập.
export const changePassword = async (accountId, { currentPassword, newPassword }) => {
    const account = await authRepository.findById(accountId);
    if (!account) {
        throw new AppError(404, "ACCOUNT_NOT_FOUND", "Không tìm thấy tài khoản");
    }

    // Dùng 400 (không dùng 401) vì 401 nghĩa là "token không hợp lệ", frontend sẽ tự đăng xuất người dùng
    if (!(await bcrypt.compare(currentPassword, account.password))) {
        throw new AppError(400, "INVALID_CURRENT_PASSWORD", "Mật khẩu hiện tại không đúng");
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await authRepository.updatePassword(accountId, passwordHash);
};
