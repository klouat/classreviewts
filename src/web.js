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
app.get("/api/videos", async (req, res) => {
    const db = await (0, db_1.get_db)();
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
    const stmt = db.prepare(sql);
    if (params.length > 0)
        stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    res.json(rows);
});
/* ADD */
app.post("/api/videos", async (req, res) => {
    const db = await (0, db_1.get_db)();
    const { rank, class: cls, url } = req.body;
    db.run("INSERT OR REPLACE INTO videos (rank, class, url) VALUES (?, ?, ?)", [rank, cls, url]);
    (0, db_1.save_db)();
    res.json({ ok: true });
});
/* UPDATE */
app.put("/api/videos/:id", async (req, res) => {
    const db = await (0, db_1.get_db)();
    const { rank, class: cls, url } = req.body;
    db.run("UPDATE videos SET rank = ?, class = ?, url = ? WHERE id = ?", [rank, cls, url, Number(req.params.id)]);
    (0, db_1.save_db)();
    res.json({ ok: true });
});
/* DELETE */
app.delete("/api/videos/:id", async (req, res) => {
    const db = await (0, db_1.get_db)();
    db.run("DELETE FROM videos WHERE id = ?", [Number(req.params.id)]);
    const result = db.exec("SELECT COUNT(*) as count FROM videos");
    const count = result.length > 0 ? result[0].values[0][0] : 0;
    if (count === 0) {
        db.run("DELETE FROM sqlite_sequence WHERE name='videos'");
    }
    (0, db_1.save_db)();
    res.json({ ok: true });
});
/* ===================== START ===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 UI → http://localhost:${PORT}`);
});
