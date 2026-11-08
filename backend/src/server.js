import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./config/prisma.js";

const start = async () => {
    try {
        // Kết nối database ngay khi khởi động để lỗi cấu hình lộ ra sớm
        await prisma.$connect();
        console.log("Database connected");

        app.listen(env.port, () => {
            console.log(`Server running at http://localhost:${env.port}`);
            console.log(`API docs at http://localhost:${env.port}/api-docs`);
        });
    } catch (error) {
        console.error("Không thể khởi động server:", error.message);
        process.exit(1);
    }
};

start();
