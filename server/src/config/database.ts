import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'linen-snake-138010.hostingersite.com',
  user: process.env.DB_USER || 'u408414471_admin',
  password: process.env.DB_PASSWORD || 'Hakdog007@',
  database: process.env.DB_NAME || 'u408414471_inventory',
};

export const connection = mysql.createConnection(dbConfig);
