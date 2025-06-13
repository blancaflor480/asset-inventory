"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();

const dbConfig = {
    host: process.env.DB_HOST || 'linen-snake-138010.hostingersite.com',
    user: process.env.DB_USER || 'u408414471_admin',
    password: process.env.DB_PASSWORD || 'Hakdog007@',
    database: process.env.DB_NAME || 'u408414471_inventory',
    port: parseInt(process.env.DB_PORT || '3306'),
    // Connection timeout settings
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    // SSL settings - try both options
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    // Reconnection settings
    reconnect: true,
    // Pool settings for better connection management
    connectionLimit: 10,
    acquireTimeout: 60000,
    waitForConnections: true,
    queueLimit: 0
};

// Create connection pool instead of single connection
const createConnectionPool = () => {
    try {
        console.log('Creating database connection pool...');
        console.log('Connecting to host:', dbConfig.host);
        
        const pool = promise_1.default.createPool(dbConfig);
        
        // Test the connection
        pool.getConnection()
            .then(connection => {
                console.log('Database connected successfully');
                connection.release();
            })
            .catch(error => {
                console.error('Database connection failed:', error.message);
                console.error('Error code:', error.code);
                console.error('Error errno:', error.errno);
                
                // Log specific error details
                if (error.code === 'ETIMEDOUT') {
                    console.error('Connection timeout - check if database allows external connections');
                }
                if (error.code === 'ECONNREFUSED') {
                    console.error('Connection refused - check host and port');
                }
                if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                    console.error('Access denied - check username and password');
                }
            });
            
        return pool;
    } catch (error) {
        console.error('Failed to create database pool:', error);
        throw error;
    }
};

// Export the connection pool
exports.connection = createConnectionPool();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Closing database connection pool...');
    if (exports.connection) {
        exports.connection.end(() => {
            console.log('Database connection pool closed');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});
