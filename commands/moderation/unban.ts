import { GuildMember, Message, RichEmbed, User } from "discord.js";
import { TcmdFunc } from "../../commandHandler";
import { prefixes } from "../../sequelize/sequelize";
import { Command, Constants, logger, Searcher, Time } from "../../util/deps";
import { escMarkdown, rejct, textAbstract } from "../../util/funcs";

const func: TcmdFunc = async (msg: Message, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  promptAmbig, author, botmember, member, actionLog, dummy,
}) => {
  if (!perms.unban && !hasPermission(["BAN_MEMBERS"])) {
    return reply("You do not have sufficient permissions! :frowning:");
  } else if (!botmember.hasPermission(["BAN_MEMBERS"])) {
    return reply("I do not have the permission `Ban Members`! :frowning:");
  }
  if (!args) {
    return reply("Please tell me who to unban!");
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
  const bans = await guild.fetchBans();
  let memberToUse: User;
  let membersMatched: User[];
  if (/[^]#\d{4}$/.test(user)) {
    const split = user.split("#");
    const discrim = split.pop();
    const username = split.join("#");
    memberToUse = bans.find((
      m: User,
    ) => m.username === username && m.discriminator === discrim);
  } else if (/^<@!?\d+>$/.test(user)) {
    memberToUse = bans.get(user.match(/^<@!?(\d+)>$/)[1]);
  }
  const searcher = new Searcher<User>({ members: bans });
  if (!memberToUse) {
    membersMatched = searcher.searchMember(user);
  }
  if (membersMatched && membersMatched.length < 1) {
    return reply("User not found!");
  } else if (membersMatched && membersMatched.length === 1) {
    memberToUse = membersMatched[0];
  } else if (membersMatched && membersMatched.length > 1 && membersMatched.length < 10) {
    const result = await promptAmbig(membersMatched, "banned users");
    if (result.cancelled) {
      return;
    }
    memberToUse = result.member;
  } else if (membersMatched) {
    return reply("Multiple banned users have matched your search. Please be more specific.");
  }
  if (!memberToUse) {
    return;
  }
  const embed = new RichEmbed();
  embed
    .setAuthor(`Unban confirmation - ${memberToUse.tag}`, memberToUse.displayAvatarURL)
    .setColor("DARK_GREEN")
    .setDescription(reason || "No reason")
    .setTimestamp(new Date());
  const result = await prompt({
    question: `Are you sure you want to unban this member? \
This will expire in 15 seconds. Type __y__es or __n__o.`,
    invalidMsg: "__Y__es or __n__o?",
    filter: (msg2) => {
      return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
    },
    timeout: Time.seconds(15),
    cancel: false,
    options: { embed },
  });
  if (!result) {
    return;
  }
  if (/^n/i.test(result)) {
    send("Command cancelled.");
    return;
  }
  const sentUnbanMsg = await send(`Unbanning ${memberToUse.tag}... (Sending DM...)`);
  const reasonEmbed = new RichEmbed();
  reasonEmbed
    .setColor("DARK_GREEN")
    .setDescription(reason || "None")
    .setTimestamp(new Date());
  const finish = () => {
    sentUnbanMsg.edit(`Unbanned ${memberToUse.tag} successfully.`).catch(rejct);
    actionLog({
      action_desc: `**{target}** was unbanned`,
      target: { toString: () => memberToUse.tag },
      type: "unban",
      author: member,
      color: "DARK_GREEN",
      reason: reason || "None",
    }).catch(rejct);
  };
  const fail = (err: any) => {
    rejct(err);
    sentUnbanMsg.edit(`The unban failed! :frowning:`).catch(rejct);
  };
  const executeUnban = () => {
    guild.unban(memberToUse).then(finish).catch(fail);
  };
  let sent: boolean = false;
  let timeoutRan: boolean = false;
  memberToUse.send(
    `You were unbanned at the server **${escMarkdown(guild.name)}** for the reason of:`, { embed: reasonEmbed },
  ).then(() => {
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentUnbanMsg.edit(`Unbanning ${memberToUse.tag}... (DM Sent. Unbanning user...)`).catch(rejct);
    executeUnban();
  }).catch((err) => {
    rejct(err);
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentUnbanMsg.edit(`Unbanning ${memberToUse.tag}... (DM Failed. Unbanning anyway...)`).catch(rejct);
    executeUnban();
  });
  setTimeout(() => {
    if (!sent) {
      timeoutRan = true;
      executeUnban();
    }
  }, Time.seconds(2.8));
};

export const unban = new Command({
  func,
  name: "unban",
  perms: "unban",
  description: "Unban an user.",
  example: "{p}unban @EvilGuy#0010 He's nice now",
  category: "Moderation",
  args: { user: false, reason: true },
  guildOnly: true,
  default: false,
});
