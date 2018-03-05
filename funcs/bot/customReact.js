const { bot, Discord: { Util } } = require("../../util/deps");

/**
 * React directly through API
 * @param {string} emoji Resolved emoji
 * @param {Message} msg Message
 * @returns {Promise<MessageReaction>} The reaction
 */
module.exports = function customReact(emoji, msg) {
  return bot.api.channels(msg.channel.id).messages(msg.id).reactions(emoji, '@me')
    .put()
    .then(() => bot.actions.MessageReactionAdd.handle({
      user: bot.user,
      channel: msg.channel,
      message: msg,
      emoji: Util.parseEmoji(emoji)
    }).reaction);
};
