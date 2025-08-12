// config/db.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'kuramstock.cpe5k0wndcqw.us-east-2.rds.amazonaws.com',
  user: process.env.DB_USER || 'Jimsy',
  password: process.env.DB_PASS || 'Xmango,82!',
  database: process.env.DB_NAME || 'Internexa',
  waitForConnections: true,
  connectionLimit: 10,
});