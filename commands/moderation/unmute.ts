import Command from "../../classes/command";
import {
  _, Constants, Embed, Time, rejct, rejctF, textAbstract, escMarkdown, uncompress, db, GuildMember
} from "../../misc/d";
import { TcmdFunc } from "../../misc/contextType";

const func: TcmdFunc<{}> = async function(msg, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  setPerms, searcher, promptAmbig, author, botmember, member, actionLog, dummy,
  checkRole, seePerm
}) {
  if (!seePerm("unmute", perms, setPerms, { srole: "moderator", hperms: "MANAGE_ROLES" })) {
    return reply("Missing permission `unmute`! Could also use this command with the `Moderator` saltrole or the `Manage \
Roles` Discord permission.");
  } else if (!botmember.hasPermission(["MANAGE_ROLES"])) {
    return reply("I do not have the permission `Manage Roles`! :frowning:");
  }
  if (!args) {
    return reply("Please tell me who to unmute!");
  }
  const [user, reason]: string[] = _.tail((args.match(Constants.regex.BAN_MATCH) || Array(3)));
  if (!user && !reason) {
    return;
  }
  let memberToUse: GuildMember;
  let membersMatched: GuildMember[];
  if (/[^]#\d{4}$/.test(user)) {
    const split: string[] = user.split("#");
    const discrim: string = split.pop();
    const username: string = split.join("#");
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
  const muteInfo = await (db.table("mutes").get(guild.id));
  let muteRole;
  if (muteInfo) {
    muteRole = guild.roles.get(uncompress(muteInfo.muteRoleID));
  }
  if (!muteRole) {
    return reply("That member is not muted!");
  }
  const activeMute = (await (db.table("activemutes").get(guild.id, []))).find(item => uncompress(item.userid) === memberToUse.id);

  if (!activeMute) {
    return reply("That member is not muted!");
  }
  if (muteRole.position > botmember.roles.highest.position) {
    return reply("The role used for muting has a higher position than my highest role!");
  } else if (muteRole.position === botmember.roles.highest.position) {
    return reply("The role used for muting is my highest role!");
  }
  const sentMuteMsg = await send(`Unmuting ${memberToUse.user.tag}... (Sending DM...)`, { autoCatch: false });
  const reasonEmbed = new Embed();
  reasonEmbed
    .setColor("GREEN")
    .setDescription(reason || "None")
    .setTimestamp(new Date());
  const finish = () => {
    sentMuteMsg.edit(`Unmuted ${memberToUse.user.tag} successfully.`).catch(rejctF("[UNMUTE-SUCCESS-MSG-EDIT]"));
    actionLog({
      target: memberToUse,
      type: "u",
      author: member,
      reason: reason || "None",
      guild
    }).catch(rejctF("[UNMUTE-ACTIONLOG]"));
  };
  const fail = err => {
    rejct(err);
    sentMuteMsg.edit(`The unmute failed! :frowning:`).catch(rejctF("[UNMUTE-FAIL-EDIT-MSG]"));
  };
  const executeUnmute = () => {
    db.table("activemutes").remArr(guild.id, activeMute).then(() => {
      const compressedText = textAbstract(`[Unmute command executed by ${author.tag}] ${reason || "No reason given"}`, 512);
      memberToUse.roles.remove(muteRole, compressedText).then(finish).catch(fail);
    }).catch(fail);
  };
  let sent = false;
  let timeoutRan = false;
  memberToUse.send(
    `Your mute at the server **${escMarkdown(guild.name)}** was lifted for the reason of:`,
    { embed: reasonEmbed },
  ).then(() => {
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentMuteMsg.edit(`Unmuting ${memberToUse.user.tag}... (DM Sent. Removing muting role...)`)
      .catch(rejctF("[UNMUTE-DM-SENT-EDIT-MSG]"));
    executeUnmute();
  }).catch(err => {
    rejct(err);
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentMuteMsg.edit(`Unmuting ${memberToUse.user.tag}... (DM Failed. Removing muting role anyway...)`)
      .catch(rejctF("[UNMUTE-DM-FAIL-EDIT-MSG]"));
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
  default: false
});
