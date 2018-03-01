const { bot, Discord: { Emoji, GuildEmoji, ReactionEmoji } } = require("../../util/deps");

module.exports = function uncleanEmoji(emoji, guild) {
  if (emoji == null || typeof emoji !== "object") return emoji;
  let classe;
  if (emoji.guild) {
    classe = GuildEmoji;
  } else if (emoji.reaction) {
    classe = ReactionEmoji;
  } else {
    classe = Emoji;
  }
  if (classe === ReactionEmoji) {
    return new classe(Object.assign({ message: { client: bot } }, emoji.reaction), emoji);
  }
  return new classe(bot, emoji, guild || (bot.guilds ? bot.guilds.get(emoji.guildId) : null));
};
