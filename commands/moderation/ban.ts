import { GuildMember, Message, RichEmbed, User } from "discord.js";
import { TcmdFunc } from "../../commandHandler";
import { prefixes } from "../../sequelize/sequelize";
import { bot, Command, Constants, logger, Time } from "../../util/deps";
import { escMarkdown, rejct, textAbstract } from "../../util/funcs";

const func: TcmdFunc = async (msg: Message, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  searcher, promptAmbig, author, botmember, member, actionLog, dummy,
}) => {
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
  let memberToUse: GuildMember | User;
  const getUser = () => memberToUse instanceof GuildMember ? memberToUse.user : memberToUse;
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
  // logger.debug(user, reason);
  let id: string;
  if (dummy.banType !== "idban") {
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
  } else {
    if (!/^\d+$/.test(user)) {
      return reply("Invalid ID supplied!");
    }
    if (guild.members.has(user)) {
      memberToUse = guild.members.get(user);
    } else if (bot.users.has(user)) {
      memberToUse = bot.users.get(user);
    } else {
      try {
        memberToUse = await bot.fetchUser(user);
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
  } else if (memberToUse instanceof GuildMember) {
    if (memberToUse.highestRole.position > botmember.highestRole.position) {
      return reply("That member's highest role is higher in position than mine!");
    } else if (memberToUse.highestRole.position === botmember.highestRole.position) {
      return reply("That member's highest role is the same in position as mine!");
    } else if (memberToUse.highestRole.position > member.highestRole.position && member.id !== guild.owner.id) {
      return reply("That member's highest role is higher in position than yours!");
    } else if (memberToUse.highestRole.position === member.highestRole.position && member.id !== guild.owner.id) {
      return reply("That member's highest role is the same in position as yours!");
    } else if (memberToUse.id === guild.owner.id) {
      return reply("That member is the owner!");
    } else if (!memberToUse.bannable) {
      return reply("That member is not bannable (being generic here). \
  Check the conditions for being banned (e.g. must not be owner, etc)!");
    }
  }
  const embed = new RichEmbed();
  embed
    .setAuthor(`${actions[3]} confirmation - ${id || getUser().tag}`, id ? undefined : getUser().displayAvatarURL)
    .setColor("RED")
    .setDescription(reason || "No reason")
    .setTimestamp(new Date());
  if (dummy.usePrompt == null || dummy.usePrompt) {
    const result = await prompt({
      question: `Are you sure you want to ${actions[4]} this ${id ? "user ID" : "member"}? \
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
  }
  const sentBanMsg = await send(`${actions[0]} ${id || getUser().tag}... (${id ?
    "Swinging ban hammer..." :
    "Sending DM..."})`);
  const reasonEmbed = new RichEmbed();
  reasonEmbed
    .setColor(dummy.color || "RED")
    .setDescription(reason || "None")
    .setTimestamp(new Date());
  const finishAsync = async (target: GuildMember | User | string) => {
    let targetToUse: typeof target;
    if (typeof target === "string") {
      sentBanMsg
      .edit(`${actions[0]} ${id || getUser().tag}... (Banned successfully. Fetching username...)`)
      .catch(rejct);
      try {
        const bans = await guild.fetchBans();
        targetToUse = bans.get(target) || target;
      } catch (err) {
        targetToUse = target;
      }
    } else {
      targetToUse = target;
    }
    const name = targetToUse instanceof GuildMember ?
      targetToUse.user.tag :
      targetToUse instanceof User ?
      targetToUse.tag :
      targetToUse;
    sentBanMsg.edit(`${actions[1]} ${name} successfully.`).catch(rejct);
    const userTarget = targetToUse instanceof GuildMember ? targetToUse.user : targetToUse;
    const logObj = {
      action_desc: `**{target}** was ${actions[2]}`,
      type: actions[3],
      author: member,
      color: dummy.color || "RED",
      reason: reason || "None",
      target: userTarget,
    };
    actionLog(logObj).catch(rejct);
  };
  const finish = (target: GuildMember | User | string) => {
    finishAsync(target).catch((err: any) => { throw err; });
  };
  const fail = (err: any) => {
    if (/Unknown ?User/i.test(err.toString()) && id) {
      sentBanMsg.edit(`An user with that ID does not exist!`).catch(rejct);
    } else {
      rejct(err);
      sentBanMsg.edit(`The ${actions[4]} failed! :frowning:`).catch(rejct);
    }
  };
  const executeBan = () => {
    const banPrefix = `[${actions[3]} command executed by ${author.tag}] `;
    // const availableLength = 512 - (reason.length + banPrefix.length);
    const compressedText = textAbstract(banPrefix + (reason || "No reason given"), 512);
    guild.ban(
      id || memberToUse,
      { days: dummy.days == null ? 1 : dummy.days, reason: compressedText }).then((result) => {
        if (dummy.banType === "softban") {
          sentBanMsg.edit(`${actions[0]} ${getUser().tag}... (Waiting for unban...)`).catch(rejct);
          guild.unban(getUser()).then(finish).catch(fail);
        } else {
          finish(result);
        }
      }).catch(fail);
  };
  let sent: boolean = false;
  let timeoutRan: boolean = false;
  if (!id) {
    memberToUse.send(
      `You were ${actions[2]} at the server **${escMarkdown(guild.name)}** for the reason of:`, { embed: reasonEmbed },
    ).then(() => {
      if (timeoutRan) {
        return;
      }
      sent = true;
      sentBanMsg.edit(
        `${actions[0]} ${getUser().tag}... (DM Sent. Swinging ban hammer...)`,
      ).catch(rejct);
      executeBan();
    }).catch((err) => {
      rejct(err);
      if (timeoutRan) {
        return;
      }
      sent = true;
      sentBanMsg.edit(`${actions[0]} ${getUser().tag}... (DM Failed. Swinging ban hammer anyway...)`).catch(rejct);
      executeBan();
    });
  } else {
    sent = true;
    executeBan();
  }
  setTimeout(() => {
    if (!sent) {
      timeoutRan = true;
      executeBan();
    }
  }, Time.seconds(2.8));
};
export const ban = new Command({
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
