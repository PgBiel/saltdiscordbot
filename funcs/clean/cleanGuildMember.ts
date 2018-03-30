import { GuildMember } from "discord.js";
import cleanUser, { ICleanUser } from "./cleanUser";

export interface ICleanGuildMember {
  guildId: string;
  roles: string[];
  user: ICleanUser;
  speaking: boolean;
  nickname: string;
  joined_at: number;
}

export default function cleanGuildMember(member: GuildMember, guildId = member.guild.id): ICleanGuildMember {
  if (member == null || typeof member !== "object") return member as never;
  const { roles, user, speaking, nickname, joinedTimestamp } = member;
  return {
    guildId,
    roles: roles.map(r => r.id),
    user: cleanUser(user),
    speaking,
    nickname,
    joined_at: joinedTimestamp
  };
}
