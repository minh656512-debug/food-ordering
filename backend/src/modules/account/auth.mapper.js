// Đổi dữ liệu Account từ database sang JSON trả về. Không bao giờ trả trường password.

const getFullName = (account) => account.customer?.fullName ?? account.seller?.fullName ?? null;

// Đăng ký thành công
export const toRegisterResponse = ({ account, profile }) => ({
    accountId: account.id,
    username: account.username,
    role: account.role,
    status: account.status,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone
});

// Đăng nhập thành công: token + thông tin cơ bản của người dùng
export const toAuthResponse = ({ token, account }) => ({
    token,
    tokenType: "Bearer",
    user: {
        accountId: account.id,
        username: account.username,
        role: account.role,
        status: account.status,
        fullName: getFullName(account)
    }
});
