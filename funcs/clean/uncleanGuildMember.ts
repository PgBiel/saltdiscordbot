import { bot, Guild, GuildMember } from "../../util/deps";
import { ICleanGuildMember } from "./cleanGuildMember";

export default function uncleanmember(member: ICleanGuildMember, guild?: Guild) {
  if (member == null || typeof member !== "object") return member as never;
  return new GuildMember(bot, member, guild || (bot.guilds ? bot.guilds.get(member.guildId) : null));
}
