import { Emoji, GuildEmoji, MessageReaction, ReactionEmoji } from "discord.js";
import { bot, Guild } from "../../util/deps";
import { ICleanEmoji } from "./cleanEmoji";
import uncleanReaction from "./uncleanReaction";

export type AnyEmoji = GuildEmoji |
  ReactionEmoji |
  Emoji         ;

export default function uncleanEmoji(emoji: ICleanEmoji, guild?: Guild): AnyEmoji {
  if (emoji == null || typeof emoji !== "object") return emoji as never;
  if (emoji.guildId) {
    return new GuildEmoji(bot, emoji, guild || (bot.guilds ? bot.guilds.get(emoji.guildId) : null));
  } else if (emoji.reaction) {
    return new ReactionEmoji(uncleanReaction(emoji.reaction), emoji);
  } else {
    return new Emoji(bot, emoji);
  }
}
