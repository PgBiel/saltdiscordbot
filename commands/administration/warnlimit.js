const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (
  msg, { prompt, guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms, seePerms },
) {
  const steps = d.db.table("warnsteps").get(guildId);
  if (arrArgs.length < 1) {
    if (perms["warnlimit.get"]) {
      if (!steps || steps.length < 1) {
        return reply(`There are no set warn punishments for this server.`);
      }
      steps.sort((a, b) => a.amount - b.amount);
      let str = "";
      for (const step of steps) {
        str += `At **${step.amount} warns**, the member gets a ${d.Constants.maps.PUNISHMENTS[step.punishment][0]}\
${step.time ? ` for **${new d.Interval(d.durationuncompress(step.time) || d.Interval.minutes(10))}**` : ""}.\n`;
      }
      return send(`Here's the list of the current set warn punishments for this server:\n\n${d._.trim(str)}`, { split: true });
    }
    return reply(`Uh-oh, it seems that you don't have permissions to get warn punishments, so I'm not listing them. \
Try an action (like setting)! (Use the \`help\` command for help.)`);
  }
  const action = arrArgs[0];
  const subArg = arrArgs[1];
  const subSubArg = arrArgs[2];
  const subSubSubArg = arrArgs[3];
  if (!isNaN(Number(action)) || /^get$/i.test(action)) {
    if (!perms["warnlimit.get"]) {
      return reply(`Uh-oh, it seems that you don't have permissions to get warn punishments. \
Sorry ¯\\\\d._(ツ)\\d._/¯ (Try a different action maybe?)`);
    }
    if (/^get$/i.test(action) && (arrArgs.length < 2 || isNaN(subArg)) || isNaN(action)) {
      return reply(`Please tell me which warn limit should I get! `);
    }
    const num = Number(isNaN(action) ? action : subArg);
    const step = steps.find(s => s.amount === num);
    if (!step) return send(`There is no warn punishment for reaching ${num} total warns. :wink:`);
    return send(`Upon reaching ${num} total warns, the member receives a **${step.punishment}**\
${step.time ? ` for **${new d.Interval(d.durationuncompress(step.time) || d.Interval.minutes(10))}**` : ""}.`);
  } else if (/^(?:set|unset|add|remove|clear)$/i.test(action)) {
    if (!seePerms("warnlimit.set", perms, setPerms, { srole: "admin" })) {
      return reply(`Uh-oh, it seems that you don't have permissions to set or unset warn punishments. \
Sorry ¯\\\\d._(ツ)\\d._/¯ (Try a different action maybe?)`);
    }
    if (!/^clear$/i.test(action) && (arrArgs.length < 2 || isNaN(subArg))) {
      return reply(`Please tell me which warn limit should I add/remove!`);
    }
    const num = Number(subArg);
    if (/^(unset|remove)$/i.test(action)) {
      const step = steps.find(s => s.amount === num);
      if (!step) return send(`There is no warn punishment for reaching ${num} total warns. :wink:`);
      await d.db.table("warnsteps").remArr(guildId, step, true);
      return send(`Successfully removed the punishment for reaching **${num}** total warns! :wink:`);
    } else if (/^clear$/i.test(action)) {
      if (steps.length < 1) return send(`There are no warn punishments.`);
      const result = await prompt({
        question: `Are you sure you want to remove ${steps.length < 2 ?
          "the only warn punishment" :
          `all the **${steps.length}** warn punishments`}? Type __y__es or __n__o.`,
        invalidMsg: "__Y__es or __n__o?",
        filter: msg2 => {
          return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
        },
        timeout: d.Time.seconds(15),
      });
      if (!result) return;
      if (/^[nc]/.test(result)) return send("Command cancelled.");
      await d.db.table("warnsteps").setRejct(guildId, []);
      return send(`Successfully removed all warn punishments! :wink:`);
    } else {
      if (arrArgs.length < 3) {
        return reply(`Please tell me which punishment should I give on reaching that limit! \
(Either ban, softban, kick, or mute + minutes muted)`);
      }
      if (num > 25) return reply(`The max warn limit is 25!`);
      if (!/^(?:kick|(?:soft)?ban|mute)$/i.test(subSubArg)) {
        return reply(`The punishment must be either kick, ban, softban or mute (+ minutes muted, default is 10 mins).`);
      }
      let time;
      let timeDefault = false;
      if (isNaN(subSubSubArg)) {
        timeDefault = true;
        time = new d.Interval.minutes(10);
      } else {
        time = new d.Interval.minutes(Number(subSubSubArg));
      }
      const punish = subSubArg.toLowerCase();
      const objToUse = {
        amount: num,
        punishment: punish[0].toLowerCase(),
        time: punish === "mute" ? d.durationcompress(time) : ""
      };
      const step = steps.find(s => s.amount === num);
      if (step) {
        await d.db.table("warnsteps").assign(guildId, { [d.db.table("warnsteps").indexOf(guildId, step)]: objToUse }, true);
      } else {
        await d.db.table("warnsteps").add(guildId, objToUse, true);
      }
      const punishment = subSubArg.toLowerCase() === "mute" ?
      `mute for ${timeDefault ? "10 minutes (default)" : time}`
      : subSubArg.toLowerCase();
      return send(`Successfully set the punishment for reaching **${num}** total warns to **${punishment}**!`);
    }
  }
};

module.exports = new Command({
  func,
  name: "warnlimit",
  perms: { "warnlimit.set": false, "warnlimit.get": true },
  description: `Set or view warn punishments for reaching a certain (or multiple) warn count(s). For a list of them, \
don't specify an action. For the "get" action, you specify a number after it which is the warn count punishment you want to view.\n\
For the "set", "unset", "add" (same as "set") and "remove" (same as "unset") actions, specify a number after it which is the \
warn count punishment to set/unset. That's all you need if unsetting. If setting, specify a punishment after it (one of kick, \
ban, softban, mute). For mute, specify amount of minutes after it; if you don't specify an amount of minutes it defaults to 10. \
Otherwise, the punishment will set.\n\nMax warn count (for punishments) is 20.

For permissions, use the \`warnlimit set\` permission for setting/unsetting and the \`warnlimit get\` permission for \
eeing/listing them. :wink:`,
  example: `{p}warnlimit get 5 (see punishment on 5 warns)\n\
{p}warnlimit set 13 kick (on 13 warns, kick)\n\
{p}warnlimit set 10 mute 15 (on 10 warns, mute for 15 mins)\n\
{p}warnlimit unset 10 (remove punishment on 10 warns)`,
  category: "Administration",
  args: { action: true, "warn count": true, "action args": true, "mute minutes (if setting)": true },
  guildOnly: true
});
