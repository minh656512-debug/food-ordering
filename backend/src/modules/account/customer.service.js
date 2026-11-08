import AppError from "../../common/utils/AppError.js";
import * as customerMapper from "./customer.mapper.js";
import * as customerRepository from "./customer.repository.js";
import { assertContactAvailable } from "./profile.service.js";

const findCustomerOrFail = async (accountId) => {
    const customer = await customerRepository.findByAccountId(accountId);
    if (!customer) {
        throw new AppError(404, "CUSTOMER_NOT_FOUND", "Không tìm thấy hồ sơ khách hàng");
    }
    return customer;
};

export const getProfile = async (accountId) =>
    customerMapper.toCustomerResponse(await findCustomerOrFail(accountId));

export const updateProfile = async (accountId, data) => {
    const customer = await findCustomerOrFail(accountId);
    await assertContactAvailable(customerRepository, data, customer.id);

    const updated = await customerRepository.update(customer.id, data);
    return customerMapper.toCustomerResponse(updated);
};
