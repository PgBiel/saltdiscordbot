import { GuildMember, Message, RichEmbed } from "discord.js";
import { TcmdFunc } from "../../commandHandler";
import kickP from "../../punishments/kick";
import { prefixes } from "../../sequelize/sequelize";
import { _, Command, Constants, logger, querystring, Time } from "../../util/deps";
import { escMarkdown, rejct, textAbstract } from "../../util/funcs";

const func: TcmdFunc = async (msg: Message, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  searcher, promptAmbig, author, botmember, member, actionLog, dummy, self,
}) => {
  if (!perms.kick && !hasPermission(["KICK_MEMBERS"])) {
    return reply("You do not have sufficient permissions! :frowning:");
  } else if (!botmember.hasPermission(["KICK_MEMBERS"])) {
    return reply("I do not have the permission `Kick Members`! :frowning:");
  }
  if (!args) {
    return reply("Please tell me who to kick!");
  }
  const [user, reason]: string[] = _.tail((args.match(Constants.regex.BAN_MATCH) || Array(3)));
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
  if (memberToUse.id === member.id) {
    return reply(`You cannot kick yourself!`);
  }
  kickP.punish(memberToUse, member, reason, `[Kick command executed by ${author.tag}]`, self);
};
export const kick = new Command({
  func,
  name: "kick",
  perms: "kick",
  description: "Kick a member.",
  example: "{p}kick @EvilGuy#0010 Being sort of evil",
  category: "Moderation",
  args: { member: false, reason: true },
  guildOnly: true,
  default: false,
});
