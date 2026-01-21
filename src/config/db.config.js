"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create connection pool
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST, // Should be 'db.cbms.adnyeri.org'
    port: Number(process.env.DB_PORT) || 3306, // MySQL default port is 3306
    user: process.env.DB_USER, // Should be 'cdbms_user'
    password: process.env.DB_PASSWORD, // Your actual MySQL password
    database: process.env.DB_NAME, // Should be 'christian_bio_data'
    // Add these Dreamhost-specific options:
    ssl: {
        rejectUnauthorized: false
    },
    connectTimeout: 10000, // Increase timeout
    charset: 'utf8mb4'
});
// Test connection
pool.getConnection()
    .then((connection) => {
    console.log('✅ MySQL Database connected successfully');
    connection.release();
})
    .catch((err) => {
    console.error('❌ MySQL Database connection failed:', err.message);
});
exports.default = pool;
