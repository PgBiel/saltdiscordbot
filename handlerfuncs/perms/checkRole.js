const { db, uncompress } = require("../../misc/d");

module.exports = msg => {
  let guildId, guild;
  if (msg.guild) {
    guild = msg.guild;
    guildId = guild.id;
  }
  return async (role, member) => {
    if (["mod", "admin"].includes(role)) {
      role = role === "mod" ? "moderator" : "administrator";
    }
    if (!guildId) {
      return false;
    }
    const result = await (db.table("mods").get(guild.id));
    if (!result || !result[role]) {
      return false;
    }
    if (Array.isArray(result[role])) {
      for (const roleID of result[role]) {
        if (member.roles.has(uncompress(roleID))) return true;
      }
    } else {
      return member.roles.has(uncompress(result[role]));
    }
  };
};
