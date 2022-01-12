import { GuildMember } from "discord.js";
import cleanUser, { ICleanUser } from "./cleanUser";

export interface ICleanGuildMember {
  guildId: string;
  roles: string[];
  user: ICleanUser;
  nickname: string;
  joined_at: number;
}

export default function cleanGuildMember(member: GuildMember, guildId = member.guild.id): ICleanGuildMember {
  if (member == null || typeof member !== "object") return member as never;
  const { roles, user, nickname, joinedTimestamp } = member;
  return {
    guildId,
    roles: roles.cache.map(r => r.id),
    user: cleanUser(user),
    // speaking, // ignoring voice
    nickname,
    joined_at: joinedTimestamp
  };
}
