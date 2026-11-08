// Bọc controller async để mọi lỗi (throw hoặc reject) được chuyển cho errorHandler,
// tránh request bị treo và không phải viết try/catch trong từng controller.
const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

export default asyncHandler;
