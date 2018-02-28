const { bot, Discord: { Guild } } = require("../../util/deps");
const temp = require("../../util/temp");
const rejct = require("../util/rejct");

module.exports = function uncleanGuild(guild) {
  if (guild == null || typeof guild !== "object") return guild;
  const { roles, emojis, channels, members } = guild;
  const func = s => Object.assign({}, s, { guild: { id: guild.id || (s.guild || {}).id } });
  const obj = Object.assign({}, guild, {
    roles: roles.map(func),
    emojis: emojis.map(func),
    channels: channels.map(func),
    members: members.map(func)
  });
  const gg = new Guild(bot, guild);
  /* try {
    await gg.members.fetch();
    temp.set("cacheGuilds", (temp.get("cacheGuilds") || []).concat([gg.id]));
  } catch (err) {
    rejct(err, "[UNCLEANGUILD FETCHMEMBERS]");
  } */
  const loopAddGuild = coll => {
    for (const [id, s] of coll) s.guild = gg;
  };
  for (const type of ["roles", "emojis", "channels", "members"]) {
    loopAddGuild(gg[type]);
  }
  return gg;
};
