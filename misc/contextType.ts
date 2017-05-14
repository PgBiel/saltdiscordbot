import {
  DMChannel, GroupDMChannel, Guild, GuildMember, Message, PermissionResolvable, TextChannel, User,
} from "discord.js";
import Searcher from "../classes/Searcher";
import {
  ExtendedActionLogOptions, ExtendedMsgOptions, ExtendedSend, IAmbigResult, IDoEvalResult, IPromptOptions, SaltRole,
} from "../commandHandler";

export type DjsChannel = DMChannel | GroupDMChannel | TextChannel;

interface IBaseContext {
  args?: string;
  arrArgs?: string[];
  author: User;
  authorTag: string;
  botmember?: GuildMember;
  content: string;
  dummy: {[prop: string]: any};
  guild?: Guild;
  guildId: string;
  input: string;
  instruction?: string;
  member?: GuildMember;
  message: Message;
  msg: Message;
  perms?: {[perm: string]: boolean};
  prefix: string;
  searcher?: Searcher<GuildMember>;
}

interface IFuncs {
  actionLog: (options: ExtendedActionLogOptions) => Promise<Message>;
  checkRole: (role: SaltRole, member: GuildMember) => Promise<boolean>;
  doEval: (content: string) => Promise<IDoEvalResult>;
  hasPermission?: typeof GuildMember.prototype.hasPermissions;
  hasPermissions?: typeof GuildMember.prototype.hasPermission;
  prompt: (options: IPromptOptions) => Promise<string>;
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
