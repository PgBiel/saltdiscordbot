const { bot, Discord: { User, ClientPresenceStore } } = require("../../util/deps");
const uncleanPresence = require("./uncleanPresence");

module.exports = function uncleanUser(user) {
  if (user == null || typeof user !== "object") return user;
  const { presence } = user;
  const genUser = new User(bot, user);
  if (presence) {
    bot.presences.set(user.id, uncleanPresence(presence));
  }
  return genUser;
};
