const cleanReaction = require("./cleanReaction");

module.exports = function cleanEmoji(emoji, guildId = (emoji.guild || {}).id) {
  if (emoji == null || typeof emoji !== "object") return emoji;
  const { id, animated, reaction, name, requiresColons, managed, roles } = emoji;
  const obj = {
    id,
    name,
    animated
  };
  if (emoji.guild) { // is GuildEmoji
    Object.assign(obj, {
      guild: guildId,
      require_colons: requiresColons,
      managed,
      roles: roles.map(r => r.id)
    });
  } else if (reaction) { // is ReactionEmoji
    obj.reaction = cleanReaction(reaction);
  }
  return obj;
};
