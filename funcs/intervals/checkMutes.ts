import { _, bot, db } from "../../util/deps";
import rejct from "../util/rejct";
import rejctF from "../util/rejctF";
import uncompress from "../compression/uncompress";
import dateuncomp from "../compression/dateuncomp";
import escMarkdown from "../strings/escMarkdown";
import { Storage } from "saltjs";

/**
 * Check all mutes and unmute / add muted role if needed.
 * @returns {Promise<void>}
 */
export default async function checkMutes() {
  if (!bot.readyTimestamp) return;
  const awaited = await (db.table("activemutes").storage());
  const mutesForShard = awaited
    .filter((mute, guildId: string) => bot.guilds.cache.has(guildId.toString())); // only mutes that are in common guilds
  for (const [guildId, mutes] of mutesForShard) {
    const guild = bot.guilds.resolve(guildId);
    if (!guild) continue;
    const mutesForGuild = await (db.table("mutes").get(guildId)); // mute config
    if (!mutesForGuild) continue;
    const muteRole = guild.roles.resolve(uncompress(mutesForGuild.muteRoleID));
    if (!muteRole) continue;
    for (const mute of mutes) {
      const member = guild.members.resolve(uncompress(mute.userid));
      if (!member) continue;
      const timestamp = (dateuncomp(mute.timestamp) || { getTime: () => NaN }).getTime();
      if (
        mute.permanent
        || timestamp == null
        || isNaN(timestamp)) continue;
      const botmember = guild.members.resolve(bot.user.id);
      const now: number = Date.now();
      const escapedName: string = escMarkdown(guild.name);
      if (now >= timestamp) { // if now > time the member would be unmuted then we must unmute
        db.table("activemutes").remArr(guild.id, mute);
        if (member.roles.cache.has(muteRole.id)) {
          member.roles.remove(muteRole).then(() => {
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted.`)
              .catch(rejctF("[AUTO-MUTE-REMOVE-ROLE-MSG SEND]"));
          }).catch(err => {
            if (!botmember.permissions.has("MANAGE_ROLES")) {
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
      } else if (!member.roles.cache.has(muteRole.id)) {
        member.roles.add(muteRole)
          .catch(rejctF("[AUTO-MUTE-ADD-ROLE]"));
      }
    }
  }
}
