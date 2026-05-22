import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from "path";

dotenv.config();


const isProduction = process.env.NODE_ENV === "production";

const pool = mysql.createPool({
  host: process.env.DB_HOST,           // Should be 'db.cbms.adnyeri.org'
  port: Number(process.env.DB_PORT) || 3306, // MySQL default port is 3306
  user: process.env.DB_USER,           // Should be 'cdbms_user'
  password: process.env.DB_PASSWORD,   // Your actual MySQL password
  database: process.env.DB_NAME,       // Should be 'christian_bio_data'
  connectTimeout: isProduction ? 10000 : undefined,
  charset: 'utf8mb4',
  ssl:
    process.env.NODE_ENV === "production"
      ? {
        rejectUnauthorized: false, // Required for Production
      }
      : undefined,
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

export default pool;