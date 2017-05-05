import { DMChannel, GroupDMChannel, Guild, GuildMember, Message, TextChannel, User } from "discord.js";
import Searcher from "../classes/Searcher";
import { ExtendedMsgOptions, ExtendedSend, IAmbigResult, IDoEvalResult, SaltRole } from "../commandHandler";

export type DjsChannel = DMChannel | GroupDMChannel | TextChannel;

interface IBaseContext {
  args?: string;
  arrArgs?: string[];
  author: User;
  authorTag: string;
  botmember?: GuildMember;
  content: string;
  guild?: Guild;
  guildId: string;
  input: string;
  instruction?: string;
  member?: GuildMember;
  message: Message;
  msg: Message;
  perms?: {[perm: string]: boolean};
  prefix: string;
  searcher?: Searcher;
}

interface IFuncs {
  checkRole: (role: SaltRole, member: GuildMember) => Promise<boolean>;
  doEval: (content: string) => Promise<IDoEvalResult>;
  hasPermission?: typeof GuildMember.prototype.hasPermissions;
  hasPermissions?: typeof GuildMember.prototype.hasPermission;
  promptAmbig: (members: GuildMember[]) => IAmbigResult;
  reply: ExtendedSend;
  send: ExtendedSend;
}

interface IContext {
  channel: DjsChannel;
}

interface ITContext {
  channel: TextChannel;
}

export type BaseContext = IBaseContext & IFuncs;
export type Context = BaseContext & IContext;
export type TContext = BaseContext & ITContext;

export type cmdFunc = (msg: Message, context: Context) => any;
export type TcmdFunc = (msg: Message, context: TContext) => any;
