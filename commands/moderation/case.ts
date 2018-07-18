import Command from "../../classes/command";
import actionLog, { ICaseEditOptions } from "../../classes/actionlogger";
import { db, Constants, rejct, Time, _, uncompress, logger, Embed } from "../../misc/d";
import { TcmdFunc } from "../../misc/contextType";
import {
  ExtendedMsgOptions, PageGenerator, IProtoSendPaginator, PaginateStructure, DankPagStructure
} from "../../handlerfuncs/senders/proto-send";

const func: TcmdFunc<{}> = async function(
  msg,
  {
    prompt, guildId, guild, reply, checkRole, author, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms,
    seePerm
  }
) {
  if (!args) return reply(`Please specify an action (or a case number to get)! (See the help command for details.)`);
  const punishments = await (db.table("punishments").get(guildId));
  if (!punishments || punishments.length < 1) return reply(`There are no actions logged on this guild!`);
  const nonDelPunishments = punishments.filter(p => !p.deleted);
  if (!nonDelPunishments || nonDelPunishments.length < 1) return reply(`There are no non-deleted actions logged on this guild!`);
  const match = args.match(Constants.regex.CASE_MATCH);
  let part1: string;
  let part2: string;
  let part3: string;
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
  const action: string = part1.toLowerCase();
  const arg: string = part2;
  const argnum: number = Number(arg);
  /* if ((part2 === "???" && action === "get") || (part2 && part2.length > 11)) {
    arg = part2;
  } else {
    arg = Number(part2);
  } */
  const arg2: string = part3;
  const latest: number = (nonDelPunishments[nonDelPunishments.length - 1] || { case: 0 }).case;
  const maxCases: number = Constants.numbers.max.CASES(guild.members.size);
  const sendIt = (content: string, emb: Embed, options: ExtendedMsgOptions & { type?: "reply" | "send" } = {}) => {
    const { type } = options;
    const obj = Object.assign({ embed: emb, autoCatch: false, deletable: true, content }, options);
    return (type === "reply" ? reply : send)(obj).catch(err => [403, 50013].includes(err.code) ?
      send("Please make sure I can send embeds in this channel.") :
      void(rejct(err, "[SEND-IT-CASE]")));
  };
  msg.channel.startTyping();
  if (action === "get" || !isNaN(Number(action)) || action === "???") { // If instead of action a number is specified, or get
    if (!perms["case.get"]) return reply(`Missing permission \`case get\`! :(`);
    if (action === "???" || arg === "???") {
      const spook = await actionLog.embedAction(); // An action embed without anything
      return sendIt(`Spooky! :ghost:`, spook);
    }
    if (isNaN(argnum) && isNaN(Number(action))) return reply(`Please specify a case number to get!`);
    if ((arg.length && arg.length > 11) || (action.length && action.length > 11)) return reply(`Invalid case number! \
The highest non-deleted case number so far is ${latest}.`);
    const number: number = Number(isNaN(Number(action)) ? arg : action);
    if (number > latest) return reply(`Invalid case number! The highest non-deleted case number so far is ${latest}.`);
    const gen = async (num: number) => {
      let { case: punish, embed } = await actionLog.fetchCase(num, guild); // tslint:disable-line:prefer-const
      if (!punish) return {
        isDank: false,
        content: `Unknown case number! :( (Note: On this guild, only the latest ${maxCases} cases are kept stored.)`
      };
      if (punish.deleted) embed = new Embed({
        title: `Action Log #${punish.case}`,
        description: `The case with this number was deleted! :(`
      });
      return {
        isDank: true,
        embed,
        content: `Here's Case #${punish.case}:`
      };
    };
    const generated: string | PaginateStructure = await gen(number);
    const paginate: IProtoSendPaginator = {
      page: number,
      maxPage: _.compact(punishments).reduce((a, p) => p.case > a ? p.case : a, 0),
      usePages: true,
      format: gen,
      content: typeof generated === "string" ? generated : `Here's Case #${number}:`
    };
    return sendIt(
      `Here's Case #${number}:`, ((generated || {}) as DankPagStructure).embed,
      { type: typeof generated === "string" ? "reply" : "send", paginate }
    );
  } else if (["edit", "delete", "togglethumb"].includes(action)) {
    const permSecondPart = action === "delete" ? "delete" : "edit";
    if (!perms[`case.${permSecondPart}`]) return reply(`Missing permission \`case ${permSecondPart}\`! :(`);
    if (isNaN(argnum)) return reply(`Please specify a case number to modify it!`);
    if (arg.length && arg.length > 11) return reply(`Invalid case number! \
The highest non-deleted case number so far is ${latest}.`);
    if (argnum > latest) return reply(`Invalid case number! The highest non-deleted case number so far is ${latest}.`);
    const { case: punish } = await actionLog.fetchCase(argnum, guild);
    if (!punish) return reply(
      `Unknown case number! :frowning: (Note: On this guild, only the latest ${maxCases} cases are kept stored.)`
    );
    if (punish.deleted) return reply(`The case with that number was deleted! :(`);
    const isYours: boolean = uncompress(punish.moderator) === author.id;
    if (
      !isYours && !seePerm("case.others", perms, setPerms, { srole: "admin" })
    ) return reply(`That case is not yours. You need the permission \
\`case others\` or the Administrator saltrole to edit others' cases!`);
    if (action === "delete") {
      const { res: result } = await prompt({
        question: `Are you sure you want to delete the case numbered ${arg}?${isYours ? "" : " **It isn't yours.**"} \
This will expire in 15 seconds. Type __y__es or __n__o.`,
        invalidMsg: "__Y__es or __n__o?",
        filter: msg2 => {
          return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
        },
        timeout: Time.seconds(15)
      });
      if (!result) {
        return;
      }
      if (/^[nc]/i.test(result)) {
        send("Command cancelled.");
        return;
      }
      try {
        const { case: cResult, message: mResult } = await actionLog.delCase(argnum, guild);
        if (!cResult) return reply("Uh oh! There was an error deleting the case. Sorry!");
        if (!mResult) return reply(`The case #${arg} was deleted successfully, however its message at Action Logs wasn't. \
If Action Logs are disabled for this guild, you can ignore this.`);
      } catch (err) {
        rejct(err, "[CASE-DELETE] ");
        return reply("Uh oh! There was an error deleting the case. Sorry!");
      }
      return reply(`Case #${arg} was deleted successfully!`);
    } else {
      if (action === "edit") {
        if (!arg2) return reply(`Please specify a reason to change the case's to!`);
        if (!isYours) {
          const { res: result } = await prompt({
            question: `Are you sure you want to edit the reason of the case numbered ${arg}? **It isn't yours, and if you do \
this, you will become the author of the case.** This will expire in 15 seconds. Type __y__es or __n__o.`,
            invalidMsg: "__Y__es or __n__o?",
            filter: msg2 => {
              return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
            },
            timeout: Time.seconds(15)
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
        const options: ICaseEditOptions = {};
        if (action === "edit") {
          options.reason = arg2;
          if (!isYours) {
            options.moderator = author.id;
          }
        } else {
          options.toggleThumbnail = true;
        }
        logger.debug("a", arg2);
        const { case: cResult, message: mResult } = await actionLog.editCase(argnum, options, guild);
        const { thumbOn } = (await (db.table("punishments").get(guildId))).find(c => c.case === argnum);
        if (!cResult) return reply("Uh oh! There was an error modifying the case. Sorry!");
        if (!mResult) return reply(`Case #${arg} ${action === "edit" ?
          "was modified" :
          ("had its thumbnail toggled " + (thumbOn ? "on" : "off"))} successfully, however its message at Action Logs wasn't \
          able to be modified. If Action Logs are disabled for this guild, you can ignore this.`);
        return reply(`Case #${arg} ${action === "edit" ?
          "was modified successfully" :
          ("successfully had its thumbnail toggled " + (thumbOn ? "on" : "off"))}!`);
      } catch (err) {
        rejct(err);
        return reply("Uh oh! There was an error modifying the case. Sorry!");
      }
    }
  } else {
    return reply(`Action must be either \`get\`, \`edit\`, \`togglethumb\` or \`delete\`.`);
  }
};

export const casecmd = new Command({
  func,
  name: "case",
  perms: {"case.get": true, "case.edit": true, "case.delete": true, "case.others": false},
  description: `Get or modify a case. Specify just a number to fetch that case and see its information. Otherwise, specify an \
action. The actions are listed below. After it, specify a number which will be the case to interact with.

The \`get\` action works pretty much as if you just specified a number: It retrieves a case by the number specified.
The rest of the actions can be only applied to your own cases by default and require a special permission to apply to others.

For the following actions (\`edit\`, \`togglethumb\` and \`delete\`), the permission \`case others\` or the Administrator \
SaltRole will be required to interact with someone else's case.

The \`edit\` action lets you change a case's reason. You must specify the new reason after the case number. Note that, for this \
action, if you change the reason of someone else's case, you will become its punisher, so you are asked for confirmation.

The \`togglethumb\` action lets you toggle if a thumbnail will be displayed on the case's embed or not. Useful for NSFW avatars.

And finally, the \`delete\` action lets you delete a case. You will always be asked for confirmation.

Permissions: \`case get\` for using get; \`case edit\` for using edit and togglethumb; \`case delete\` for deleting. \
For interacting with others' cases, \`case others\`.`,
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
  default: false
});
