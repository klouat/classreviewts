import { get_db, save_db } from "./db";

/* ===================== TYPES ===================== */
type ClassRow = { class: string };
type VideoRow = { url: string };

/* ===================== FUNCTIONS ===================== */
export async function getClasses(rank: string): Promise<string[]> {
  const db = await get_db();
  const stmt = db.prepare(
    "SELECT DISTINCT class FROM videos WHERE rank = ? ORDER BY class"
  );
  stmt.bind([rank]);

  const results: string[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as ClassRow;
    results.push(row.class);
  }
  stmt.free();
  return results;
}

export async function getVideo(
  rank: string,
  cls: string
): Promise<string | null> {
  const db = await get_db();
  const stmt = db.prepare(
    "SELECT url FROM videos WHERE rank = ? AND class = ? LIMIT 1"
  );
  stmt.bind([rank, cls]);

  let url: string | null = null;
  if (stmt.step()) {
    const row = stmt.getAsObject() as VideoRow;
    url = row.url;
  }
  stmt.free();
  return url;
}

export async function insertVideo(
  rank: string,
  cls: string,
  url: string
): Promise<void> {
  const db = await get_db();
  db.run(
    "INSERT OR REPLACE INTO videos (rank, class, url) VALUES (?, ?, ?)",
    [rank, cls, url]
  );
  save_db();
}

export async function removeVideo(
  rank: string,
  cls: string
): Promise<boolean> {
  const db = await get_db();

  const count_before = db.exec(
    "SELECT COUNT(*) as c FROM videos WHERE rank = ? AND class = ?",
    [rank, cls] as any
  );
  const had_rows = count_before.length > 0
    && count_before[0].values.length > 0
    && (count_before[0].values[0][0] as number) > 0;

  db.run(
    "DELETE FROM videos WHERE rank = ? AND class = ?",
    [rank, cls]
  );
  save_db();
  return had_rows;
}
