const cleanUser = require("./cleanUser");
module.exports = function cleanGuildMember(member, guildId = member.guild.id) {
  if (member == null || typeof member !== "object") return member;
  const { roles, user, speaking, nickname, joinedTimestamp } = member;
  return {
    guildId,
    roles: roles.map(r => r.id),
    user: cleanUser(user),
    speaking,
    nickname,
    joined_at: joinedTimestamp
  };
};