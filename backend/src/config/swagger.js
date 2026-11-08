import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJsdoc from "swagger-jsdoc";

const modulesDir = path.dirname(fileURLToPath(import.meta.url)) + "/../modules";

// Swagger đọc chú thích @swagger ngay trong các file *.routes.js của mọi module.
// (swagger-jsdoc cần dấu "/" kể cả trên Windows nên đổi "\" thành "/")
const apis = [path.resolve(modulesDir, "**/*.routes.js").replace(/\\/g, "/")];

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Food Ordering API",
            version: "1.0.0",
            description: "API website đặt món ăn trực tuyến"
        },
        servers: [{ url: "/api/v1" }],
        components: {
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
            },
            schemas: {
                ApiError: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Món ăn đã hết hàng" },
                        errorCode: { type: "string", example: "DISH_OUT_OF_STOCK" },
                        errors: {
                            type: "array",
                            description: "Chỉ có khi lỗi validate (400)",
                            items: {
                                type: "object",
                                properties: {
                                    field: { type: "string", example: "email" },
                                    message: { type: "string", example: "Email không hợp lệ" }
                                }
                            }
                        }
                    }
                },
                AuthResult: {
                    type: "object",
                    properties: {
                        token: { type: "string" },
                        tokenType: { type: "string", example: "Bearer" },
                        user: {
                            type: "object",
                            properties: {
                                accountId: { type: "integer", example: 2 },
                                username: { type: "string", example: "kh_an" },
                                role: { type: "string", enum: ["CUSTOMER", "SELLER", "ADMIN"] },
                                status: {
                                    type: "string",
                                    enum: ["ACTIVE", "LOCKED", "PENDING_APPROVAL"]
                                },
                                fullName: { type: "string", nullable: true }
                            }
                        }
                    }
                },
                Customer: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        username: { type: "string" },
                        fullName: { type: "string" },
                        email: { type: "string" },
                        phone: { type: "string" },
                        address: { type: "string", nullable: true },
                        loyaltyPoints: { type: "integer" }
                    }
                },
                Seller: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        username: { type: "string" },
                        accountStatus: { type: "string" },
                        fullName: { type: "string" },
                        email: { type: "string" },
                        phone: { type: "string" },
                        shop: {
                            type: "object",
                            nullable: true,
                            description: "Cửa hàng gần nhất, null nếu chưa đăng ký",
                            properties: {
                                id: { type: "integer" },
                                name: { type: "string" },
                                status: {
                                    type: "string",
                                    enum: ["PENDING_APPROVAL", "OPEN", "CLOSED", "REJECTED"]
                                },
                                rejectReason: { type: "string", nullable: true }
                            }
                        }
                    }
                },
                Shop: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        address: { type: "string" },
                        phone: { type: "string" },
                        description: { type: "string", nullable: true },
                        openingHours: { type: "string", nullable: true },
                        status: {
                            type: "string",
                            enum: ["PENDING_APPROVAL", "OPEN", "CLOSED", "REJECTED"]
                        },
                        rejectReason: { type: "string", nullable: true },
                        sellerId: { type: "integer" },
                        createdAt: { type: "string", format: "date-time" }
                    }
                }
            }
        }
    },
    apis
};

export const swaggerSpec = swaggerJsdoc(options);
