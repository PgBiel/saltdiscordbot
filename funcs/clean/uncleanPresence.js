const { bot, Discord: { Presence } } = require("../../util/deps");

module.exports = function uncleanPresence(presence, guild) {
  if (presence == null || typeof presence !== "object") return presence;
  return new Presence(bot, presence, guild);
};
