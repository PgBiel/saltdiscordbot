const Command = require("../../classes/command");
const actionLog = require("../../classes/actionlogger");

const func = async function (
  msg, { prompt, guildId, guild, reply, checkRole, author, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms },
) {
  if (!args) return reply(`Please specify an action (or a case number to get)! (See the help command for details.)`);
  const punishments = this.db.table("punishments").get(guildId);
  if (!punishments || punishments.length < 1) return reply(`There are no actions logged on this guild!`);
  const match = args.match(this.Constants.regex.CASE_MATCH);
  let part1, part2, part3;
  if (arrArgs.length === 1) {
    part1 = match[6];
  } else if (arrArgs.length === 2) {
    part1 = match[4];
    part2 = match[5];
  } else {
    part1 = match[1];
    part2 = match[2];
    part3 = match[3];
  }
  const action = part1.toLowerCase();
  let arg;
  if ((part2 === "???" && action === "get") || (part2 && part2.length > 11)) {
    arg = part2;
  } else {
    arg = Number(part2);
  }
  const arg2 = part3;
  const length = punishments.length;
  if (action === "get" || !isNaN(action) || action === "???") {
    if (!perms["case.get"]) return reply(`Missing permission \`cases get\`! :(`);
    if (action === "???" || arg === "???") {
      const spook = await actionLog.embedAction({});
      return reply(`Spooky! :ghost:`, { embed: spook });
    }
    if (isNaN(arg) && isNaN(action)) return reply(`Please specify a case number to get!`);
    if ((arg.length && arg.length > 11) || (action.length && action.length > 11)) return reply(`Invalid case number! \
There ${length === 1 ? "is only 1 case" : `are ${length} cases`}.`);
    const number = Number(isNaN(action) ? arg : action);
    if (number > punishments.length) return reply(`Invalid case number! There ${length === 1 ?
      "is only 1 case" :
      `are ${length} cases`}.`);
    const { case: punish, embed } = await actionLog.fetchCase(number, guild);
    if (!punish) return reply(`Unknown case number! :(`);
    if (punish.deleted) return reply(`The case with that number was deleted! :(`);
    return reply(`Here's Case #${punish.case}:`, { embed });
  } else if (["edit", "delete", "togglethumb"].includes(action)) {
    const permSecondPart = action === "delete" ? "delete" : "edit";
    if (!perms[`case.${permSecondPart}`]) return reply(`Missing permission \`cases ${permSecondPart}\`! :(`);
    if (isNaN(arg)) return reply(`Please specify a case number to modify it!`);
    if (arg.length && arg.length > 11) return reply(`Invalid case number! There ${length === 1 ?
      "is only 1 case" :
      `are ${length} cases`}.`);
    if (arg > punishments.length) return reply(`Invalid case number! There ${length === 1 ?
      "is only 1 case" :
      `are ${length} cases`}.`);
    const { case: punish } = await actionLog.fetchCase(arg, guild);
    if (punish.deleted) return reply(`The case with that number was deleted! :(`);
    const isYours = punish.moderator === author.id;
    if (
      !isYours
      && (setPerms["case.others"] ?
        !perms["case.others"] :
        !checkRole("administrator"))
      ) return reply(`That case is not yours. You need the permission
\`cases others\` or the Administrator saltrole to edit others' cases!`);
    if (action === "delete") {
      const result = await prompt({
        question: `Are you sure you want to delete the case numbered ${arg}?${isYours ? " **It isn't yours.**" : ""} \
This will expire in 15 seconds. Type __y__es or __n__o.`,
        invalidMsg: "__Y__es or __n__o?",
        filter: msg2 => {
          return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
        },
        timeout: this.Time.seconds(15),
      });
      if (!result) {
        return;
      }
      if (/^[nc]/i.test(result)) {
        send("Command cancelled.");
        return;
      }
      try {
        const { case: cResult, message: mResult } = await actionLog.delCase(arg, guild);
        if (!cResult) return reply("Uh oh! Therewas an error deleting the case. Sorry!");
        if (!mResult) return reply(`The case #${arg} was deleted successfully, however its message at Action Logs wasn't. \
If Action Logs are disabled for this guild, you can ignore this.`);
      } catch (err) {
        this.rejct(err);
        return reply("Uh oh! There was an error deleting the case. Sorry!");
      }
      return reply(`Case #${arg} was deleted successfully!`);
    } else {
      if (action === "edit") {
        if (!arg2) return reply(`Please specify a reason to change the case's to!`);
        if (!isYours) {
          const result = await prompt({
            question: `Are you sure you want to edit the reason of the case numbered ${arg}? It isn't yours, and if you do this, \
you will become the author of the case. This will expire in 15 seconds. Type __y__es or __n__o.`,
            invalidMsg: "__Y__es or __n__o?",
            filter: msg2 => {
              return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
            },
            timeout: this.Time.seconds(15),
          });
          if (!result) {
            return;
          }
          if (/^[nc]/i.test(result)) {
            send("Command cancelled.");
            return;
          }
        }
      }
      try {
        const options = {};
        if (action === "edit") {
          options.reason = arg2;
          if (!isYours) {
            options.moderator = author.id;
          }
        } else {
          options.toggleThumbnail = true;
        }
        this.logger.debug("a", arg2);
        const { case: cResult, message: mResult } = await actionLog.editCase(arg, options, guild);
        const { thumbOn } = this.db.table("punishments").get(guildId).find(c => c.case === arg);
        if (!cResult) return reply("Uh oh! There was an error modifying the case. Sorry!");
        if (!mResult) return reply(`Case #${arg} ${action === "edit" ?
          "was modified" :
          ("had its thumbnail toggled " + (thumbOn ? "on" : "off"))} successfully, however its message at Action Logs wasn't able to \
          be modified. If Action Logs are disabled for this guild, you can ignore this.`);
        return reply(`Case #${arg} ${action === "edit" ?
          "was modified successfully" :
          ("successfully had its thumbnail toggled " + (thumbOn ? "on" : "off"))}!`);
      } catch (err) {
        this.rejct(err);
        return reply("Uh oh! There was an error modifying the case. Sorry!");
      }
    }
  } else {
    return reply(`Action must be either \`get\`, \`edit\` or \`delete\`.`);
  }
};

module.exports = new Command({
  func,
  name: "case",
  perms: {"case.get": true, "case.edit": true, "case.delete": true, "case.others": false},
  description: `Get or modify a case. Specify just a number to fetch that case and see it's information. Otherwise, specify an \
action. The actions are listed below. After it, specify a number which will be the case to interact with.

The \`get\` action works pretty much as if you just specified a number: It retrieves a case by the number specified.
The rest of the actions can be only applied to your own cases by default and require a special permission to apply to others. For \
\`edit\` and only it, if you attempt to apply it to someone else's case, you will be prompted for confirmation because you will \
become the punisher.

The \`edit\` action lets you change a case's reason. You must specify the new reason after the case number.

The \`togglethumb\` action lets you toggle if a thumbnail will be displayed on the case's embed or not.

And finally, the \`delete\` action lets you delete a case. You will always be asked for confirmation.

Permissions: \`case \` and the action name. For interacting with others' cases, use \`case others\`.`,
  example: `{p}case 5
{p}case get 5
{p}case edit 10 New reason
{p}case togglethumb 16
{p}case delete 6`,
  category: "Moderation",
  args: {
    "action or case number": false,
    "case number (only when using an action)": true,
    "new reason (only when using edit)": true
  },
  guildOnly: true,
  default: false,
});
