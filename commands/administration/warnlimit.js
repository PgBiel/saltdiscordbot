const { Message } = require("discord.js");
const Command = require("../../classes/command");
const { _, db, Time } = require("../../util/deps");

const func = async (
  msg, { guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms },
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
    return reply(`Uh-oh, it seems that you don't have permissions to get warn punishments \
(maybe it was negated from you?). Sorry ¯\\\\_(ツ)\\_/¯`);
  }
  if (!checkRole("mod", member) && !perms.warnlimit) {
    return reply(`Insufficient permissions! To use this command for setting/unsetting warn punishments, you must either have \
the \`Moderator\` SaltRole or a permission overwrite.`);
  }
  const action = arrArgs[0];
  const subArg = arrArgs[1];
  if (!isNaN(Number(action)) || /^get$/i.test(action)) {
    if (!perms["warnlimit.get"]) {
      return reply(`Uh-oh, it seems that you don't have permissions to get warn punishments \
(maybe it was negated from you?). Sorry ¯\\\\_(ツ)\\_/¯ (Try a different action maybe?)`);
    }
    if (/^get$/i.test(action) && arrArgs.length < 2) {
      return reply(`Please tell me which warn limit should I get!`);
    }
    const num = Number(isNaN(Number(action)) ? action : subArg);
    const step = steps.find(s => s.amount === Number(num));
    if (!step) return send(`There is no warn punishment for reaching ${num} total warns. :wink:`);
    return send(`Upon reaching ${num} total warns, the member receives a **${step.punishment}**\
${step.time ? ` for **${new Time(Number(step.time) || Time.minutes(10)).toString()}**` : ""}.`);
  } else if (/^(?:set|unset|add|remove)$/i.test(action)) { /* WIP */ }
};
