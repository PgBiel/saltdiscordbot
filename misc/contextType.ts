import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  DMChannel, Guild, GuildMember, Interaction, Message, NewsChannel, PartialDMChannel, PermissionResolvable, TextChannel, ThreadChannel, User,
} from "discord.js";
import Searcher from "../classes/searcher";
import { HandlerFuncs } from "../handlerfuncs/commandHandlerFuncs";

export type DjsChannel = DMChannel | PartialDMChannel | TextChannel | NewsChannel | ThreadChannel;

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
  guildId?: string;
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
export type TContext = BaseContext<TextChannel> & { guild: Guild, guildId: string, self: TContext };

export type cmdFunc<D = any> = (msg: Message, context: Context & { dummy?: D }) => any;
export type TcmdFunc<D = any> = (msg: Message, context: TContext & { dummy?: D }) => any;

interface IBaseSlashContext<ChannelType> {
  interaction: CommandInteraction;
  options: CommandInteractionOptionResolver;
  channel: ChannelType;
  channelId: string;
  member?: GuildMember;
  guild?: Guild;
  guildId?: string;
  author: User;
  authorTag: string;
  self: BaseSlashContext<ChannelType>;
}

export type BaseSlashContext<ChannelType> = IBaseSlashContext<ChannelType> & HandlerFuncs;
export type SlashContext = BaseContext<DjsChannel>;
export type TSlashContext = BaseContext<TextChannel> & { guild: Guild, guildId: string, self: TSlashContext }