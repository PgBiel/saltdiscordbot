const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (msg, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  promptAmbig, author, botmember, member, actionLog, dummy
}) {
  if (!perms.unban && !hasPermission(["BAN_MEMBERS"])) {
    return reply("You do not have sufficient permissions! :frowning:");
  } else if (!botmember.hasPermission(["BAN_MEMBERS"])) {
    return reply("I do not have the permission `Ban Members`! :frowning:");
  }
  if (!args) {
    return reply("Please tell me who to unban!");
  }
  const [user, reason] = d._.tail((args.match(d.Constants.regex.BAN_MATCH) || Array(3)));
  if (!user && !reason) {
    return;
  }
  let bans = await guild.fetchBans();
  bans = bans.map(info => info.user);
  let memberToUse;
  let membersMatched;
  if (/[^]#\d{4}$/.test(user)) {
    const split = user.split("#");
    const discrim = split.pop();
    const username = split.join("#");
    memberToUse = bans.find(m => m.username === username && m.discriminator === discrim);
  } else if (/^<@!?\d+>$/.test(user)) {
    memberToUse = bans.get(user.match(/^<@!?(\d+)>$/)[1]);
  }
  const searcher = new d.Searcher({ members: bans });
  if (!memberToUse) {
    membersMatched = searcher.searchMember(user);
  }
  if (membersMatched && membersMatched.length < 1) {
    return reply("User not found!");
  } else if (membersMatched && membersMatched.length === 1) {
    memberToUse = membersMatched[0];
  } else if (membersMatched && membersMatched.length > 1 && membersMatched.length < 10) {
    const resultPrompt = await promptAmbig(membersMatched, "banned users");
    if (resultPrompt.cancelled) {
      return;
    }
    memberToUse = resultPrompt.member;
  } else if (membersMatched) {
    return reply("Multiple banned users have matched your search. Please be more specific.");
  }
  if (!memberToUse) {
    return;
  }
  const embed = new d.Embed();
  embed
    .setAuthor(`Unban confirmation - ${memberToUse.tag}`, memberToUse.displayAvatarURL())
    .setColor("DARK_GREEN")
    .setDescription(reason || "No reason")
    .setTimestamp(new Date());
  const { res: result } = await prompt({
    question: `Are you sure you want to unban this member? \
This will expire in 15 seconds. Type __y__es or __n__o.`,
    invalidMsg: "__Y__es or __n__o?",
    filter: msg2 => {
      return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
    },
    timeout: d.Time.seconds(15),
    options: { embed }
  });
  if (!result) {
    return;
  }
  if (/^[nc]/i.test(result)) {
    send("Command cancelled.");
    return;
  }
  const sentUnbanMsg = await send(`Unbanning ${memberToUse.tag}... (Sending DM...)`);
  const reasonEmbed = new d.Embed();
  reasonEmbed
    .setColor("DARK_GREEN")
    .setDescription(reason || "None")
    .setTimestamp(new Date());
  const finish = () => {
    sentUnbanMsg.edit(`Unbanned ${memberToUse.tag} successfully.`).catch(d.rejct);
    actionLog({
      target: memberToUse,
      type: "U",
      author: member,
      reason: reason || "None"
    }).catch(d.rejct);
  };
  const fail = err => {
    d.rejct(err);
    sentUnbanMsg.edit(`The unban failed! :frowning:`).catch(d.rejct);
  };
  const executeUnban = () => {
    const compressedText = d.textAbstract(`[Unban command executed by ${author.tag}] ${reason || "No reason given"}`, 512);
    guild.unban(memberToUse, compressedText).then(finish).catch(fail);
  };
  let sent = false;
  let timeoutRan = false;
  memberToUse.send(
    `You were unbanned at the server **${d.escMarkdown(guild.name)}** for the reason of:`, { embed: reasonEmbed },
  ).then(() => {
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentUnbanMsg.edit(`Unbanning ${memberToUse.tag}... (DM Sent. Unbanning user...)`).catch(d.rejct);
    executeUnban();
  }).catch(err => {
    d.rejct(err);
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentUnbanMsg.edit(`Unbanning ${memberToUse.tag}... (DM Failed. Unbanning anyway...)`).catch(d.rejct);
    executeUnban();
  });
  setTimeout(() => {
    if (!sent) {
      timeoutRan = true;
      executeUnban();
    }
  }, d.Time.seconds(2.8));
};

module.exports = new Command({
  func,
  name: "unban",
  perms: "unban",
  description: "Unban an user.",
  example: "{p}unban @EvilGuy#0010 He's nice now",
  category: "Moderation",
  args: { user: false, reason: true },
  guildOnly: true,
  default: false
});
