const Command = require("../../classes/command");

const func = async function (msg, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  setPerms, searcher, promptAmbig, author, botmember, member, actionLog, dummy,
  checkRole,
}) {
  let hasPerm = false;
  if (hasPermission(["MANAGE_ROLES"])) {
    hasPerm = true;
  }
  try {
    if (checkRole("mod", member)) {
      hasPerm = true;
    }
  } catch (err) {
    this.logger.error(`At check role: ${err}`);
  }
  if (setPerms.unmute) {
    if (!perms.unmute) {
      hasPerm = false;
    }
    if (dummy.perms && !perms[dummy.perms] && setPerms[dummy.perms]) {
      hasPerm = false;
    }
  }
  if (!hasPerm) {
    return reply("You do not have sufficient permissions! :frowning:");
  } else if (!botmember.hasPermission(["MANAGE_ROLES"])) {
    return reply("I do not have the permission `Manage Roles`! :frowning:");
  }
  if (!args) {
    return reply("Please tell me who to unmute!");
  }
  const [user, reason] = this._.tail((args.match(this.Constants.regex.BAN_MATCH) || Array(3)));
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
    memberToUse = result.member;
  } else if (membersMatched) {
    return reply("Multiple members have matched your search. Please be more specific.");
  }
  if (!memberToUse) {
    return;
  }
  const muteInfo = this.db.table("mutes").get(guild.id);
  let muteRole;
  if (muteInfo) {
    muteRole = guild.roles.get(muteInfo.muteRoleID);
  }
  if (!muteRole) {
    return reply("That member is not muted!");
  }
  const activeMute = this.db.table("activemutes").get(guild.id, []).find(item => item.userid === memberToUse.id);

  if (!activeMute) {
    return reply("That member is not muted!");
  }
  if (muteRole.position > botmember.highestRole.position) {
    return reply("The role used for muting has a higher position than my highest role!");
  } else if (muteRole.position === botmember.highestRole.position) {
    return reply("The role used for muting is my highest role!");
  }
  const sentMuteMsg = await send(`Unmuting ${memberToUse.user.tag}... (Sending DM...)`);
  const reasonEmbed = new this.Embed();
  reasonEmbed
    .setColor("GREEN")
    .setDescription(reason || "None")
    .setTimestamp(new Date());
  const finish = () => {
    sentMuteMsg.edit(`Unmuted ${memberToUse.user.tag} successfully.`).catch(this.rejct);
    actionLog({
      target: memberToUse,
      type: "u",
      author: member,
      reason: reason || "None",
    }).catch(this.rejct);
  };
  const fail = err => {
    this.rejct(err);
    sentMuteMsg.edit(`The unmute failed! :frowning:`).catch(this.rejct);
  };
  const executeUnmute = () => {
    this.db.table("activemutes").remArr(guild.id, activeMute).then(() => {
      const compressedText = this.textAbstract(`[Unmute command executed by ${author.tag}] ${reason || "No reason given"}`, 512);
      memberToUse.removeRole(muteRole, compressedText).then(finish).catch(fail);
    }).catch(fail);
  };
  let sent = false;
  let timeoutRan = false;
  memberToUse.send(
    `Your mute at the server **${this.escMarkdown(guild.name)}** was lifted for the reason of:`,
    { embed: reasonEmbed },
  ).then(() => {
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentMuteMsg.edit(`Unmuting ${memberToUse.user.tag}... (DM Sent. Removing muting role...)`).catch(this.rejct);
    executeUnmute();
  }).catch(err => {
    this.rejct(err);
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentMuteMsg.edit(`Unmuting ${memberToUse.user.tag}... (DM Failed. Removing muting role anyway...)`).catch(this.rejct);
    executeUnmute();
  });
  setTimeout(() => {
    if (!sent) {
      timeoutRan = true;
      executeUnmute();
    }
  }, this.Time.seconds(2.8));
};

module.exports = new Command({
  func,
  name: "unmute",
  perms: "unmute",
  description: `Unmute a muted member.`,
  category: "Moderation",
  args: { reason: true },
  guildOnly: true,
  default: false,
});
