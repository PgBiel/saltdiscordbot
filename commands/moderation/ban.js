const { GuildMember, Message, MessageEmbed, User } = require("discord.js");
const Command = require("../../classes/command");
const { escMarkdown, rejct, textAbstract } = require("../../util/funcs");

const func = async function (msg, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  searcher, promptAmbig, author, botmember, member, actionLog, dummy,
  self,
}) {
  const actions = [
    (dummy.actions && dummy.actions[0]) || "Banning",
    (dummy.actions && dummy.actions[1]) || "Banned",
    (dummy.actions && dummy.actions[2]) || "banned",
    (dummy.actions && dummy.actions[3]) || "Ban",
    (dummy.actions && dummy.actions[4]) || "ban",
  ];
  if (!perms[dummy.perms || "ban"] && !hasPermission(["BAN_MEMBERS"])) {
    return reply("You do not have sufficient permissions! :frowning:");
  } else if (!botmember.hasPermission(["BAN_MEMBERS"])) {
    return reply("I do not have the permission `Ban Members`! :frowning:");
  }
  if (!args) {
    return reply(`Please tell me who to ${actions[4]}!`);
  }
  let memberToUse;
  const getUser = () => memberToUse instanceof GuildMember ? memberToUse.user : memberToUse;
  const [user, reason] = this._.tail((args.match(this.Constants.regex.BAN_MATCH) || Array(3)));
  if (!user && !reason) {
    return;
  }
  // this.logger.debug(user, reason);
  let id;
  if (dummy.banType !== "idban") {
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
  } else {
    if (!/^\d+$/.test(user)) {
      return reply("Invalid ID supplied!");
    }
    if (guild.members.has(user)) {
      memberToUse = guild.members.get(user);
    } else if (this.bot.users.has(user)) {
      memberToUse = this.bot.users.get(user);
    } else {
      try {
        memberToUse = await this.bot.users.fetch(user);
      } catch (err) {
        // User not found.
      }
      if (!memberToUse) {
        id = user;
      }
    }
  }
  if (!id && memberToUse.id === member.id) {
    return reply(`You cannot ${actions[4]} yourself!`);
  }
  this.banP.punish(id || memberToUse, guild, self, {
    author: member, reason, auctPrefix: `[${actions[3]} command executed by ${author.tag}] `, actions,
    usePrompt: dummy.usePrompt == null ? true : dummy.usePrompt, color: dummy.color, days: dummy.days,
    isSoft: dummy.banType === "softban",
  });
};
module.exports = new Command({
  func,
  name: "ban",
  perms: "ban",
  description: "Ban a member.",
  example: "{p}ban @EvilGuy#0010 Being evil",
  category: "Moderation",
  args: { member: false, reason: true },
  guildOnly: true,
  default: false,
});
