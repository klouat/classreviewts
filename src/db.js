"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
exports.db = new better_sqlite3_1.default("videos.db");
exports.db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank TEXT NOT NULL,
    class TEXT NOT NULL,
    url TEXT NOT NULL,
    UNIQUE(rank, class)
  );
`);
console.log("✅ SQLite connected");
