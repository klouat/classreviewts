"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRanks = getRanks;
exports.getClasses = getClasses;
exports.getVideo = getVideo;
exports.insertVideo = insertVideo;
exports.removeVideo = removeVideo;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
/* ===================== DB ===================== */
const db = new better_sqlite3_1.default("videos.db");
/* ===================== INIT TABLE ===================== */
db.prepare(`
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank TEXT NOT NULL,
    class TEXT NOT NULL,
    url TEXT NOT NULL,
    UNIQUE(rank, class)
  )
`).run();
/* ===================== FUNCTIONS ===================== */
function getRanks() {
    const rows = db
        .prepare("SELECT DISTINCT rank FROM videos ORDER BY rank")
        .all();
    return rows.map(r => r.rank);
}
function getClasses(rank) {
    const rows = db
        .prepare("SELECT DISTINCT class FROM videos WHERE rank = ? ORDER BY class")
        .all(rank);
    return rows.map(r => r.class);
}
function getVideo(rank, cls) {
    const row = db
        .prepare("SELECT url FROM videos WHERE rank = ? AND class = ? LIMIT 1")
        .get(rank, cls);
    return row?.url ?? null;
}
function insertVideo(rank, cls, url) {
    db.prepare(`
    INSERT OR REPLACE INTO videos (rank, class, url)
    VALUES (?, ?, ?)
  `).run(rank, cls, url);
}
function removeVideo(rank, cls) {
    const result = db
        .prepare("DELETE FROM videos WHERE rank = ? AND class = ?")
        .run(rank, cls);
    return result.changes > 0;
}
