import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST ?? (() => { throw new Error('DB_HOST is not defined'); })(),
  user: process.env.DB_USER ?? (() => { throw new Error('DB_USER is not defined'); })(),
  password: process.env.DB_PASSWORD ?? (() => { throw new Error('DB_PASSWORD is not defined'); })(),
  database: process.env.DB_NAME ?? (() => { throw new Error('DB_NAME is not defined'); })(),
  ssl: {
    rejectUnauthorized: true
  }
};

export const connection = mysql.createConnection(dbConfig);

// package.json scripts
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  }
}