import { GuildMember, Message, RichEmbed, Role } from "discord.js";
import { TcmdFunc } from "../../commandHandler";
import { activemutes, mutes } from "../../sequelize/sequelize";
import { Command, Constants, logger, Time } from "../../util/deps";
import { createMutedRole, escMarkdown, parseMute, rejct } from "../../util/funcs";

const func: TcmdFunc = async (msg: Message, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  setPerms, searcher, promptAmbig, author, botmember, member, actionLog, dummy,
  checkRole,
}) => {
  let hasPerm: boolean = false;
  if (hasPermission(["MANAGE_ROLES"])) {
    hasPerm = true;
  }
  try {
    if (await checkRole("mod", member)) {
      hasPerm = true;
    }
  } catch (err) {
    logger.error(`At check role: ${err}`);
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
  let user: string;
  let reason: string;
  const [preUser, preReason] = [
    args.match(Constants.regex.BAN_MATCH(true)), args.match(Constants.regex.BAN_MATCH(false)),
  ];
  if (preUser) {
    user = preUser[1];
  }
  if (preReason) {
    reason = preReason[1];
  }
  if (!user && !reason) {
    return;
  }
  let memberToUse: GuildMember;
  let membersMatched: GuildMember[];
  if (/[^]#\d{4}$/.test(user)) {
    const split = user.split("#");
    const discrim = split.pop();
    const username = split.join("#");
    memberToUse = guild.members.find((
      m: GuildMember,
    ) => m.user.username === username && m.user.discriminator === discrim);
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
  const muteInfo: {[prop: string]: any} = await mutes.find({ where: { serverid: guild.id } });
  let muteRole: Role;
  if (muteInfo) {
    muteRole = guild.roles.get(muteInfo.muteRoleID);
  }
  if (!muteRole) {
    return reply("That member is not muted!");
  }
  const activeMute: {[prop: string]: any} =
  await activemutes.findOne({ where: { serverid: guild.id, userid: memberToUse.id } });

  if (!activeMute) {
    return reply("That member is not muted!");
  }
  if (muteRole.position > botmember.highestRole.position) {
    return reply("The role used for muting has a higher position than my highest role!");
  } else if (muteRole.position === botmember.highestRole.position) {
    return reply("The role used for muting is my highest role!");
  }
  const sentMuteMsg = await send(`Unmuting ${memberToUse.user.tag}... (Sending DM...)`);
  const reasonEmbed = new RichEmbed();
  reasonEmbed
    .setColor("GREEN")
    .setDescription(reason || "None")
    .setTimestamp(new Date());
  const finish = () => {
    sentMuteMsg.edit(`Unmuted ${memberToUse.user.tag} successfully.`).catch(rejct);
    actionLog({
      action_desc: `**{target}** was unmuted`,
      target: memberToUse,
      type: "unmute",
      author: member,
      color: "GREEN",
      reason: reason || "None",
    }).catch(rejct);
  };
  const fail = (err: any) => {
    rejct(err);
    sentMuteMsg.edit(`The unmute failed! :frowning:`).catch(rejct);
  };
  const executeUnmute = () => {
    activeMute.destroy().then(() => {
      memberToUse.removeRole(muteRole).then(finish).catch(fail);
    }).catch(fail);
  };
  let sent: boolean = false;
  let timeoutRan: boolean = false;
  memberToUse.send(
    `Your mute at the server **${escMarkdown(guild.name)}** was lifted for the reason of:`,
    { embed: reasonEmbed },
  ).then(() => {
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentMuteMsg.edit(`Unmuting ${memberToUse.user.tag}... (DM Sent. Removing muting role...)`).catch(rejct);
    executeUnmute();
  }).catch((err) => {
    rejct(err);
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentMuteMsg.edit(`Unmuting ${memberToUse.user.tag}... (DM Failed. Removing muting role anyway...)`).catch(rejct);
    executeUnmute();
  });
  setTimeout(() => {
    if (!sent) {
      timeoutRan = true;
      executeUnmute();
    }
  }, Time.seconds(2.8));
};

export const unmute = new Command({
  func,
  name: "unmute",
  perms: "unmute",
  description: `Unmute a muted member.`,
  category: "Moderation",
  args: { reason: true },
  guildOnly: true,
  default: false,
});
