const {
  bot, Discord: {
    DMChannel, GroupDMChannel, TextChannel, VoiceChannel, CategoryChannel, GuildChannel, Channel,
    Constants: { ChannelTypes }
  }
} = require("../../util/deps");

module.exports = function uncleanChannel(channel, guild) {
  if (channel == null || typeof channel !== "object") return channel;
  const type = (Object.entries(ChannelTypes).find(([k, v]) => v === Number(channel.type)) || [""])[0].toLowerCase();
  let classe;
  switch (type) {
    case "dm":
      classe = DMChannel;
      break;
    case "group":
      classe = GroupDMChannel;
      break;
    case "text":
      classe = TextChannel;
      break;
    case "voice":
      classe = VoiceChannel;
      break;
    case "category":
      classe = CategoryChannel;
      break;
    default:
      if (channel.guild) {
        classe = GuildChannel;
      } else {
        classe = Channel;
      }
      break;
  }
  const useG = guild || (bot.guilds ? bot.guilds.get(channel.guildId) : null);
  if (classe === TextChannel || classe === VoiceChannel || classe === CategoryChannel || classe === GuildChannel) {
    return new classe(useG, channel);
  }
  return new classe(bot, channel, useG);
};
