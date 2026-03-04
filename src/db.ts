import Database from "better-sqlite3";

export const db = new Database("videos.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank TEXT NOT NULL,
    class TEXT NOT NULL,
    url TEXT NOT NULL,
    UNIQUE(rank, class)
  );
`);

console.log("✅ SQLite connected");
