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
};
exports.connection = promise_1.default.createConnection(dbConfig);
//# sourceMappingURL=database.js.map
