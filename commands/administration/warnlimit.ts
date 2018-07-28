import Command from "../../classes/command";
import { _, db, Interval, durationdecompress, Constants, Time, parseTimeStr, durationcompress } from "../../misc/d";
import { TcmdFunc } from "../../misc/contextType";

const func: TcmdFunc<{}> = async function(
  msg, {
    prompt, guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms, seePerm,
    guild
  },
) {
  const steps = await (db.table("warnsteps").get(guildId));
  if (arrArgs.length < 1) {
    if (perms["warnlimit.get"]) {
      if (!steps || steps.length < 1) {
        return send(`There are no set warn punishments for this server.`);
      }
      steps.sort((a, b) => a.amount - b.amount);
      let str = "";
      for (const step of steps) {
        let timeStr = "";
        if (step.punishment === "p") {
          timeStr = ` for **Eternity**`;
        } else if (step.time) {
          timeStr = ` for **${new Interval(durationdecompress(step.time))}**`;
        }
        str += `At **${step.amount} warns**, the member gets a ${Constants.maps.PUNISHMENTS[step.punishment][0]}\
${timeStr}.\n`;
      }
      return send(
        `Here's the list of the current set warn punishments for this server:\n\n${_.trim(str)}`,
        { split: true, deletable: true }
      );
    }
    return reply(`Uh-oh, it seems that you don't have permissions to get warn punishments, so I'm not listing them. \
Try an action (like setting)! (Use the \`help\` command for help.)`);
  }
  const [action, subArg, subSubArg, ...subSubSubArg] = arrArgs;
  if (!isNaN(Number(action)) || /^get$/i.test(action)) {
    if (!perms["warnlimit.get"]) {
      return reply(`Uh-oh, it seems that you don't have permissions to get warn punishments. \
Sorry ¯\\\\_(ツ)\\_/¯ (Try a fferent action maybe?)`);
    }
    if (/^get$/i.test(action) && (arrArgs.length < 2 || isNaN(Number(subArg)))) {
      return reply(`Please tell me which warn limit should I get! `);
    }
    const num: number = Number(isNaN(Number(action)) ? subArg : action);
    const step = steps.find(s => s.amount === num);
    if (!step) return send(`There is no warn punishment for reaching ${num} total warns. :wink:`);
    return send(`Upon reaching ${num} total warns, the member receives a \
**${Constants.maps.PUNISHMENTS[step.punishment][0]}**${step.time ?
    ` for **${new Interval(durationdecompress(step.time) || Interval.minutes(10))}**` :
    ""}.`);
  } else if (/^(?:set|unset|add|remove|clear)$/i.test(action)) {
    if (!(await seePerm("warnlimit.modify", perms, setPerms, { srole: "admin", hperms: "MANAGE_GUILD" }))) {
      return reply(`Missing permission \`warnlimit modify\`! Could also use this command with the Administrator saltrole \
or the \`Manage Server\` scord permission.`);
    }
    if (!/^clear$/i.test(action) && (arrArgs.length < 2 || isNaN(Number(subArg)))) {
      return reply(`Please tell me which warn limit should I add/remove!`);
    }
    const num: number = Number(subArg);
    if (/^(unset|remove)$/i.test(action)) {
      const step = steps.find(s => s.amount === num);
      if (!step) return send(`There is no warn punishment for reaching ${num} total warns. :wink:`);
      await (db.table("warnsteps").remArr(guildId, step, true));
      return send(`Successfully removed the punishment for reaching **${num}** total warns! :wink:`);
    } else if (/^clear$/i.test(action)) {
      if (steps.length < 1) return send(`There are no warn punishments.`);
      const { res: result } = await prompt({
        question: `Are you sure you want to remove ${steps.length < 2 ?
          "the only warn punishment" :
          `all the **${steps.length}** warn punishments`}? Type __y__es or __n__o.`,
        invalidMsg: "__Y__es or __n__o?",
        filter: msg2 => {
          return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
        },
        timeout: Time.seconds(15)
      });
      if (!result) return;
      if (/^[nc]/.test(result)) return send("Command cancelled.");
      await (db.table("warnsteps").set(guildId, [], true));
      return send(`Successfully removed all warn punishments! :wink:`);
    } else {
      const canBan: boolean = await seePerm(
        "ban", perms, setPerms, { hperms: "BAN_MEMBERS" }
      ) && guild.me.hasPermission(["BAN_MEMBERS"]);
      const canSoftban: boolean = await seePerm(
        "softban", perms, setPerms, { hperms: "BAN_MEMBERS" }
      ) && guild.me.hasPermission(["BAN_MEMBERS"]);
      const canKick: boolean = await seePerm(
        "kick", perms, setPerms, { hperms: "KICK_MEMBERS" }
      ) && guild.me.hasPermission(["KICK_MEMBERS"]);
      const canWarn: boolean = await seePerm(
        "warn", perms, setPerms, { srole: "moderator", hperms: "MANAGE_ROLES" }
      ) && guild.me.hasPermission(["BAN_MEMBERS"]);
      const canMute: boolean = await seePerm(
        "mute", perms, setPerms, { srole: "moderator", hperms: "MANAGE_ROLES" }
      ) && guild.me.hasPermission(["MANAGE_ROLES", "MANAGE_CHANNELS"]);
      const canActuallyPunish: boolean = canBan || canSoftban || canKick || canWarn || canMute;
      const availablePunish: string[] = [];
      if (canWarn) availablePunish.push("warn");
      if (canMute) availablePunish.push("mute", "pmute");
      if (canBan) availablePunish.push("ban");
      if (canKick) availablePunish.push("kick");
      if (canSoftban) availablePunish.push("softban");
      if (arrArgs.length < 3) {
        return reply(`Please tell me which punishment should I give on reaching that limit! \
(Either ban, softban, kick, or mute + minutes muted)`);
      }
      if (availablePunish.length < 1) return reply(`There is no punishment that both you and the bot have permission to \
do! (See their individual help commands for permissions)`);
      if (num > 25) return reply(`The max warn limit is 25!`);
      if (!availablePunish.includes(subSubArg.toLowerCase())) {
        return reply(`The punishment must be one of those that both you and the bot have permission to! Those include: \
${availablePunish.join(", ")}.`);
      }
      let time: Interval = Interval.minutes(10);
      let timeDefault = true;
      const timeArg = (subSubSubArg || []).join(" ");
      if (timeArg) {
        timeDefault = false;
        if (!isNaN(Number(timeArg))) {
          time = Interval.minutes(Number(timeArg));
        } else {
          const parsedTime = parseTimeStr(timeArg.replace(/,|and/ig, ""));
          if (parsedTime[parseTimeStr.invalid]) {
            timeDefault = true;
            time = Interval.minutes(10);
          } else {
            time = new Interval(Object.entries(parsedTime));
          }
        }
        if (!time.time) {
          timeDefault = true;
          time = Interval.minutes(10);
        }
      }
      const punish: string = subSubArg.toLowerCase();
      const objToUse = {
        amount: num,
        punishment: punish[0].toLowerCase() as any, // to avoid the punishment requirement
        time: punish === "mute" ? durationcompress(time) : ""
      };
      const step = steps.find(s => s.amount === num);
      if (step) {
        await (db.table("warnsteps").assign(guildId, { [await (db.table("warnsteps").indexOf(guildId, step))]: objToUse }, true));
      } else {
        await (db.table("warnsteps").add(guildId, objToUse, true));
      }
      let punishment: string;
      if (subSubArg.toLowerCase() === "mute") {
        punishment = `mute for ${timeDefault ? "10 minutes (default)" : time}`;
      } else if (subSubArg.toLowerCase() === "pmute") {
        punishment = `permanent mute`;
      } else {
        punishment = subSubArg.toLowerCase();
      }
      return send(`Successfully set the punishment for reaching **${num}** total warns to **${punishment}**!`);
    }
  } else {
    return reply(`Unknown action! See the help command for details.`);
  }
};

