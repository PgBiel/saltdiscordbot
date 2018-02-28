const cleanUser = require("./cleanUser");

module.exports = function cleanReaction(reaction, guildId = (reaction.guild || {}).id) {
  if (reaction == null || typeof reaction !== "object") return reaction;
  const { count, me, message, users } = reaction;
  return {
    count,
    me,
    message: (message || {}).id,
    users: users.map(u => cleanUser(u))
  };
};
