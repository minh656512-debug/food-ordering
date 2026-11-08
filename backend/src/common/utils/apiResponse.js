// Định dạng phản hồi chung của toàn bộ API (mục 6.5 trong kế hoạch).

// Thành công: res.json(ok(data, "Thông báo"))
export const ok = (data = null, message = "Thành công") => ({
    success: true,
    message,
    data
});

// Thất bại: res.status(400).json(fail("Thông báo", "ERROR_CODE"))
// `errors` là danh sách lỗi theo từng trường, chỉ có khi dữ liệu gửi lên không hợp lệ.
export const fail = (message, errorCode, errors) => ({
    success: false,
    message,
    errorCode,
    ...(errors && { errors })
});