export const warnlimit = new Command({
  func,
  name: "warnlimit",
  perms: { "warnlimit.modify": false, "warnlimit.get": true, kick: { default: false, show: false },
  ban: { default: false, show: false }, warn: { default: false, show: false },
  softban: { default: false, show: false }, mute: { default: false, show: false } },
  description: `Set or view warn punishments for reaching a certain (or multiple) warn count(s). For a list of them, \
don't specify an action.

The list of actions is at the field Subpages below. Use \`{p}help warnlimit <action>\` to view info and permissions.`,
  example: `{p}warnlimit get 5 (see punishment on 5 warns)\n\
{p}warnlimit set 13 kick (on 13 warns, kick)\n\
{p}warnlimit set 10 mute 15 (on 10 warns, mute for 15 mins)\n\
{p}warnlimit unset 10 (remove punishment on 10 warns)`,
  category: "Administration",
  args: {
    action: true, "warn count": true, "punishment (if setting)": true, "mute minutes (if setting temporary mute)": true
  },
  guildOnly: true,
  aliases: {
    setwarns: {}
  },
  subHelps: {
    get: {
      description: "View info about a specific warn limit. Specify the number of the warn limit to view it.",
      args: { number: false },
      example: `{p}{up} {name} 5`,
      perms: { "warnlimit.get": true }
    },
    set: {
      description: `Set a warn limit. Just specify the number of warns required to reach it, and the punishment for reaching it.

**Valid Punishments:**
- Warn (Requires permission \`warn\`, Moderator saltrole or Discord perm \`Manage Roles\`);
- Mute & Pmute (Requires permission \`mute\`, Moderator saltrole or Discord perm \`Manage Roles\`);
   • **Note:** Specify amount of minutes if using \`mute\`.
- Kick (Requires permission \`kick\` or Discord perm \`Kick Members\`);
- Ban (Requires permission \`ban\` or Discord perm \`Ban Members\`);
- Softban (Requires permission \`softban\` or Discord perm \`Ban Members\`).

**Note:** You may also have the Administrator saltrole or \`Manage Server\` Discord perm to use this subcommand.`,
      args: { limit: false, punishment: false, "minutes to mute for [if using mute]": true },
      example: `{p}{up} {name} set 13 kick
      {p}{up} {name} set 10 mute 15
      {p}{up} {name} set 5 softban`,
      perms: { "warnlimit.modify": false, ban: false, kick: false, softban: false, mute: false, warn: false },
      aliases: ["add"]
    },
    unset: {
      description: "Removes a warn limit.\n\n**Note:** You may also have the Administrator saltrole or \
\`Manage Server\` Discord perm to use this subcommand.",
      args: { number: false },
      example: `{p}{up} {name} 10`,
      perms: { "warnlimit.modify": false },
      aliases: ["remove"]
    }
  }
});
