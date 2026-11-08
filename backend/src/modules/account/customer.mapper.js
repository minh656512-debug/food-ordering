// Hồ sơ khách hàng trả về cho chính họ (kèm điểm tích lũy).
export const toCustomerResponse = (customer) => ({
    id: customer.id,
    username: customer.account.username,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    loyaltyPoints: customer.loyaltyPoints
});
