const { bot, Discord: { User } } = require("../../util/deps");

module.exports = function uncleanUser(user) {
  if (user == null || typeof user !== "object") return user;
  return new User(bot, user);
};
