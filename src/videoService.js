"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClasses = getClasses;
exports.getVideo = getVideo;
exports.insertVideo = insertVideo;
exports.removeVideo = removeVideo;
const db_1 = require("./db");
/* ===================== FUNCTIONS ===================== */
async function getClasses(rank) {
    const db = await (0, db_1.get_db)();
    const stmt = db.prepare("SELECT DISTINCT class FROM videos WHERE rank = ? ORDER BY class");
    stmt.bind([rank]);
    const results = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row.class);
    }
    stmt.free();
    return results;
}
async function getVideo(rank, cls) {
    const db = await (0, db_1.get_db)();
    const stmt = db.prepare("SELECT url FROM videos WHERE rank = ? AND class = ? LIMIT 1");
    stmt.bind([rank, cls]);
    let url = null;
    if (stmt.step()) {
        const row = stmt.getAsObject();
        url = row.url;
    }
    stmt.free();
    return url;
}
async function insertVideo(rank, cls, url) {
    const db = await (0, db_1.get_db)();
    db.run("INSERT OR REPLACE INTO videos (rank, class, url) VALUES (?, ?, ?)", [rank, cls, url]);
    (0, db_1.save_db)();
}
async function removeVideo(rank, cls) {
    const db = await (0, db_1.get_db)();
    const count_before = db.exec("SELECT COUNT(*) as c FROM videos WHERE rank = ? AND class = ?", [rank, cls]);
    const had_rows = count_before.length > 0
        && count_before[0].values.length > 0
        && count_before[0].values[0][0] > 0;
    db.run("DELETE FROM videos WHERE rank = ? AND class = ?", [rank, cls]);
    (0, db_1.save_db)();
    return had_rows;
}
