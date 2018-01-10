const Command = require("../../classes/command");
const warnP = require("../../punishments/warn");

const func = async function (msg, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  searcher, promptAmbig, author, botmember, member, actionLog, dummy, checkRole,
  setPerms, self
}) {
  let hasPerm = false;
  if (hasPermission("MANAGE_ROLES")) hasPerm = true;
  try {
    if (checkRole("mod", member)) hasPerm = true;
  } catch (err) {
    this.logger.error(`At check role: ${err}`);
  }
  if (setPerms.warn) {
    hasPerm = perms.warn;
  }
  if (!hasPerm) {
    return reply(`You do not have sufficient permissions! To use this command, you need the \`Moderator\` SaltRole, \
    the \`Manage Roles\` Discord Permission or the permission \`warn\`.`);
  }
  if (!args) {
    return reply("Please tell me who to warn!");
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

  await warnP.punish(memberToUse, {
    author: member, reason, auctPrefix: `[Warn command executed by ${author.tag}] `, context: self, automatic: false,
  });
};
module.exports = new Command({
  func,
  name: "warn",
  perms: "warn",
  description: "Warn a member.",
  example: "{p}warn @EvilGuy#0010 Spamming a bit",
  category: "Moderation",
  args: { member: false, reason: true },
  guildOnly: true,
  default: false
});
