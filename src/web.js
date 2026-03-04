"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
/* ===================== FIXED RANKS ===================== */
const RANKS = [
    { label: "Rank ?", id: "rank_?" },
    { label: "Rank SS", id: "rank_ss" },
    { label: "Rank S+", id: "rank_s+" },
    { label: "Rank S", id: "rank_s" },
    { label: "Rank S-", id: "rank_s-" },
    { label: "Rank A", id: "rank_a" }
];
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
console.log("🚀 web.ts loaded");
/* ===================== API ===================== */
/* RANKS */
app.get("/api/ranks", (_req, res) => {
    res.json(RANKS);
});
/* GET (with filters) */
app.get("/api/videos", (req, res) => {
    const { rank, cls } = req.query;
    let sql = "SELECT * FROM videos WHERE 1=1";
    const params = [];
    if (rank) {
        sql += " AND rank = ?";
        params.push(rank);
    }
    if (cls) {
        sql += " AND class = ?";
        params.push(cls);
    }
    const rows = db_1.db.prepare(sql).all(...params);
    res.json(rows);
});
/* ADD */
app.post("/api/videos", (req, res) => {
    const { rank, class: cls, url } = req.body;
    db_1.db.prepare("INSERT OR REPLACE INTO videos (rank, class, url) VALUES (?, ?, ?)").run(rank, cls, url);
    res.json({ ok: true });
});
/* UPDATE */
app.put("/api/videos/:id", (req, res) => {
    const { rank, class: cls, url } = req.body;
    db_1.db.prepare("UPDATE videos SET rank = ?, class = ?, url = ? WHERE id = ?").run(rank, cls, url, Number(req.params.id));
    res.json({ ok: true });
});
/* DELETE */
app.delete("/api/videos/:id", (req, res) => {
    db_1.db.prepare("DELETE FROM videos WHERE id = ?")
        .run(Number(req.params.id));
    // If table is empty, reset the autoincrement sequence
    const count = db_1.db.prepare("SELECT COUNT(*) as count FROM videos").get();
    if (count.count === 0) {
        db_1.db.exec("DELETE FROM sqlite_sequence WHERE name='videos'");
    }
    res.json({ ok: true });
});
/* ===================== START ===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 UI → http://localhost:${PORT}`);
});
