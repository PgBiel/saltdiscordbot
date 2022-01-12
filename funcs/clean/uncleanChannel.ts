import { bot, Discord, Guild } from "../../util/deps";
import { ChannelTypes, ICleanChannel } from "./cleanChannel";
const { DMChannel, TextChannel, VoiceChannel, CategoryChannel, GuildChannel, Channel } = Discord;

export type AnyChannel = Discord.DMChannel |
  Discord.PartialDMChannel |
  Discord.TextChannel      |
  Discord.ThreadChannel    |
  Discord.NewsChannel      |
  Discord.VoiceChannel     |
  Discord.CategoryChannel  |
  Discord.GuildChannel     |
  Discord.Channel          ;

export default function uncleanChannel(channel: ICleanChannel, guild?: Discord.Guild): AnyChannel | void {
  if (channel == null || typeof channel !== "object") return channel as never;
  // const type = (Object.entries(ChannelTypes).find(([k, v]) => v === Number(channel.type)) || [""])[0].toLowerCase();
  // const useG = guild || (bot.guilds ? bot.guilds.cache.get(channel.guildId) : null);
  return bot.channels.resolve(channel.id);
  // switch (type) {   // cannot create channel objects from scratch, as constructor is private
  //   case "dm":
  //     return new DMChannel(bot, channel);
  //   // case "group":
  //   //   return new GroupDMChannel(bot, channel);
  //   case "text":
  //     return new TextChannel(useG, channel);
  //   case "voice":
  //     return new VoiceChannel(useG, channel);
  //   case "category":
  //     return new CategoryChannel(useG, channel);
  //   default:
  //     if (channel.guildId) {
  //       return new GuildChannel(useG, channel);
  //     } else {
  //       return new Channel(bot, channel);
  //     }
  // }
}
