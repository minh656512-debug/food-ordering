import "./env.js"; // đảm bảo .env đã được nạp trước khi tạo PrismaClient
import { PrismaClient } from "@prisma/client";

// Một PrismaClient dùng chung cho cả ứng dụng (tạo nhiều client sẽ cạn kết nối).
const prisma = new PrismaClient();

export default prisma;
