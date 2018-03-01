const { bot, Discord: { Role } } = require("../../util/deps");

module.exports = function uncleanRole(role, guild) {
  if (role == null || typeof role !== "object") return role;
  return new Role(bot, role, guild || (bot.guilds ? bot.guilds.get(role.guildId) : null));
};
