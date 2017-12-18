const { Message } = require("discord.js");
const Command = require("../../classes/command");
const { _, db, Time } = require("../../util/deps");

const func = async (
  msg, { guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms },
) => {
  const steps = db.table("warnsteps").get(guildId);
  if (arrArgs.length < 1) {
    if (perms["warnlimit.get"]) {
      if (!steps || steps.length < 1) {
        return reply(`There are no set warn punishments for this server.`);
      }
      let str = "";
      for (const step of steps) {
        str += `At **${step.amount} warns**, the member gets a ${step.punishment}\
${step.time ? ` for **${new Time(Number(step.time) || Time.minutes(10)).toString()}**` : ""}.\n`;
      }
      return send(`Here's the list of the current set warn punishments for this server:\n\n${_.trim(str)}`, { split: true });
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
Sorry ¯\\\\_(ツ)\\_/¯ (Try a different action maybe?)`);
    }
    if (/^get$/i.test(action) && (arrArgs.length < 2 || isNaN(subArg)) || isNaN(action)) {
      return reply(`Please tell me which warn limit should I get! `);
    }
    const num = Number(isNaN(action) ? action : subArg);
    const step = steps.find(s => s.amount === num);
    if (!step) return send(`There is no warn punishment for reaching ${num} total warns. :wink:`);
    return send(`Upon reaching ${num} total warns, the member receives a **${step.punishment}**\
${step.time ? ` for **${new Time(Number(step.time) || Time.minutes(10)).toString()}**` : ""}.`);
  } else if (/^(?:set|unset|add|remove)$/i.test(action)) {
    if ((!setPerms["warnlimit"] && !checkRole("admin", member)) || (setPerms["warnlimit"] && !perms["warnlimit"])) {
      return reply(`Uh-oh, it seems that you don't have permissions to set or unset warn punishments. \
Sorry ¯\\\\_(ツ)\\_/¯ (Try a different action maybe?)`);
    }
    if (arrArgs.length < 2 || isNaN(subArg)) {
      return reply(`Please tell me which warn limit should I add/remove!`);
    }
    const num = Number(subArg);
    if (/^(unset|remove)$/i.test(action)) {
      const step = steps.find(s => s.amount === num);
      if (!step) return send(`There is no warn punishment for reaching ${num} total warns already. :wink:`);
      db.table("warnsteps").remArr(guildId, step);
      return send(`Successfully removed the punishment for reaching **${num}** total warns! :wink:`);
    } else {
      if (arrArgs.length < 3) {
        return reply(`Please tell me which punishment should I give on reaching that limit! \
          (Either ban, softban, kick, or mute + minutes muted)`);
      }
      if (!/^(?:kick|ban|mute)$/i.test(subSubArg)) {
        return reply(`The punishment must be either kick, ban, softban or mute (+ minutes muted, default is 10 mins).`);
      }
      let time;
      let timeDefault = false;
      if (isNaN(subSubSubArg)) {
        timeDefault = true;
        time = new Time(["m", 10]);
      } else {
        time = new Time(["m", Number(subSubSubArg)]);
      }
      const punish = subSubArg.toLowerCase();
      const objToUse = {
        amount: num,
        punishment: punish,
        time: punish === "mute" ? time : 0
      };
      const step = steps.find(s => s.amount === num);
      if (step) {
        db.table("warnsteps").assign(guildId, { [db.table("warnsteps").indexOf(guildId, step)]: objToUse });
      } else {
        db.table("warnsteps").add(guildId, objToUse);
      }
      const punishment = subSubArg.toLowerCase() === "mute" ?
      `mute for ${timeDefault ? "10 minutes (default)" : time.toString()}`
      : subSubArg.toLowerCase();
      return send(`Successfully set the punishment for reaching **${num}** total warns to **${punishment}**!`);
    }
  }
};

module.exports = new Command({
  func,
  name: "warnlimit",
  perms: { "warnlimit": false, "warnlimit.get": true },
  description: `Set or view warn punishments for reaching a certain (or multiple) warn count(s). For the "get" action, \
you specify a number after it which is the warn count punishment you want to view. For a list of them, don't specify an action.\n\
For the "set", "unset", "add" (same as "set") and "remove" (same as "unset") actions, specify a number after it which is the \
warn count punishment to set/unset. That's all you need if unsetting. If setting, specify a punishment after it (one of kick, \
ban, softban, mute). For mute, specify amount of minutes after it; if you don't specify an amount of minutes it defaults to 10. \
Otherwise, the punishment will set.\n\nMax warn count (for punishments) is 20. For permissions, use the \`warnlimit\` permission \
for setting/unsetting and the \`warnlimit get\` permission for seeing/listing them. :wink:`,
  example: `{p}warnlimit get 5 (see punishment on 5 warns)\n\
{p}warnlimit set 13 kick (on 13 warns, kick)\n\
{p}warnlimit set 10 mute 15 (on 10 warns, mute for 15 mins)\n\
{p}warnlimit unset 10 (remove punishment on 10 warns)`,
  category: "Moderation",
  args: { action: true, "warn count": true, "action args": true, "mute minutes (if setting)": true },
  guildOnly: true
});
