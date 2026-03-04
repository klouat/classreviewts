import initSqlJs, { Database } from "sql.js";
import * as fs from "fs";
import * as path from "path";

const DB_PATH = path.resolve("videos.db");

let db: Database;

export async function get_db(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rank TEXT NOT NULL,
      class TEXT NOT NULL,
      url TEXT NOT NULL,
      UNIQUE(rank, class)
    )
  `);

  save_db();
  console.log("✅ SQLite connected (sql.js)");
  return db;
}

export function save_db(): void {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}
