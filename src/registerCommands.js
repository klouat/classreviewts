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
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: ".env" });
async function register() {
    const commands = [
        new discord_js_1.SlashCommandBuilder()
            .setName("video")
            .setDescription("Manage videos (ADMIN ONLY)")
            .addSubcommand(sub => sub
            .setName("add")
            .setDescription("Add a video")
            .addStringOption(o => o.setName("rank").setDescription("Rank").setRequired(true))
            .addStringOption(o => o.setName("class").setDescription("Class name").setRequired(true))
            .addStringOption(o => o.setName("url").setDescription("Video URL").setRequired(true)))
            .addSubcommand(sub => sub
            .setName("remove")
            .setDescription("Remove a video")
            .addStringOption(o => o.setName("rank").setDescription("Rank").setRequired(true))
            .addStringOption(o => o.setName("class").setDescription("Class name").setRequired(true)))
    ].map(c => c.toJSON());
    const rest = new discord_js_1.REST({ version: "10" })
        .setToken(process.env.DISCORD_BOT_TOKEN);
    await rest.put(discord_js_1.Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
    console.log("✅ Slash commands registered");
}
register().catch(console.error);
