// TODO finish this. This is WIP
import { GuildMember, Message, RichEmbed } from "discord.js";
import * as querystring from "querystring";
import { TcmdFunc } from "../../commandHandler";
// import { warns as warnsModel, warnsteps } from "../../sequelize/sequelize";
import { _, bot, Command, Constants, db, logger, Time } from "../../util/deps";
import { escMarkdown, rejct, textAbstract } from "../../util/funcs";

const func: TcmdFunc = async (msg: Message, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  searcher, promptAmbig, author, botmember, member, actionLog, dummy, checkRole,
  setPerms,
}) => {
  let hasPerm = false;
  try {
    if (await checkRole("mod", member)) {
      hasPerm = true;
    }
  } catch (err) {
    logger.error(`At check role: ${err}`);
  }
  if (setPerms.warn) {
    hasPerm = setPerms.warn;
  }
  if (!hasPerm) {
    return reply("You do not have sufficient permissions! :frowning:");
  }
  if (!args) {
    return reply("Please tell me who to warn!");
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
  const sentWarnMsg = await send(`Warning ${memberToUse.user.tag}... (Sending DM...)`);
  const reasonEmbed = new RichEmbed();
  reasonEmbed
    .setColor("AQUA")
    .setDescription(reason || "None")
    .setTimestamp(new Date());
  const finish = () => {
    sentWarnMsg.edit(`Unmuted ${memberToUse.user.tag} successfully.`).catch(rejct);
    actionLog({
      action_desc: `**{target}** was warned`,
      target: memberToUse,
      type: "warn",
      author: member,
      color: "AQUA",
      reason: reason || "None",
    }).catch(rejct);
  };
  const fail = (err: any) => {
    rejct(err);
    sentWarnMsg.edit(`The warn failed! :frowning:`).catch(rejct);
  };
  const executeWarnAsync = async () => {
    try {
      const warns = db.table("warns").get(guild.id, []).filter((u) => u.userid === memberToUse.id);
      let warnSteps = db.table("warnsteps").get(guild.id, []);
      const warnStep = warnSteps.find((step) => step.amount >= warns.length + 1);
      warnSteps = warnSteps.sort((step1, step2) => step2.amount - step1.amount);
      if (warnStep) {
        if (warnStep.amount === warnSteps[0].amount) {
          warns.forEach((warn) => {
            db.table("warns").remArr(guild.id, warn);
          });
        }
        const punishment = warnStep.punishment;
        const timeNum = Number(warnStep.time);
        const time = new Time(isNaN(timeNum) ? 0 : timeNum);
        if (punishment === "kick") {
          const zeDummy = {
            provides: true,
            member: memberToUse,
            time,
          };
          let reasonStr: string;
          if (memberToUse.highestRole.position > botmember.highestRole.position) {
            reasonStr = "that member's highest role is higher in position than mine!";
          } else if (memberToUse.highestRole.position === botmember.highestRole.position) {
            reasonStr = "that member's highest role is the same in position as mine!";
          } else if (memberToUse.id === guild.owner.id) {
            reasonStr = "that member is the owner!";
          } else if (!memberToUse.kickable) {
            reasonStr = "that member is not kickable (being generic here). \
        Check the conditions for being kicked (e.g. must not be owner, etc)!";
          }
          if (reasonStr) {
            return reply(`That member has reached a limit of warnings which implies a **kick**, however \
I am not able to kick them because ${reasonStr}`);
          }
        } else if (punishment === "ban") {
          // WIP
        }
      }
      await db.table("warns").add(guild.id, {
        userid: memberToUse.id,
        reason: reason || "None",
        moderatorid: member.id,
        warnedat: Date.now().toString(),
      }, true);
    } catch (err) {
      fail(err);
    }
  };
  const executeWarn = () => {
    executeWarnAsync().catch((err: any) => { throw err; });
  };
};
