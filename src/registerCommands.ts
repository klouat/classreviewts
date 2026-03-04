import {
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function register() {
  const commands = [
    new SlashCommandBuilder()
      .setName("video")
      .setDescription("Manage videos (ADMIN ONLY)")
      .addSubcommand(sub =>
        sub
          .setName("add")
          .setDescription("Add a video")
          .addStringOption(o =>
            o.setName("rank").setDescription("Rank").setRequired(true)
          )
          .addStringOption(o =>
            o.setName("class").setDescription("Class name").setRequired(true)
          )
          .addStringOption(o =>
            o.setName("url").setDescription("Video URL").setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName("remove")
          .setDescription("Remove a video")
          .addStringOption(o =>
            o.setName("rank").setDescription("Rank").setRequired(true)
          )
          .addStringOption(o =>
            o.setName("class").setDescription("Class name").setRequired(true)
          )
      )
  ].map(c => c.toJSON());

  const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_BOT_TOKEN!);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID!,
      process.env.GUILD_ID!
    ),
    { body: commands }
  );

  console.log("✅ Slash commands registered");
}

register().catch(console.error);
