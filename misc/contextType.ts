import { DMChannel, GroupDMChannel, GuildMember, Message, TextChannel, User } from "discord.js";
import { SaltRole } from "../commandHandler";

export type DjsChannel = DMChannel | GroupDMChannel | TextChannel;
const sender = TextChannel.prototype.send;

export interface IContext {
  checkPerm: (node: string, author?: GuildMember | User, isDefault?: boolean) => Promise<boolean>;
  disabledreply: (pt: string) => Promise<Message | Message[]>;
  checkRole: (role: SaltRole, member: GuildMember) => Promise<boolean>;
  prefix: string;
  gueldid: string;
  mentionfix: string | void;
  upparcaso: string;
  input: string;
  chanel: DjsChannel;
  msg: Message;
  channel: DjsChannel;
  guildid: string;
  inputUpCase: string;
  send: typeof sender;
  reply: typeof Message.prototype.reply;
  message: Message;
  content: string;
  args?: string;
  botmember?: GuildMember;
  hasPermission?: typeof GuildMember.prototype.hasPermissions;
  instruction?: string;
  arrArgs?: string[];
  perms: {[perm: string]: boolean};
}

export interface ITContext {
  checkPerm: (node: string, author?: GuildMember | User, isDefault?: boolean) => Promise<boolean>;
  disabledreply: (pt: string) => Promise<Message | Message[]>;
  checkRole: (role: SaltRole, member: GuildMember) => Promise<boolean>;
  prefix: string;
  gueldid: string;
  mentionfix: string | void;
  upparcaso: string;
  input: string;
  chanel: TextChannel;
  msg: Message;
  channel: TextChannel;
  guildid: string;
  inputUpCase: string;
  send: typeof sender;
  reply: typeof Message.prototype.reply;
  message: Message;
  content: string;
  args?: string;
  botmember?: GuildMember;
  hasPermission?: typeof GuildMember.prototype.hasPermission;
  instruction?: string;
  arrArgs?: string[];
  perms: {[perm: string]: boolean};
}

export type cmdFunc = (msg: Message, context: IContext);
export type TcmdFunc = (msg: Message, context: ITContext);
