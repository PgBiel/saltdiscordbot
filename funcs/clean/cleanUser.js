const cleanPresence = require("./cleanPresence");

module.exports = function cleanUser(user) {
  if (user == null || typeof user !== "object") return user;
  const { id, username, discriminator, bot, avatar, presence } = user;
  return {
    id,
    bot,
    username,
    discriminator,
    avatar,
    presence: cleanPresence(presence)
  };
};