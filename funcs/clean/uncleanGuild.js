const { bot, Discord: { Guild } } = require("../../util/deps");
const temp = require("../../util/temp");
const rejct = require("../util/rejct");

module.exports = function uncleanGuild(guild) {
  if (guild == null || typeof guild !== "object") return guild;
  const { roles, emojis, channels, members } = guild;
  const gg = new Guild(bot, Object.assign({}, guild, { channels: [] }));
  if (gg.channels.size < 1) for (const chnl of channels) gg.channels.add(chnl);
  return gg;
};
