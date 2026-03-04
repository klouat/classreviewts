import Database from "better-sqlite3";

/* ===================== TYPES ===================== */
type RankRow = { rank: string };
type ClassRow = { class: string };
type VideoRow = { url: string };

/* ===================== DB ===================== */
const db = new Database("videos.db");

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
export function getRanks(): string[] {
  const rows = db
    .prepare("SELECT DISTINCT rank FROM videos ORDER BY rank")
    .all() as RankRow[];

  return rows.map(r => r.rank);
}

export function getClasses(rank: string): string[] {
  const rows = db
    .prepare(
      "SELECT DISTINCT class FROM videos WHERE rank = ? ORDER BY class"
    )
    .all(rank) as ClassRow[];

  return rows.map(r => r.class);
}

export function getVideo(rank: string, cls: string): string | null {
  const row = db
    .prepare(
      "SELECT url FROM videos WHERE rank = ? AND class = ? LIMIT 1"
    )
    .get(rank, cls) as VideoRow | undefined;

  return row?.url ?? null;
}

export function insertVideo(
  rank: string,
  cls: string,
  url: string
) {
  db.prepare(`
    INSERT OR REPLACE INTO videos (rank, class, url)
    VALUES (?, ?, ?)
  `).run(rank, cls, url);
}

export function removeVideo(rank: string, cls: string): boolean {
  const result = db
    .prepare("DELETE FROM videos WHERE rank = ? AND class = ?")
    .run(rank, cls);

  return result.changes > 0;
}

