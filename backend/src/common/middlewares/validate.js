import AppError from "../utils/AppError.js";

// Kiểm tra dữ liệu client gửi lên bằng schema Zod. Sai thì trả 400 theo định dạng chung.
// Dùng: validate(createDishSchema)            -> kiểm tra req.body
//       validate(searchDishQuerySchema, "query") -> kiểm tra req.query ("params" cho req.params)
// Dữ liệu đã được Zod làm sạch (trim, ép kiểu...) sẽ thay thế dữ liệu gốc.
const validate =
    (schema, source = "body") =>
    (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }));
            throw new AppError(400, "VALIDATION_ERROR", errors[0].message, errors);
        }

        if (source === "body") {
            req.body = result.data;
        } else {
            // Express 5: req.query chỉ có getter nên phải định nghĩa lại thuộc tính.
            Object.defineProperty(req, source, {
                value: result.data,
                writable: true,
                configurable: true,
                enumerable: true
            });
        }

        next();
    };

export default validate;
