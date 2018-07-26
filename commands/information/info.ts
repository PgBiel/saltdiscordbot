import Command from "../../classes/command";
import {
  https, http, bot, rejct, User, Constants, formatStatus, formatActivity, Embed, ago, momentUTC, _, TextChannel,
  search, cross, no2Tick, escMarkdown, GuildMember, Role, GuildChannel, globalPositions, capitalize, paginate, sleep
} from "../../misc/d";
import { cmdFunc, TContext, BaseContext, DjsChannel } from "../../misc/contextType";
import { Guild, GuildEmoji, Collection } from "discord.js";
import { ExtendedMsgOptions } from "../../handlerfuncs/senders/proto-send";
import { SearchType } from "../../funcs/parsers/search";
import { Storage } from "saltjs";

import { userinfo } from "./userinfo";
import { channelinfo } from "./channelinfo";
import { perms } from "./perms";
import { botinfo } from "./botinfo";
import { serverinfo } from "./serverinfo";
import { roleinfo } from "./roleinfo";
import { roles } from "./roles";
import { members } from "./members";
import { channels } from "./channels";
import { membercount } from "./membercount";

export type AInfoDummy = InfoDummy & { arg?: string, trArg?: string };

export interface InfoDummy {
  android?: boolean;
  action?: string;
}

/**
 * Info actions that can be used outside of guilds, even if limitedly
 */
export type NoGInfoAction = "user"   | "member"       | "id"             | "userid" |
  "channel"      | "textchannel"     | "text"         | "channelid"      | "textid" | "textchannelid" |
  "voicechannel" | "voice"           | "voiceid"      | "voicechannelid" |
  "perms"        | "dperms"          | "discordperms" | // when out of a guild, you can only specify a number
  "category"     | "categoryid"      | "ctg"          | "ctgid"          |
  "stats"        | "bot";

/**
 * Info actions that can be used inside guilds (excluding those that also can be used outside)
 */
export type GInfoAction = "server"   | "guild"  | "serverid"      | "guildid"      |
"members"   | "channels"             | "voices" | "voicechannels" | "textchannels" | "texts" | "categories" | "ctgs" |
"emoji"     | "emojiid"              |
"role"      | "roleid"               | "roles"  |
"cperms"    | "channelperms"         |
"saltperms" | "stperms"              | "listperms";

/**
 * All actions
 */
export type InfoAction = GInfoAction | NoGInfoAction;

export type CollVal<T extends (Collection<any, any> | Storage<any, any>), R = any> =
  T extends Collection<any, infer CV> ?
    CV :
    T extends Storage<any, infer SV> ?
      SV :
      R;

export type CollKey<T extends (Collection<any, any> | Storage<any, any>), R = any> =
  T extends Collection<infer CK, any> ?
    CK :
    T extends Storage<infer SK, any> ?
      SK :
      R;

const noGActions = [
  "user", "member", "id", "userid",
  "channel", "textchannel", "text", "channelid", "textid", "textchannelid",
  "voicechannel", "voice", "voiceid", "voicechannelid",
  "perms", "dperms", "discordperms", // when out of a guild, you can only specify a number
  "category", "categoryid", "ctg", "ctgid",
  "stats", "bot"];
const gActions = noGActions.concat([
  "server", "guild", "serverid", "guildid",
  "members", "channels", "voices", "voicechannels", "textchannels", "texts", "categories", "ctgs",
  "emoji", "emojiid",
  "role", "roleid", "roles",
  "cperms", "channelperms",
  "saltperms", "stperms", "listperms", // I was going to alias it with "sperms" but then I realized...
  "membercount", "count"
]);

const noGCmds = {
  user: userinfo, member: userinfo, id: userinfo, userid: userinfo,

  channel: channelinfo, textchannel: channelinfo, text: channelinfo, channelid: channelinfo,
  textid: channelinfo, textchannelid: channelinfo,

  voicechannel: channelinfo, voice: channelinfo, voiceid: channelinfo, voicechannelid: channelinfo,

  perms, dperms: perms, discordperms: perms,

  category: channelinfo, categoryid: channelinfo, ctg: channelinfo, ctgid: channelinfo,

  stats: botinfo, bot: botinfo
};

const gCmds = Object.assign({
  server: serverinfo, guild: serverinfo, serverid: serverinfo, guildid: serverinfo,
  role: roleinfo, roleid: roleinfo, roles,
  members,

  channels, voices: channels, voicechannels: channels, textchannels: channels, texts: channels, categories: channels,
  ctgs: channels,

  membercount, count: membercount
}, noGCmds);

const func: cmdFunc<InfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member
}) {
  const sendIt = (emb: Embed, opts?: ExtendedMsgOptions) => {
    return send(Object.assign({ embed: emb, autoCatch: false, deletable: true }, opts))
      .catch(err => [403, 50013].includes(err.code) ?
        send("Please make sure I can send embeds in this channel.") :
        void(rejct(err, "[SEND-IT-INFO]"))
      );
  };
  let action: string = String(dummy && dummy.action ? dummy.action : String(arrArgs[0] || ""))
    .toLowerCase()
    .replace(/info$/i, "");
  let isAndroid: boolean = Boolean(dummy && dummy.android !== null ? dummy.android : false);
  const isInG = (chan): chan is TextChannel => channel instanceof TextChannel;
  const isDM: boolean = !isInG(channel);
  if (/^a(?:ndroid)?/i.test(action)) {
    action = action.replace(/^a(?:ndroid)?/i, "");
    isAndroid = true;
  }
  const arrArg: string[] = arrArgs.slice(dummy && dummy.action ? 0 : 1);
  const arg: string = arrArg.join(" ");
  const trArg = _.trim(arg);
  const is = (...list: string[]) => list.includes(action);
  const usableActions: string[] = guild ? gActions : noGActions;
  if (!_.trim(action)) {
    return reply("Please specify something to view information for! (See the help command if you need help.)");
  }
  if (!usableActions.includes(action)) {
    if (gActions.includes(action)) {
      return reply("You can only view that info when on a server!");
    }
    return reply("Unknown action (info to view)! (See the help command if you need help.)");
  }
  const newContext = self;
  const newDummy: AInfoDummy = {
    arg, trArg, action, android: isAndroid
  };
  Object.assign(newContext, { dummy: newDummy, arrArgs: arrArg, args: arg });
  const objToUse = guild ? gCmds : noGCmds;
  const theCmd: Command<AInfoDummy, BaseContext<DjsChannel>> = objToUse[action as keyof typeof objToUse];
  if (!theCmd) return reply("This info isn't available yet on Salt :)");
  return theCmd.exec(msg, newContext);
};

export const info = new Command({
  func,
  name: "info",
  perms: {
    "info.user": true, "info.role": true, "info.channel": true, "info.server": true,
    "info.bot": true, "info.roles": true, "info.channels": true, "info.members": true,
    "info.perms": true, "info.saltperms": true
  },
  default: true,
  description: `Show information about something. To use, specify an action. For a list of actions, \
view {p}help Information (without any 'info' at the end).

Note: If you add the letter \`a\` in front of any action, it shows it without mentions.`,
  example: `{p}{name} user
{p}{name} bot
{p}{name} server
{p}{name} role My Cool Role
{p}{name} channels 1`,
  category: "Information",
  args: { action: false, "...parameters": true }
});
