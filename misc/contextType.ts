import { DMChannel, GroupDMChannel, GuildMember, Message, TextChannel, User } from "discord.js";
import Searcher from "../classes/Searcher";
import { ExtendedMsgOptions, ExtendedSend, IAmbigResult, SaltRole } from "../commandHandler";

export type DjsChannel = DMChannel | GroupDMChannel | TextChannel;

interface IBaseContext {
  checkRole: (role: SaltRole, member: GuildMember) => Promise<boolean>;
  author: User;
  tag: string;
  member?: GuildMember;
  prefix: string;
  input: string;
  msg: Message;
  guildId: string;
  send: ExtendedSend;
  reply: ExtendedSend;
  message: Message;
  content: string;
  args?: string;
  botmember?: GuildMember;
  hasPermission?: typeof GuildMember.prototype.hasPermissions;
  hasPermissions?: typeof GuildMember.prototype.hasPermission;
  searcher?: Searcher;
  instruction?: string;
  arrArgs?: string[];
  perms?: {[perm: string]: boolean};
  promptAmbig: (members: GuildMember[]) => IAmbigResult;
}

interface IContext {
  channel: DjsChannel;
}

interface ITContext {
  channel: TextChannel;
}

export type Context = IBaseContext & IContext;
export type TContext = IBaseContext & ITContext;

export type cmdFunc = (msg: Message, context: Context) => any;
export type TcmdFunc = (msg: Message, context: TContext) => any;
