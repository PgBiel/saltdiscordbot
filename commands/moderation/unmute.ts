const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (msg, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  setPerms, searcher, promptAmbig, author, botmember, member, actionLog, dummy,
  checkRole, seePerm
}) {
  if (!seePerm("unmute", perms, setPerms, { srole: "moderator", hperm: "MANAGE_ROLES" })) {
    return reply("Missing permission `unmute`! Could also use this command with the `Moderator` saltrole or the `Manage \
Roles` Discord permission.");
  } else if (!botmember.hasPermission(["MANAGE_ROLES"])) {
    return reply("I do not have the permission `Manage Roles`! :frowning:");
  }
  if (!args) {
    return reply("Please tell me who to unmute!");
  }
  const [user, reason] = d._.tail((args.match(d.Constants.regex.BAN_MATCH) || Array(3)));
  if (!user && !reason) {
    return;
  }
  let memberToUse;
  let membersMatched;
  if (/[^]#\d{4}$/.test(user)) {
    const split = user.split("#");
    const discrim = split.pop();
    const username = split.join("#");
    memberToUse = guild.members.find(m => m.user.username === username && m.user.discriminator === discrim);
  } else if (/^<@!?\d+>$/.test(user)) {
    memberToUse = guild.members.get(user.match(/^<@!?(\d+)>$/)[1]);
  }
  if (!memberToUse) {
    membersMatched = searcher.searchMember(user);
  }
  if (membersMatched && membersMatched.length < 1) {
    return reply("Member not found!");
  } else if (membersMatched && membersMatched.length === 1) {
    memberToUse = membersMatched[0];
  } else if (membersMatched && membersMatched.length > 1 && membersMatched.length < 10) {
    const result = await promptAmbig(membersMatched);
    if (result.cancelled) {
      return;
    }
    memberToUse = result.subject;
  } else if (membersMatched) {
    return reply("Multiple members have matched your search. Please be more specific.");
  }
  if (!memberToUse) {
    return;
  }
  const muteInfo = await (d.db.table("mutes").get(guild.id));
  let muteRole;
  if (muteInfo) {
    muteRole = guild.roles.get(d.uncompress(muteInfo.muteRoleID));
  }
  if (!muteRole) {
    return reply("That member is not muted!");
  }
  const activeMute = (await (d.db.table("activemutes").get(guild.id, []))).find(item => d.uncompress(item.userid) === memberToUse.id);

  if (!activeMute) {
    return reply("That member is not muted!");
  }
  if (muteRole.position > botmember.roles.highest.position) {
    return reply("The role used for muting has a higher position than my highest role!");
  } else if (muteRole.position === botmember.roles.highest.position) {
    return reply("The role used for muting is my highest role!");
  }
  const sentMuteMsg = await send(`Unmuting ${memberToUse.user.tag}... (Sending DM...)`, { autoCatch: false });
  const reasonEmbed = new d.Embed();
  reasonEmbed
    .setColor("GREEN")
    .setDescription(reason || "None")
    .setTimestamp(new Date());
  const finish = () => {
    sentMuteMsg.edit(`Unmuted ${memberToUse.user.tag} successfully.`).catch(d.rejctF("[UNMUTE-SUCCESS-MSG-EDIT]"));
    actionLog({
      target: memberToUse,
      type: "u",
      author: member,
      reason: reason || "None"
    }).catch(d.rejctF("[UNMUTE-ACTIONLOG]"));
  };
  const fail = err => {
    d.rejct(err);
    sentMuteMsg.edit(`The unmute failed! :frowning:`).catch(d.rejctF("[UNMUTE-FAIL-EDIT-MSG]"));
  };
  const executeUnmute = () => {
    d.db.table("activemutes").remArr(guild.id, activeMute).then(() => {
      const compressedText = d.textAbstract(`[Unmute command executed by ${author.tag}] ${reason || "No reason given"}`, 512);
      memberToUse.roles.remove(muteRole, compressedText).then(finish).catch(fail);
    }).catch(fail);
  };
  let sent = false;
  let timeoutRan = false;
  memberToUse.send(
    `Your mute at the server **${d.escMarkdown(guild.name)}** was lifted for the reason of:`,
    { embed: reasonEmbed },
  ).then(() => {
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentMuteMsg.edit(`Unmuting ${memberToUse.user.tag}... (DM Sent. Removing muting role...)`).catch(d.rejctF("[UNMUTE-DM-SENT-EDIT-MSG]"));
    executeUnmute();
  }).catch(err => {
    d.rejct(err);
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentMuteMsg.edit(`Unmuting ${memberToUse.user.tag}... (DM Failed. Removing muting role anyway...)`).catch(d.rejctF("[UNMUTE-DM-FAIL-EDIT-MSG]"));
    executeUnmute();
  });
  setTimeout(() => {
    if (!sent) {
      timeoutRan = true;
      executeUnmute();
    }
  }, d.Time.seconds(2.8));
};

module.exports = new Command({
  func,
  name: "unmute",
  perms: "unmute",
  description: `Unmute a muted member.`,
  category: "Moderation",
  args: { reason: true },
  guildOnly: true,
  default: false
});
