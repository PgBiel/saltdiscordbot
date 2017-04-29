import { DMChannel, GroupDMChannel, GuildMember, Message, TextChannel, User } from "discord.js";
import { ExtendedMsgOptions, SaltRole } from "../commandHandler";

export type DjsChannel = DMChannel | GroupDMChannel | TextChannel;

export interface IContext {
  checkRole: (role: SaltRole, member: GuildMember) => Promise<boolean>;
  prefix: string;
  input: string;
  msg: Message;
  channel: DjsChannel;
  guildId: string;
  send: (content: string, options?: ExtendedMsgOptions) => Promise<Message>;
  reply: (content: string, options?: ExtendedMsgOptions) => Promise<Message>;
  message: Message;
  content: string;
  args?: string;
  botmember?: GuildMember;
  hasPermission?: typeof GuildMember.prototype.hasPermissions;
  hasPermissions?: typeof GuildMember.prototype.hasPermission;
  instruction?: string;
  arrArgs?: string[];
  perms: {[perm: string]: boolean};
}

export interface ITContext {
  checkRole: (role: SaltRole, member: GuildMember) => Promise<boolean>;
  prefix: string;
  input: string;
  msg: Message;
  channel: TextChannel;
  guildId: string;
  send: (content: string, options?: ExtendedMsgOptions) => Promise<Message>;
  reply: (content: string, options?: ExtendedMsgOptions) => Promise<Message>;
  message: Message;
  content: string;
  args?: string;
  botmember?: GuildMember;
  hasPermission?: typeof GuildMember.prototype.hasPermission;
  hasPermissions?: typeof GuildMember.prototype.hasPermission;
  instruction?: string;
  arrArgs?: string[];
  perms: {[perm: string]: boolean};
}

export type cmdFunc = (msg: Message, context: IContext) => any;
export type TcmdFunc = (msg: Message, context: ITContext) => any;
