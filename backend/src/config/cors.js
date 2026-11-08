import { env } from "./env.js";

// Chỉ cho phép frontend (mặc định http://localhost:5173) gọi API.
export const corsOptions = {
    origin: env.clientUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
