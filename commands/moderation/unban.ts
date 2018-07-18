import Command from "../../classes/command";
import { _, Constants, Searcher, Embed, Time, rejct, rejctF, textAbstract, escMarkdown, User } from "../../misc/d";
import { TcmdFunc } from "../../misc/contextType";

const func: TcmdFunc<{}> = async function(msg, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  promptAmbig, author, botmember, member, actionLog, dummy
}) {
  if (!perms.unban && !hasPermission(["BAN_MEMBERS"])) {
    return reply("Missing permission `unban`! Could also use this command with the `Ban Members` Discord permission.");
  } else if (!botmember.hasPermission(["BAN_MEMBERS"])) {
    return reply("I do not have the permission `Ban Members`! :frowning:");
  }
  if (!args) {
    return reply("Please tell me who to unban!");
  }
  const [user, reason]: string[] = _.tail((args.match(Constants.regex.BAN_MATCH) || Array(3)));
  if (!user && !reason) {
    return;
  }
  const bans = (await guild.fetchBans()).map(info => info.user);
  let memberToUse: User;
  let membersMatched: User[];
  if (/[^]#\d{4}$/.test(user)) {
    const split: string[] = user.split("#");
    const discrim: string = split.pop();
    const username: string = split.join("#");
    memberToUse = bans.find(m => m.username === username && m.discriminator === discrim);
  } else if (/^<@!?\d+>$/.test(user)) {
    const matchedId: string = user.match(/^<@!?(\d+)>$/)[1];
    memberToUse = bans.find(u => u.id === matchedId);
  }
  const searcher = new Searcher({ members: bans });
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
    memberToUse = resultPrompt.subject;
  } else if (membersMatched) {
    return reply("Multiple banned users have matched your search. Please be more specific.");
  }
  if (!memberToUse) {
    return;
  }
  const embed: Embed = new Embed();
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
    timeout: Time.seconds(15),
    options: { embed }
  });
  if (!result) {
    return;
  }
  if (/^[nc]/i.test(result)) {
    send("Command cancelled.");
    return;
  }
  const sentUnbanMsg = await send(`Unbanning ${memberToUse.tag}... (Sending DM...)`, { autoCatch: false });
  const reasonEmbed = new Embed();
  reasonEmbed
    .setColor("DARK_GREEN")
    .setDescription(reason || "None")
    .setTimestamp(new Date());
  const finish = () => {
    sentUnbanMsg.edit(`Unbanned ${memberToUse.tag} successfully.`).catch(rejctF("[UNBAN-SENDMSG]"));
    actionLog({
      target: memberToUse,
      type: "U",
      author: member,
      reason: reason || "None",
      guild
    }).catch(rejctF("[UNBAN-ACTIONLOG]"));
  };
  const fail = err => {
    rejct(err);
    sentUnbanMsg.edit(`The unban failed! :frowning:`).catch(rejctF("[UNBAN-FAILEDITMSG]"));
  };
  const executeUnban = () => {
    const compressedText = textAbstract(`[Unban command executed by ${author.tag}] ${reason || "No reason given"}`, 512);
    guild.members.unban(memberToUse, compressedText).then(finish).catch(fail);
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
    sentUnbanMsg.edit(`Unbanning ${memberToUse.tag}... (DM Sent. Unbanning user...)`).catch(rejctF("[UNBAN-DM-SENT-EDIT-MSG]"));
    executeUnban();
  }).catch(err => {
    rejct(err);
    if (timeoutRan) {
      return;
    }
    sent = true;
    sentUnbanMsg.edit(
      `Unbanning ${memberToUse.tag}... (DM Failed. Unbanning anyway...)`
    ).catch(rejctF("[UNBAN-DM-FAIL-EDIT-MSG]"));
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
  default: false
});
