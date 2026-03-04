"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RANK_CHOICES = exports.RANK_IDS = exports.RANKS = void 0;
const discord_js_1 = require("discord.js");
exports.RANKS = [
    { label: "Rank ?", id: "rank_?", style: discord_js_1.ButtonStyle.Secondary },
    { label: "Rank SS", id: "rank_ss", style: discord_js_1.ButtonStyle.Danger },
    { label: "Rank S+", id: "rank_s+", style: discord_js_1.ButtonStyle.Primary },
    { label: "Rank S", id: "rank_s", style: discord_js_1.ButtonStyle.Primary },
    { label: "Rank S-", id: "rank_s-", style: discord_js_1.ButtonStyle.Secondary },
    { label: "Rank A", id: "rank_a", style: discord_js_1.ButtonStyle.Success }
];
/* Helpers */
exports.RANK_IDS = exports.RANKS.map(r => r.id);
exports.RANK_CHOICES = exports.RANKS.map(r => ({
    name: r.label,
    value: r.id
}));
