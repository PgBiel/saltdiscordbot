import { Role } from "discord.js";
import { bot, Guild } from "../../util/deps";
import { ICleanRole } from "./cleanRole";

export default function uncleanRole(role: ICleanRole, guild?: Guild) {
  if (role == null || typeof role !== "object") return role;
  guild = guild instanceof Guild ? guild : bot.guilds.resolve(role.guildId);
  if (guild) {
    return guild.roles.resolve(role.id);
  }
  // return new Role(bot, role, guild || (bot.guilds ? bot.guilds.get(role.guildId) : null));
}
