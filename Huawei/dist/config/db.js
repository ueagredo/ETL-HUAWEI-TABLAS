"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
// config/db.ts
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'kuramstock.cpe5k0wndcqw.us-east-2.rds.amazonaws.com',
    user: process.env.DB_USER || 'Jimsy',
    password: process.env.DB_PASS || 'Xmango,82!',
    database: process.env.DB_NAME || 'Internexa',
    waitForConnections: true,
    connectionLimit: 10,
});
