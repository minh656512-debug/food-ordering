import AppError from "../../common/utils/AppError.js";

// Kiểm tra email và số điện thoại chưa bị người khác dùng.
// `profileRepository` là customer.repository hoặc seller.repository (cùng có findByEmail, findByPhone).
// `currentId` là hồ sơ đang sửa: được phép giữ nguyên email/số điện thoại của chính mình.
export const assertContactAvailable = async (profileRepository, { email, phone }, currentId) => {
    const [emailOwner, phoneOwner] = await Promise.all([
        profileRepository.findByEmail(email),
        profileRepository.findByPhone(phone)
    ]);

    if (emailOwner && emailOwner.id !== currentId) {
        throw new AppError(409, "EMAIL_ALREADY_USED", "Email đã được sử dụng");
    }
    if (phoneOwner && phoneOwner.id !== currentId) {
        throw new AppError(409, "PHONE_ALREADY_USED", "Số điện thoại đã được sử dụng");
    }
};
