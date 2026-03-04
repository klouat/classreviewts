"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
dotenv.config({ path: ".env.local" });
const dotenv = __importStar(require("dotenv"));
const videoService_1 = require("./videoService");
require("./web");
dotenv.config();
/* ===================== CONFIG ===================== */
const ADMIN_USER_ID = "282638550502211584";
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
/* ===================== CLIENT ===================== */
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds]
});
dotenv.config();
const userState = new Map();
/* ===================== RANKS ===================== */
const RANKS = [
    { label: "Rank ?", id: "rank_?", style: discord_js_1.ButtonStyle.Secondary },
    { label: "Rank SS", id: "rank_ss", style: discord_js_1.ButtonStyle.Danger },
    { label: "Rank S+", id: "rank_s+", style: discord_js_1.ButtonStyle.Primary },
    { label: "Rank S", id: "rank_s", style: discord_js_1.ButtonStyle.Primary },
    { label: "Rank S-", id: "rank_s-", style: discord_js_1.ButtonStyle.Secondary },
    { label: "Rank A", id: "rank_a", style: discord_js_1.ButtonStyle.Success }
];
/* ===================== HELPERS ===================== */
function rankButton(label, id, style) {
    return new discord_js_1.ButtonBuilder()
        .setLabel(label)
        .setCustomId(id)
        .setStyle(style);
}
function buildRankRows() {
    const rows = [];
    let row = new discord_js_1.ActionRowBuilder();
    RANKS.forEach((rank, index) => {
        row.addComponents(rankButton(rank.label, rank.id, rank.style));
        if ((index + 1) % 5 === 0) {
            rows.push(row);
            row = new discord_js_1.ActionRowBuilder();
        }
    });
    if (row.components.length > 0) {
        rows.push(row);
    }
    return rows;
}
/* ===================== READY ===================== */
client.once("clientReady", async () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = await guild.channels.fetch(CHANNEL_ID);
    if (!channel || !channel.isTextBased() || channel.isDMBased())
        return;
    const textChannel = channel;
    await textChannel.send({
        content: "🎖️ Choose your rank",
        components: buildRankRows()
    });
});
/* ===================== INTERACTIONS ===================== */
client.on("interactionCreate", async (interaction) => {
    if (!interaction.guild || interaction.guild.id !== GUILD_ID)
        return;
    /* ================= SLASH COMMANDS ================= */
    if (interaction.isChatInputCommand()) {
        // 🔒 USER ID LOCK
        if (interaction.user.id !== ADMIN_USER_ID) {
            await interaction.reply({
                ephemeral: true,
                content: "❌ You are not allowed to use this command."
            });
            return;
        }
        if (interaction.commandName !== "video")
            return;
        const sub = interaction.options.getSubcommand();
        const rank = interaction.options.getString("rank", true);
        // ➕ ADD
        if (sub === "add") {
            const cls = interaction.options.getString("class", true);
            const url = interaction.options.getString("url", true);
            await (0, videoService_1.insertVideo)(rank, cls, url);
            await interaction.reply({
                ephemeral: true,
                content: `✅ **Added successfully**\n${rank} → ${cls}`
            });
            return;
        }
        // 🗑️ REMOVE
        if (sub === "remove") {
            const cls = interaction.options.getString("class", true);
            const removed = await (0, videoService_1.removeVideo)(rank, cls);
            await interaction.reply({
                ephemeral: true,
                content: removed
                    ? `🗑️ **Removed successfully**\n${rank} → ${cls}`
                    : "❌ No video found to remove"
            });
            return;
        }
    }
    /* ================= BUTTON ================= */
    if (interaction.isButton()) {
        const rank = interaction.customId;
        userState.set(interaction.user.id, { rank });
        const classes = await (0, videoService_1.getClasses)(rank);
        if (!classes.length) {
            await interaction.reply({
                ephemeral: true,
                content: "❌ No classes found for this rank"
            });
            return;
        }
        await interaction.reply({
            ephemeral: true,
            content: `🧠 Select class for **${rank}**`,
            components: [
                new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
                    .setCustomId("class_select")
                    .setPlaceholder("Choose a class")
                    .addOptions(classes.map(cls => new discord_js_1.StringSelectMenuOptionBuilder()
                    .setLabel(cls)
                    .setValue(cls))))
            ]
        });
    }
    /* ================= DROPDOWN ================= */
    if (interaction.isStringSelectMenu()) {
        const state = userState.get(interaction.user.id);
        if (!state) {
            await interaction.reply({
                ephemeral: true,
                content: "❌ Session expired. Please select rank again."
            });
            return;
        }
        const selectedClass = interaction.values[0];
        state.class = selectedClass;
        const video = await (0, videoService_1.getVideo)(state.rank, selectedClass);
        await interaction.reply({
            ephemeral: true,
            content: video
                ? `🎬 **${selectedClass}**\n${video}`
                : "❌ Video not found"
        });
    }
});
/* ===================== LOGIN ===================== */
client.login(TOKEN);
