const { _, bot, db } = require("../../util/deps");
const rejct = require("../util/rejct");
const rejctF = require("../util/rejctF");
const uncompress = require("../compression/uncompress");
const dateuncomp = require("../compression/dateuncomp");
const escMarkdown = require("../strings/escMarkdown");

/**
 * Check all mutes and unmute / add muted role if needed.
 * @returns {Promise<void>}
 */
module.exports = async function checkMutes() {
  if (!bot.readyTimestamp) return;
  const awaited = await (db.table("activemutes").storage());
  const mutesForShard = _.flatten(
    awaited
    .filter((mute, guildId) => bot.guilds.has(guildId.toString()))
    .array()
    .map(([guildId, vals]) => _.flatten(vals.map(val => Object.assign({ serverid: guildId }, val, { old: val }))))
  );
  for (const mute of mutesForShard) {
    const guildId = mute.serverid;
    const guild = bot.guilds.get(guildId);
    if (!guild) continue;
    const member = guild.members.get(uncompress(mute.userid));
    if (!member) continue;
    const mutesForGuild = await (db.table("mutes").get(guildId));
    if (!mutesForGuild) continue;
    const muteRole = guild.roles.get(uncompress(mutesForGuild.muteRoleID));
    const timestamp = (dateuncomp(mute.timestamp) || { getTime: () => NaN }).getTime();
    if (
      !muteRole
      || mute.permanent
      || timestamp == null
      || isNaN(timestamp)) continue;
    const botmember = guild.members.get(bot.user.id);
    const now = Date.now();
    const escapedName = escMarkdown(guild.name);
    if (now >= timestamp) {
      db.table("activemutes").remArr(guild.id, mute.old);
      if (member.roles.has(muteRole.id)) {
        member.roles.remove(muteRole).then(() => {
          member.send(`Your mute in the server **${escapedName}** has been automatically lifted.`)
            .catch(rejctF("[AUTO-MUTE-REMOVE-ROLE-MSG SEND]"));
        }).catch(err => {
          if (!botmember.hasPermission(["MANAGE_ROLES"])) {
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted. \
However, I was unable to take the role away from you due to having no \`Manage Roles\` permission. :frowning:`)
              .catch(rejctF("[AUTO-MUTE-REMOVE-ROLE-NO MANAGE ROLES-MSG]"));
          } else if (botmember.roles.highest.position < muteRole.position) {
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted. \
However, I was unable to take the role away from you due to the mute role being higher than my highest role. \
:frowning:`)
            .catch(rejctF("[AUTO-MUTE-REMOVE-ROLE-ROLE LOWER-MSG]"));
          } else if (botmember.roles.highest.id === muteRole.id) {
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted. \
However, I was unable to take the role away from you due to the mute role being my highest role. :frowning:`)
            .catch(rejctF("[AUTO-MUTE-REMOVE-ROLE-ROLE EQUAL-MSG]"));
          } else {
            rejct(err, "At mute auto-remove role:");
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted. \
However, I was unable to take the role away from you for an yet unknown reason. :frowning:`)
              .catch(rejctF("[AUTO-MUTE-REMOVE-ROLE-UNKNOWN REASON-MSG]"));
          }
        });
      } else {
        member.send(`Your mute in the server **${escapedName}** has been automatically lifted.`)
          .catch(rejctF("[AUTO-MUTE-REMOVE-ROLE-NORMAL-MSG]"));
      }
    } else if (!member.roles.has(muteRole.id)) {
      member.roles.add(muteRole)
        .catch(rejctF("[AUTO-MUTE-ADD-ROLE]"));
    }
  }
};
