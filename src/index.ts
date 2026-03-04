import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  Interaction,
  GuildTextBasedChannel
} from "discord.js";

import * as dotenv from "dotenv";
dotenv.config();

import { getClasses, getVideo, insertVideo, removeVideo } from "./videoService";
import "./web";

/* ===================== CONFIG ===================== */
const ADMIN_USER_ID = "282638550502211584";
const TOKEN = process.env.DISCORD_BOT_TOKEN!;
const GUILD_ID = process.env.GUILD_ID!;
const CHANNEL_ID = process.env.CHANNEL_ID!;

/* ===================== CLIENT ===================== */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});
const userState = new Map<string, { rank: string; class?: string }>();

/* ===================== RANKS ===================== */
const RANKS = [
  { label: "Rank ?", id: "rank_?", style: ButtonStyle.Secondary },
  { label: "Rank SS", id: "rank_ss", style: ButtonStyle.Danger },
  { label: "Rank S+", id: "rank_s+", style: ButtonStyle.Primary },
  { label: "Rank S", id: "rank_s", style: ButtonStyle.Primary },
  { label: "Rank S-", id: "rank_s-", style: ButtonStyle.Secondary },
  { label: "Rank A", id: "rank_a", style: ButtonStyle.Success }
] as const;

/* ===================== HELPERS ===================== */
function rankButton(label: string, id: string, style: ButtonStyle) {
  return new ButtonBuilder()
    .setLabel(label)
    .setCustomId(id)
    .setStyle(style);
}

function buildRankRows() {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  let row = new ActionRowBuilder<ButtonBuilder>();

  RANKS.forEach((rank, index) => {
    row.addComponents(rankButton(rank.label, rank.id, rank.style));

    if ((index + 1) % 5 === 0) {
      rows.push(row);
      row = new ActionRowBuilder<ButtonBuilder>();
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

  if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

  const textChannel = channel as GuildTextBasedChannel;

  await textChannel.send({
    content: "🎖️ Choose your rank",
    components: buildRankRows()
  });
});

/* ===================== INTERACTIONS ===================== */
client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.guild || interaction.guild.id !== GUILD_ID) return;

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

    if (interaction.commandName !== "video") return;

    const sub = interaction.options.getSubcommand();
    const rank = interaction.options.getString("rank", true);

    // ➕ ADD
    if (sub === "add") {
      const cls = interaction.options.getString("class", true);
      const url = interaction.options.getString("url", true);

      await insertVideo(rank, cls, url);

      await interaction.reply({
        ephemeral: true,
        content: `✅ **Added successfully**\n${rank} → ${cls}`
      });
      return;
    }

    // 🗑️ REMOVE
    if (sub === "remove") {
      const cls = interaction.options.getString("class", true);
      const removed = await removeVideo(rank, cls);

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

    const classes = await getClasses(rank);

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
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("class_select")
            .setPlaceholder("Choose a class")
            .addOptions(
              classes.map(cls =>
                new StringSelectMenuOptionBuilder()
                  .setLabel(cls)
                  .setValue(cls)
              )
            )
        )
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

    const video = await getVideo(state.rank, selectedClass);

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
