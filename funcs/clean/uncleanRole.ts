import { Role } from "discord.js";
import { bot, Guild } from "../../util/deps";
import { ICleanRole } from "./cleanRole";

export default function uncleanRole(role: ICleanRole, guild?: Guild) {
  if (role == null || typeof role !== "object") return role;
  return new Role(bot, role, guild || (bot.guilds ? bot.guilds.get(role.guildId) : null));
}
