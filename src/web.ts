import express, { Request, Response } from "express";
import { get_db, save_db } from "./db";

/* ===================== FIXED RANKS ===================== */
const RANKS = [
  { label: "Rank ?", id: "rank_?" },
  { label: "Rank SS", id: "rank_ss" },
  { label: "Rank S+", id: "rank_s+" },
  { label: "Rank S", id: "rank_s" },
  { label: "Rank S-", id: "rank_s-" },
  { label: "Rank A", id: "rank_a" }
] as const;

const app = express();
app.use(express.json());
app.use(express.static("public"));

console.log("🚀 web.ts loaded");

/* ===================== API ===================== */

/* RANKS */
app.get("/api/ranks", (_req: Request, res: Response) => {
  res.json(RANKS);
});

/* GET (with filters) */
app.get("/api/videos", async (req: Request, res: Response) => {
  const db = await get_db();
  const { rank, cls } = req.query as {
    rank?: string;
    cls?: string;
  };

  let sql = "SELECT * FROM videos WHERE 1=1";
  const params: string[] = [];

  if (rank) {
    sql += " AND rank = ?";
    params.push(rank);
  }
  if (cls) {
    sql += " AND class = ?";
    params.push(cls);
  }

  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);

  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();

  res.json(rows);
});

/* ADD */
app.post("/api/videos", async (req: Request, res: Response) => {
  const db = await get_db();
  const { rank, class: cls, url } = req.body as {
    rank: string;
    class: string;
    url: string;
  };

  db.run(
    "INSERT OR REPLACE INTO videos (rank, class, url) VALUES (?, ?, ?)",
    [rank, cls, url]
  );
  save_db();
  res.json({ ok: true });
});

/* UPDATE */
app.put("/api/videos/:id", async (req: Request, res: Response) => {
  const db = await get_db();
  const { rank, class: cls, url } = req.body as {
    rank: string;
    class: string;
    url: string;
  };

  db.run(
    "UPDATE videos SET rank = ?, class = ?, url = ? WHERE id = ?",
    [rank, cls, url, Number(req.params.id)]
  );
  save_db();
  res.json({ ok: true });
});

/* DELETE */
app.delete("/api/videos/:id", async (req: Request, res: Response) => {
  const db = await get_db();
  db.run(
    "DELETE FROM videos WHERE id = ?",
    [Number(req.params.id)]
  );

  const result = db.exec("SELECT COUNT(*) as count FROM videos");
  const count = result.length > 0 ? (result[0].values[0][0] as number) : 0;
  if (count === 0) {
    db.run("DELETE FROM sqlite_sequence WHERE name='videos'");
  }
  save_db();
  res.json({ ok: true });
});

/* ===================== START ===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 UI → http://localhost:${PORT}`);
});