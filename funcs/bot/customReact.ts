import { MessageReaction } from "discord.js";
import { bot, Discord, Message } from "../../util/deps";

const { Util } = Discord;

/**
 * React directly through API
 * @param {string} emoji Resolved emoji
 * @param {Message} msg Message
 * @param {boolean} [encode=true] If should encode the emoji
 * @returns {Promise<MessageReaction>} The reaction
 */
export default function customReact(emoji: string, msg: Message, encode: boolean = true): Promise<MessageReaction> {
  return (bot as any).api
    .channels(msg.channel.id)
    .messages(msg.id)
    .reactions(encode ? encodeURIComponent(emoji) : emoji, "@me") // note: really hacky stuff on this function
    .put()
    .then(() => (bot as any).actions.MessageReactionAdd.handle({
      user: bot.user,
      channel: msg.channel,
      message: msg,
      emoji: Util.parseEmoji(emoji)
    }).reaction);
}
