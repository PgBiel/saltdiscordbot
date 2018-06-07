import {
  DMChannel, GroupDMChannel, Guild, GuildMember, Message, PermissionResolvable, TextChannel, User,
} from "discord.js";
import Searcher from "../classes/Searcher";
import { HandlerFuncs } from "../handlerfuncs/commandHandlerFuncs";

export type DjsChannel = DMChannel | GroupDMChannel | TextChannel;

interface IBaseContext<ChannelType> {
  args?: string;
  arrArgs?: string[];
  author: User;
  authorTag: string;
  botmember?: GuildMember;
  channel: ChannelType;
  content: string;
  dummy?: object;
  guild?: Guild;
  guildId: string;
  input: string;
  instruction?: string;
  member?: GuildMember;
  message: Message;
  msg: Message;
  perms?: { [perm: string]: boolean };
  setPerms?: { [perm: string]: boolean };
  prefix: string;
  searcher?: Searcher<GuildMember>;
  self: BaseContext<ChannelType>;
}

interface IContext {
  channel: DjsChannel;
}

interface ITContext {
  channel: TextChannel;
}

export type BaseContext<ChannelType> = IBaseContext<ChannelType> & HandlerFuncs;
export type Context = BaseContext<DjsChannel>;
export type TContext = BaseContext<TextChannel> & { guild: Guild, self: TContext };

export type cmdFunc<D = any> = (msg: Message, context: Context & { dummy?: D }) => any;
export type TcmdFunc<D = any> = (msg: Message, context: TContext & { dummy?: D }) => any;
