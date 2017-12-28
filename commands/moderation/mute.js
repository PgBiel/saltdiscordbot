const Command = require("../../classes/command");
const muteP = require("../../punishments/mute");

const func = async function (msg, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  setPerms, searcher, promptAmbig, author, botmember, member, actionLog, dummy,
  checkRole, self,
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
  if (setPerms.mute) {
    if (!perms.mute) {
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
  } else if (!botmember.hasPermission(["MANAGE_CHANNELS"])) {
    return reply("I do not have the permission `Manage Channels`! :frowning:");
  }
  if (!args) {
    return reply("Please tell me who to mute!");
  }
  const { user, time, reason, ok: parseOk } = this.parseMute(args);
  this.logger.debug("Mute Debug:", user, time, reason);
  if (!parseOk) {
    return reply("Member not found!");
  }
  if (!user) {
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
  if (this.db.table("activemutes").get(guildId, []).findIndex(item => item.userid === memberToUse.id) > -1) {
    return reply("That member is already muted!");
  }
  muteP.punish(memberToUse, {
    author: member, reason, auctPrefix: `[Mute command executed by ${author.tag}] `, context: self,
    time, permanent: dummy.permanent,
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
  args: { time: true, reason: true },
  guildOnly: true,
  default: false,
});
