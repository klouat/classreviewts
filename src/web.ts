import express, { Request, Response } from "express";
import { db } from "./db";

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
app.get("/api/videos", (req: Request, res: Response) => {
  const { rank, cls } = req.query as {
    rank?: string;
    cls?: string;
  };

  let sql = "SELECT * FROM videos WHERE 1=1";
  const params: any[] = [];

  if (rank) {
    sql += " AND rank = ?";
    params.push(rank);
  }
  if (cls) {
    sql += " AND class = ?";
    params.push(cls);
  }

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

/* ADD */
app.post("/api/videos", (req: Request, res: Response) => {
  const { rank, class: cls, url } = req.body as {
    rank: string;
    class: string;
    url: string;
  };

  db.prepare(
    "INSERT OR REPLACE INTO videos (rank, class, url) VALUES (?, ?, ?)"
  ).run(rank, cls, url);

  res.json({ ok: true });
});

/* UPDATE */
app.put("/api/videos/:id", (req: Request, res: Response) => {
  const { rank, class: cls, url } = req.body as {
    rank: string;
    class: string;
    url: string;
  };

  db.prepare(
    "UPDATE videos SET rank = ?, class = ?, url = ? WHERE id = ?"
  ).run(rank, cls, url, Number(req.params.id));

  res.json({ ok: true });
});

/* DELETE */
app.delete("/api/videos/:id", (req: Request, res: Response) => {
  db.prepare("DELETE FROM videos WHERE id = ?")
    .run(Number(req.params.id));

  // If table is empty, reset the autoincrement sequence
  const count = db.prepare("SELECT COUNT(*) as count FROM videos").get() as { count: number };
  if (count.count === 0) {
    db.exec("DELETE FROM sqlite_sequence WHERE name='videos'");
  }

  res.json({ ok: true });
});

/* ===================== START ===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 UI → http://localhost:${PORT}`);
});