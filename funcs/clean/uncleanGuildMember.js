const { bot, Discord: { GuildMember } } = require("../../util/deps");

module.exports = function uncleanmember(member, guild) {
  if (member == null || typeof member !== "object") return member;
  return new GuildMember(bot, member, guild || (bot.guilds ? bot.guilds.get(member.guildId) : null));
};
