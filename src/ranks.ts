import { ButtonStyle } from "discord.js";

export const RANKS = [
  { label: "Rank ?", id: "rank_?", style: ButtonStyle.Secondary },
  { label: "Rank SS", id: "rank_ss", style: ButtonStyle.Danger },
  { label: "Rank S+", id: "rank_s+", style: ButtonStyle.Primary },
  { label: "Rank S", id: "rank_s", style: ButtonStyle.Primary },
  { label: "Rank S-", id: "rank_s-", style: ButtonStyle.Secondary },
  { label: "Rank A", id: "rank_a", style: ButtonStyle.Success }
] as const;

/* Helpers */
export const RANK_IDS = RANKS.map(r => r.id);
export const RANK_CHOICES = RANKS.map(r => ({
  name: r.label,
  value: r.id
}));
