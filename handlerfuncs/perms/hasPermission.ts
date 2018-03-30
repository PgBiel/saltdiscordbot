import { Message, GuildMember } from "discord.js";

export default (msg: Message): typeof GuildMember.prototype.hasPermission => msg.member ?
  msg.member.hasPermission.bind(msg.member) :
  null;
