const Command = require("../../classes/command");
const muteP = require("../../punishments/mute");
const d = require("../../misc/d");

const func = async function (msg, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  setPerms, searcher, promptAmbig, author, botmember, member, actionLog, dummy,
  checkRole, self, seePerm
}) {
  const hasPerm = await seePerm(dummy.perms || "mute", perms, setPerms, { srole: "moderator", hperms: "MANAGE_ROLES" });
  if (!hasPerm) {
    return reply("Missing permission `mute`! Could also use this command with the `Moderator` saltrole or the `Manage \
Roles` Discord permission. :frowning:");
  } else if (!botmember.hasPermission(["MANAGE_ROLES"])) {
    return reply("I do not have the permission `Manage Roles`! :frowning:");
  } else if (!botmember.hasPermission(["MANAGE_CHANNELS"])) {
    return reply("I do not have the permission `Manage Channels`! :frowning:");
  }
  if (!args) {
    return reply("Please tell me who to mute!");
  }
  let user, time, reason;
  if (dummy.permanent) {
    const [tempUser, tempReason] = d._.tail((args.match(d.Constants.regex.BAN_MATCH) || Array(3)));
    if (!tempUser && !tempReason) {
      return;
    }
    user = tempUser;
    reason = tempReason;
  } else {
    const { user: tempUser, time: tempTime, reason: tempReason, ok: parseOk } = d.parseMute(args);
    d.logger.debug("Mute Debug:", tempUser, tempTime, tempReason);
    if (!parseOk) {
      return reply("Member not found!");
    }
    if (!tempUser) {
      return;
    }
    user = tempUser;
    time = tempTime;
    reason = tempReason;
  }
  if (time && time.totalYears > 1) return reply("Please don't mute for more than 1 year! For that, use `pmute`.");
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
  /* // This code was used for time parsing.
  let timeToUse: Time = new Time(["m", 10]);
  if (time && !Constants.regex.MUTE.IS_NOTHING.test(time)) {
    if (Constants.regex.MUTE.IS_JUST_NUMBER.test(time)) {
      timeToUse = new Time(["m", Number(time)]);
    } else {
      timeToUse = new Time();
      const parsedTime = parseTimeStr(time);
      for (const unit of Object.getOwnPropertyNames(parsedTime)) {
        if (Time.validUnit(unit)) {
          timeToUse.add(unit, parsedTime[unit]);
        }
      }
    }
  } */
  if ((await (d.db.table("activemutes").get(guildId, []))).findIndex(item => d.uncompress(item.userid) === memberToUse.id) > -1) {
    return reply("That member is already muted!");
  }
  muteP.punish(memberToUse, {
    author: member, reason, auctPrefix: `[Mute command executed by ${author.tag}] `, context: self,
    time, permanent: dummy.permanent
  });
};

module.exports = new Command({
  func,
  name: "mute",
  perms: "mute",
  description: `Mute a member. When time is not specified, it's 10 minutes by default. Time units:
  - For months, use one of \`month\`, \`months\`, \`mo\`.
  - For weeks, use one of \`week\`, \`weeks\`, \`w\`.
  - For days, use one of \`day\`, \`days\`, \`d\`.
  - For hours, use one of \`hour\`, \`hours\`, \`h\`.
  - For minutes, use one of \`minute\`, \`minutes\`, \`mins\`, \`min\`, \`m\`.
  - For seconds, use one of \`second\`, \`seconds\`, \`secs\`, \`sec\`, \`s\`.
  You can also use just a number in the \`time\` parameter to use minutes.`,
  example: `{p}mute @InsultGuy#0000 Calm down on the insults!
{p}mute @InsultGuy#0000 1 hour 2 minutes Calm down.
{p}mute @Spammer#0000 1 day Man stop spamming pls.`,
  category: "Moderation",
  args: { user: false, time: true, reason: true },
  guildOnly: true,
  default: false
});
