import Command from "../../classes/command";
import {
  db, parseTimeStr, textAbstract, Constants, _, Interval, Time, rejct, Embed, durationdecompress,
  durationcompress, cleanify, paginate, MultiPrompt
} from "../../misc/d";
import { ICleanifyStrictness } from "../../funcs/strings/cleanify";
import { TcmdFunc } from "../../misc/contextType";
import { Question } from "../../classes/multiprompt";
import { TableVals } from "../../misc/tableValues";
import { FunctionAssign } from "../../classes/database";

const func: TcmdFunc<{}> = async function(
  msg, {
    prompt, guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms, seePerm,
    genPromptD, guild
  },
) {
  const words: string[] = await (db.table("wordfilters").get(guildId, []));
  const config = await (db.table("mods").get(guildId, {}));
  if (!args) {
    if (!words || words.length < 1) return reply("There are no words filtered in this server! To manage, see the help command.");
    return reply(`There are ${words.length} words filtered in this server! To manage, see the help command.`);
  }
  let [action, ...irregArg] = arrArgs; // tslint:disable-line:prefer-const
  action = action.toLowerCase();
  const arg = args.replace(new RegExp(`^\\s*${_.escapeRegExp(action)}\\s*`, "i"), "");
  // perms
  const canModify: boolean = await seePerm(
    "wordfilter.modify", perms, setPerms, { srole: "administrator", hperms: "MANAGE_MESSAGES" }
  );
  const canStrict: boolean = await seePerm(
    "wordfilter.strictness", perms, setPerms, { srole: "administrator", hperms: "MANAGE_MESSAGES" }
  );
  const canMessag: boolean = await seePerm(
    "wordfilter.message", perms, setPerms, { srole: "administrator", hperms: "MANAGE_MESSAGES" }
  );
  const canToggle: boolean = await seePerm(
    "wordfilter.toggle", perms, setPerms, { srole: "administrator", hperms: "MANAGE_MESSAGES" }
  );
  const canPunish: boolean = await seePerm(
    "wordfilter.punishment", perms, setPerms, { srole: "administrator", hperms: "MANAGE_GUILD" }
  );
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
  const canActuallyPunish: boolean = canPunish && (canBan || canSoftban || canKick || canWarn || canMute);
  const canDOther: boolean = canStrict || canMessag || canActuallyPunish;
  const availablePunish: string[] = [];
  if (canWarn) availablePunish.push("warn");
  if (canMute) availablePunish.push("mute", "pmute");
  if (canBan) availablePunish.push("ban");
  if (canKick) availablePunish.push("kick");
  if (canSoftban) availablePunish.push("softban");
  // filters
  const filterStrict = (str: string) => {
    if (!/^\d$/.test(str)) return false;
    const num = Number(str);
    return num >= 1 && num <= 5;
  };
  const filterMute = (str: string) => {
    if (/^[^a-z\d]+$/i.test(str)) return false;
    let result;
    try {
      const parsed = parseTimeStr(str.replace(/,|and/ig, ""));
      if (parsed[parseTimeStr.invalid]) return false;
      result = new Interval(Object.entries(parsed));
      return true;
    } catch (err) {
      rejct(err, "[AT MUTE TIME WORDFILTER SETUP]");
      return false;
    }
  };
  const filterPunish = (str: string) => {
    return /none/i.test(str) || availablePunish.includes(str.toLowerCase());
  };
  if (action === "list") { // list filtered words
    if (!perms["wordfilter.list"]) {
      return reply("Missing permission `wordfilter list`! :frowning:");
    }
    if (!words || words.length < 1) return reply(`There are no words filtered in this server!`);
    const pages: string[] = words.length === 1 ?
      [words[0]] :
      paginate(
        words.map(w => textAbstract(w, Math.floor(Constants.numbers.max.chars.DESC / 11))).join(" "),
        10
      );
    const page: number = irregArg &&
      irregArg.length > 0 &&
      irregArg[0].length < Constants.numbers.max.length.PAGE &&
      !isNaN(Number(irregArg)) ?
        Number(irregArg[0]) :
        1;
    if (page > pages.length) return reply(`Invalid page! The max page is ${pages.length}.`);
    if (page < 1) return reply(`Invalid page! Page must be at least 1.`);
    const gen = (page: number) => {
      const embed: Embed = new Embed()
        .setTitle(`List of filtered words`)
        .setColor("RED");
      if (pages.length > 1) embed.setFooter(`Page ${page}/${pages.length} – To change, type ${p}wordfilter list <page>.`);
      let str = "";
      for (const pagee of pages[page - 1].split(" ")) {
        if (!_.trim(pagee)) continue;
        str += `• ${pagee.replace(/_/g, " ")}\n`;
      }
      embed.setDescription(_.trim(str));
      return embed;
    };
    const content: string = words.length === 1 ?
      "Here's the only filtered word in this server:" :
      `Here is a list of all ${words.length} filtered words in this server:`;
    const paginateObj = {
      page,
      maxPage: pages.length,
      usePages: true,
      format: gen,
      pages,
      content
    };
    reply(
      content,
      { embed: gen(page), deletable: true, paginate: paginateObj }
    );
  } else if (["message", "strictness", "punish", "punishment", "enable", "disable", "toggle"].includes(action)) {
    if (!config.filterSetUp) {
      return reply(`The word filter must be set up first! Type \`${p}wordfilter setup\` to do so, if you have permission.`);
    }
    if (["message", "strictness", "punish", "punishment"].includes(action)) {
      if (action === "message") {
        if (!arg) {
          if (!config.filterMessage) return reply("There is no custom message set at the moment!");
          const embed: Embed = new Embed()
            .setTitle("Current Word Filtering Message")
            .setDescription(_.trim(config.filterMessage) || "None");
          if (canMessag) embed.setFooter("To change the message, just specify it with this same command.");
          return reply("Here is the currently set custom message:", { embed, deletable: true });
        }
        if (!canMessag) return reply("Missing permission `wordfilter message`! Could also use this command with the \
Administrator saltrole or the `Manage Messages` Discord permission.");
        await db.table("mods").assign(
          guildId,
          { filterMessage: textAbstract(arg, Constants.numbers.max.chars.MSG - 24) },
          true
        );
        reply("Successfully changed the filtering message!");
      } else if (action === "strictness") {
        if (!arg) {
          return reply(`The current filter strictness is **${(config.filterStrict || 3) + 1}**!`);
        }
        if (!canStrict) return reply("Missing permission `wordfilter strictness`! Could also use this command with the \
Administrator saltrole or the `Manage Messages` Discord permission.");
        if (!filterStrict(arg)) return reply("Please specify a number that is at least 1 and at most 5!");
        await db.table("mods").assign(guildId, { filterStrict: Number(arg) - 1 as ICleanifyStrictness }, true);
        reply(`Successfully set the strictness to ${arg}!`);
      } else if (["punish", "punishment"].includes(action)) {
        if (!arg) {
          const punishUsed: string = config.filterPunishment;
          if (!punishUsed) return reply("There is no set punishment for saying filtered words!");
          let text: string;
          if (punishUsed === "p") {
            text = "permanent mute";
          } else if (punishUsed === "m") {
            text = `mute** for **${new Interval(durationdecompress(config.filterPunishmentMute))}`;
          } else {
            text = Constants.maps.PUNISHMENTS[punishUsed][0];
          }
          return reply(
            `The current punishment for saying filtered words is a **${text}**!`
          );
        }
        if (!canPunish) return reply(`Missing permission \`wordfilter punishment\`! Could also use this with the \
Administrator saltrole or the \`Manage Server\` Discord permission.`);
        const [arg1, ..._arg2] = irregArg;
        const arg2 = _arg2.join(" ");
        if (!canActuallyPunish && arg.toLowerCase() !== "none") return reply(`There is no punishment that both you and me \
have permissions for! Alternatively, you can choose \`none\` to set to none.`);
        if (!filterPunish(arg1)) return reply(
          `Please choose one punishment out of those that both you and me have permission for! Those include: \
${availablePunish.join(", ")}. You can also choose \`none\` for none!`
        );
        const sendPunish = arg1 && !/none/i.test(arg1) ? arg1.charAt(0) : null;
        let time = null;
        if (sendPunish === "m") {
          time = Interval.minutes(10);
          if (_.trim(arg2)) {
            if (!filterMute(arg2)) return reply(
              "Invalid timespan for mute! See help for the mute command for info on time."
            );
            time = new Interval(Object.entries(parseTimeStr(arg2.replace(/,|and/ig, ""))));
          }
        }
        await db.table("mods").assign(guildId, {
          filterPunishment: sendPunish,
          filterPunishmentMute: durationcompress(time)
        });
        reply(
          `Successfully set the punishment for saying a filtered word to **${arg1}**${sendPunish === "m" ?
` for **${time}**` :
""}!`
        );
      }
    } else if (["enable", "disable", "toggle"].includes(action)) {
      if (!canToggle) return reply("Missing permission `wordfilter toggle`! Could also use this command with the \
Administrator saltrole or the `Manage Messages` Discord permission.");
      await db.table("mods").assignF(guildId, {
        filterEnabled: current => action === "toggle" ? !current : action === "enable"
      }, true);
      reply(`Word filtering toggled ${await db.table("mods").prop(guildId, "filterEnabled") ? "on" : "off"} successfully!`);
    }
  } else if (["add", "remove", "set", "clear", "setup", "register"].includes(action)) {
    if (!canModify) {
      return reply("Missing permission `wordfilter modify`! Could also use this with the Administrator saltrole or the \
`Manage Messages` Discord permission.");
    }
    const filterWords = (str: string) => {
      if (typeof str !== "string") return false;
      if (/^[^a-z\d]+$/i.test(str)) return false;
      if (str.length < 3) return false;
      const words: string[] = str.split(/\s*,\s*/).map(str => _.trim(cleanify(str, 3)));
      if (words.length > 75) return false;
      for (const word of words) {
        if (word.length < 3 || word.length > 256) return false;
      }
      return true;
    };
    if (["add", "remove", "set"].includes(action)) {
      if (!arg) {
        return reply(`Please specify words to ${action} (separated by commas)!`);
      }
      if (!config.filterSetUp) return reply(`You must setup word filter first! Type \`${p}wordfilter setup\` to do so.`);
      if (["add", "set"].includes(action)) {
        if (!filterWords(_.trim(arg))) return reply("Please, make sure every word consists of letters and have a minimum \
length of 3 characters and a maximum of 256 characters (**both not including duplicate letters**). Also, please only \
specify up to 75 words.");
        const sendWords: string[] = arg.split(/\s*,\s*/).map(w => cleanify(w, 0));
        if (action === "add") {
          await db.table("wordfilters").addMult(guildId, sendWords, true);
        } else {
          if (words.length > 2) {
            const { res: result } = await prompt({
              question: `Are you sure you want to replace the whole word filtering list? **This cannot be undone.** \
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
          }
          await db.table("wordfilters").set(guildId, sendWords, true);
        }
        return reply(`${action === "add" ? "Added" : "Set"} ${sendWords.length} \
word${sendWords.length === 1 ? "" : "s"} to be filtered successfully!`);
      } else if (action === "remove") {
        if (words.length < 1) return reply("There are no words to remove!");
        const sendWordsUnfiltered: string[] = arg.split(/\s,\s*/).map(w => cleanify(w, 0));
        const sendWords: string[] = sendWordsUnfiltered.filter(w => words.includes(w));
        if (sendWords.length < 1) return reply(`None of those words are filtered!`);
        await db.table("wordfilters").remArrMult(guildId, sendWords, true);
        const diff: number = sendWordsUnfiltered.length - sendWords.length;
        return reply(`Removed ${sendWords.length} word${sendWords.length === 1 ? "" : "s"}!${diff ?
          ` ${diff} of the specified words were ignored due to not being filtered.` :
          ""}`);
      }
    } else if (action === "clear") {
      if (words.length < 1) return reply("There are no words to clear!");
      const { res: result } = await prompt({
        question: `Are you sure you want to clear the whole word filtering list? **This cannot be undone.** \
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
      await db.table("wordfilters").set(guildId, [], true);
      return reply(`Cleared ${words.length < 2 ? "one word" : `all ${words.length} words`} from the filter successfully!`);
    } else {
      const responses: string[] = Array(5);
      const genPrompt = genPromptD({
        timeout: Time.seconds(15),
        array: responses,
        filter: msg2 => !/^[^a-z\d]$/i.test(msg2.content),
        invalidMsg: "Invalid response!",
        branch: (brancher: string, cancelled: boolean, skipped: boolean) => {
          if (cancelled) return "cancel";
          if (skipped) return "next";
          if (typeof brancher === "string") {
            return (brancher === "cancel" || !brancher) ? "cancel" : "next";
          } else {
            return "next";
          }
        },
        cancel: true,
        exec: true,
        goCancelled: true
      });
      if (words.length) {
        const { res: result } = await prompt({
          question: `Are you sure you want to proceed? **Any words you specify will replace the whole current list\
${canDOther ? ", unless you skip the first step" : ""}.** This will expire in 15 seconds. Type __y__es or __n__o.`,
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
      let cancelled = false;
      const multiPrompt = new MultiPrompt( // initial question
        `Now setting up word filter. What words would you like to be filtered? \
Separate words with commas. This will expire in 20 seconds. Type ${canDOther && words.length ? "`skip` to skip and " : ""}\
\`cancel\` to cancel.`,
        genPrompt({
          skip: Boolean(canDOther && words.length),
          invalidMsg: "Please, make sure every word consists of letters and have a minimum length of 3 characters \
and a maximum of 256 characters (**both not including duplicate letters**). Also, please only specify up to 75 words.",
          filter: msg2 => filterWords(msg2.content),
          timeout: Time.seconds(20),
          index: 0
        })
      );

      multiPrompt.addBranch("cancel", "", () => { // cancel branch
        cancelled = true;
      });
      if (canStrict) {
        multiPrompt.addBranch( // if can set strictness, then make the next branch so
          "next",
          `What strictness would you like to set for the word filter (1-5)? Strictness **1** is normal filtering with \
basic replacement (not recommended). Strictness **2** ignores spaces. Strictness **3** ignores duplicated characters. \
Strictness **4** adds a huge replacement character list **(RECOMMENDED)**. Finally, strictness **5** ignores the order of \
letters and can spot words hidden in words, but gives many false positives (not recommended). \
This will expire in 15 seconds. Type \`skip\` to skip${config.filterStrict == null ? " (defaults to 4)" : ""} and \
\`cancel\` to cancel.`,
          genPrompt({
            skip: true,
            invalidMsg: "Please specify a number that is at least 1 and at most 5!",
            filter: msg2 => filterStrict(msg2.content),
            index: 1
          })
        );
        multiPrompt.branch("next"); // go to the next (so we can add cancel branch)
        multiPrompt.addBranch("cancel", "", () => { // cancel
          cancelled = true;
        });
      }
      if (canMessag) {
        multiPrompt.addBranch( // if can set filtering message, then do so
          "next",
          `What message would you like to set as the message sent when someone is caught by the filter? \
This will expire in 20 seconds. Type \`skip\` to skip (defaults to a pre-defined message) and \`cancel\` to cancel.`,
          genPrompt({
            skip: true,
            invalidMsg: "",
            filter: () => true,
            index: 2,
            timeout: Time.seconds(20)
          })
        );
        multiPrompt.branch("next"); // go to the branch we just made to add cancel branch and any following
        multiPrompt.addBranch("cancel", "", () => { // cancel branch
          cancelled = true;
        });
      }
      if (canActuallyPunish) {
        multiPrompt.addBranch( // if can set punishment then do so
          "next",
          `Would you like to set any punishment for reaching the word filter? You have permissions for the following \
punishments, out of all that I have permissions to: ${availablePunish.join(", ")}. This will expire in 15 seconds. \
Type \`skip\` to skip (defaults to none), \`none\` for none and \`cancel\` to cancel.`,
          genPrompt({
            skip: true,
            invalidMsg: "Please choose one punishment out of those that both you and me have permission for!",
            filter: msg2 => filterPunish(msg2.content),
            index: 3
          })
        );
        multiPrompt.branch("next"); // go to the branch we just made to add cancel branch and any following
        multiPrompt.addBranch("cancel", "", () => { // if cancelling
          cancelled = true;
        });

        multiPrompt.addBranch( // this branch is for setting mute time (see the function)
          "next",
          `What time would you like to mute the user for? Specify time in months, weeks, days, hours, minutes and seconds.\
This will expire in 15 seconds. Type \`skip\` to skip (defaults to 10 minutes) and \`cancel\` to cancel.`,
          async (question: Question) => {
            if (responses[3] === "mute") { // if the option chosen for punishment is mute then we set the time
              await genPrompt({
                skip: true,
                invalidMsg: "Please specify a valid timespan!",
                filter: msg2 => filterMute(msg2.content),
                index: 4
              }).apply(question, [question]);
            } else { // else then we just go to the next
              (question.branch("next") || { exec: async () => null } as never).exec();
            }
          }
        );
        multiPrompt.branch("next"); // go to the branch we just created
        multiPrompt.addBranch("cancel", "", () => { // add cancel branch
          cancelled = true;
        });
      }

      multiPrompt.addBranch("next", "", () => { // finish the prompt
        const unavailable: string[] = [];
        if (!canStrict) unavailable.push("Strictness Setting");
        if (!canMessag) unavailable.push("Message Option");
        if (!canPunish) {
          unavailable.push("Punishment");
        } else if (!canActuallyPunish) {
          unavailable.push("Punishment (No permissions for any of the available punishments)");
        }
        reply(`Congratulations! The setup is done. :smiley:${canStrict && canMessag && canActuallyPunish ? "" : `
\nThe following step${unavailable.length > 1 ? "s were" : " was"} skipped due to missing permissions: \
${unavailable.join(", ")}.`}`);
      });
      await (multiPrompt.toFirst().exec()); // go to the first question and execute it to start prompting!
      if (!cancelled) {
        const [wordz, strict, messag, punish, muteTime] = responses; // get the responses
        const sendStrict: ICleanifyStrictness = ( // what strictness to send
          strict ? // if strictness was provided...
            _.clamp(Number(strict) - 1, 0, 4) : // ...then ensure that it is between 0 and 4 (for cleanify).
            (config.filterStrict == null ? 3 : null) // else just default to 3 if none was ever set, otherwise no change
        ) as ICleanifyStrictness;
        const sendWords: string[] = wordz ? // if words were provided...
          wordz.split(/\s*,\s*/).map(w => cleanify(w, 0)) : // then get them and do some really basic cleanifying on them
          null; // else don't change it
        const sendPunish = punish && !/none/i.test(punish) ? // if a punishment was specified, then...
          punish.charAt(0) : // ... get the first letter of it (for Constants punishment). If not...
          null; // ... then leave unchanged
        let sendTime: string; // mute time to send
        if (muteTime) { // (if specified)
          try {
            const parsed = parseTimeStr(muteTime.replace(/,|and/ig, "")); // try to parse it
            if (!parsed[parseTimeStr.invalid]) sendTime = durationcompress(new Interval(Object.entries(parsed)));
            // ^ if is valid
          } catch (err) {
            rejct(err, "[AT MUTE TIME WORDFILTER SETUP SEND]");
          }
        }
        const obj: FunctionAssign<TableVals["mods"]> = {
          filterSetUp: () => true, filterEnabled: enabled => enabled || false
        };
        if (sendStrict != null) obj.filterStrict = () => sendStrict;
        if (messag) obj.filterMessage = () => textAbstract(messag, Constants.numbers.max.chars.MSG - 24);
        if (sendPunish) obj.filterPunishment = () => sendPunish;
        if (sendTime) obj.filterPunishmentMute = () => sendTime;
        try {
          await (db.table("mods").assignF(guildId, obj, true));
          if (sendWords && sendWords.length > 0) await (db.table("wordfilters").set(guildId, sendWords, true));
        } catch (err) {
          rejct(err, "[AT WORDFILTER SETUP SAVE]");
          reply("Oh no! There was an error saving the data. :frowning: Sorry!");
        }
      }
    }
  } else {
    reply("Unknown action! See help command for valid actions.");
  }
};

export const wordfilter = new Command({
  func,
  name: "wordfilter",
  perms: {
    "wordfilter.list": true, "wordfilter.modify": false, "wordfilter.strictness": false, "wordfilter.message": false,
    "wordfilter.punishment": false, "wordfilter.toggle": false, "wordfilter.immune": false,
    kick: { default: false, show: false }, ban: { default: false, show: false },
    warn: { default: false, show: false }, softban: { default: false, show: false },
    mute: { default: false, show: false }
  },
  description: `See the filtered words or modify the word filter. Specify an action after the command to \
show what is being done.
\nFor listing all words filtered, specify \`list\` as the action. You can include a page after it to go to specific pages.
**For setting up the word filter** (You cannot use other actions without setting up first), specify \`setup\` or \`register\`\
 as action.
For modifying the word filter list, you can specify \`add\`, \`remove\` and \`set\` to add, remove and set words \
(respectively), separated by comma. Specify \`clear\` as an action to remove all words.
For setting or viewing the word filter strictness, specify \`strictness\` as the action. If setting, it must be between \
1 and 5.
For setting or viewing the filtering message, specify \`message\` as the action, plus the message if setting.
For setting or viewing the filtering punishment, specify \`punishment\` (or \`punish\`) as the action. If setting, \
also specify a punishment. If you specify mute, specify the time muted as well after it. (Note that both you and the bot \
need to be able to execute said punishment to be able to choose it.)
For toggling the word filtering, specify \`enable\`, \`disable\` or \`toggle\` to enable it, disable it or toggle it, \
respectively.

About permissions: The \`wordfilter modify\` permission lets you use \`add\`/\`set\`/\`remove\`/\`setup\`, the \`wordfilter \
toggle\` permission lets you use \`enable\`/\`disable\`/\`toggle\`, the \`wordfilter immune\` permission makes you immune \
to the word filter and the rest are for their resspective actions.
`,
  subHelps: {
    test: { // TODO: FIX THIS MESS
      description: "This is a test",
      args: { test: true, teste: false },
      example: `{p}{up} {name} BOP-IT`,
      aliases: ["bopit"],
      perms: { "perm.perm": true }
    },
    testad: {
      description: "This is a cool test",
      args: { test: true, teste: false },
      example: `{p}{up} {name} BOP-IT`,
      aliases: ["bopit"],
      perms: { "perm.perm": true },
      useSubTitle: true
    }
  },
  example: `{p}wordfilter list\n\
{p}wordfilter setup\n\
{p}wordfilter set apple, banana, orange\n\
{p}wordfilter remove orange, banana
{p}wordfilter message You have been caught!
{p}wordfilter punish mute 2 minutes
{p}wordfilter strictness 4
{p}wordfilter toggle`,
  category: "Administration",
  args: { action: false, "parameter (or page, if using list)": true, "mute time (if using punish with mute)": true },
  guildOnly: true
});
