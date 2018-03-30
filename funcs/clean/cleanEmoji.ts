import { Emoji, GuildEmoji, ReactionEmoji } from "discord.js";
import cleanReaction, { ICleanReaction } from "./cleanReaction";

export interface ICleanEmoji {
  id: string;
  name: string;
  animated: boolean;
  // for GuildEmoji v
  guildId?: string;
  roles?: string[];
  require_colons?: boolean;
  managed?: boolean;
  // for Reaction Emoji v
  reaction?: ICleanReaction;
}

export default function cleanEmoji(emoji: Emoji, guildId = (emoji as GuildEmoji).guild.id): ICleanEmoji {
  if (emoji == null || typeof emoji !== "object") return emoji as never;
  const { id, animated, name } = emoji;
  const obj: ICleanEmoji = {
    id,
    name,
    animated
  };
  if (emoji instanceof GuildEmoji) { // is GuildEmoji
    const { requiresColons, managed, roles } = emoji;
    Object.assign(obj, {
      guildId,
      require_colons: requiresColons,
      managed,
      roles: roles.map(r => r.id)
    });
  } else if (emoji instanceof ReactionEmoji) { // is ReactionEmoji
    obj.reaction = cleanReaction(emoji.reaction);
  }
  return obj;
}
