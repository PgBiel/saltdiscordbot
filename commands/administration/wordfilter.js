const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (
  msg, {
    prompt, guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms, seePerm,
    genPromptD, guild
  },
) {
  const words = await (d.db.table("wordfilters").get(guildId, []));
  const config = await (d.db.table("mods").get(guildId, {}));
  if (!args) {
    if (!words || words.length < 1) return reply("There are no words filtered in this server! To manage, see the help command.");
    return reply(`There are ${words.length} words filtered in this server! To manage, see the help command.`);
  }
  let [action, ...irregArg] = arrArgs;
  action = action.toLowerCase();
  const arg = args.replace(new RegExp(`^\\s*${d._.escapeRegExp(action)}\\s*`, "i"), "");
  const canModify = seePerm("wordfilter.modify", perms, setPerms, { srole: "Administrator", hperms: "MANAGE_MESSAGES" });
  const canStrict = seePerm("wordfilter.strictness", perms, setPerms, { srole: "Administrator", hperms: "MANAGE_MESSAGES" });
  const canMessag = seePerm("wordfilter.message", perms, setPerms, { srole: "Administrator", hperms: "MANAGE_MESSAGES" });
  const canToggle = seePerm("wordfilter.toggle", perms, setPerms, { srole: "Administrator", hperms: "MANAGE_MESSAGES" });
  const canPunish = seePerm("wordfilter.punishment", perms, setPerms, { srole: "Administrator", hperms: "MANAGE_GUILD" });
  const canBan = seePerm("ban", perms, setPerms, { hperms: "BAN_MEMBERS" }) && guild.me.hasPermission(["BAN_MEMBERS"]);
  const canSoftban = seePerm("softban", perms, setPerms, { hperms: "BAN_MEMBERS" }) && guild.me.hasPermission(["BAN_MEMBERS"]);
  const canKick = seePerm("kick", perms, setPerms, { hperms: "KICK_MEMBERS" }) && guild.me.hasPermission(["KICK_MEMBERS"]);
  const canWarn = seePerm("warn", perms, setPerms, { srole: "Moderator", hperms: "MANAGE_ROLES" }) && guild.me.hasPermission(["BAN_MEMBERS"]);
  const canMute = seePerm("mute", perms, setPerms, { srole: "Moderator", hperms: "MANAGE_ROLES" }) && guild.me.hasPermission(["MANAGE_ROLES", "MANAGE_CHANNELS"]);
  const canActuallyPunish = canPunish && (canBan || canSoftban || canKick || canWarn || canMute);
  const canDOther = canStrict || canMessag || canActuallyPunish;
  const filterStrict = str => {
    if (!/^\d$/.test(str)) return false;
    const num = Number(str);
    return num >= 1 && num <= 5;
  };
  const filterMute = str => {
    if (/^[^a-z\d]+$/i.test(str)) return false;
    let result;
    try {
      const parsed = d.parseTimeStr(str.replace(/,|and/ig, ""));
      if (parsed[d.parseTimeStr.invalid]) return false;
      result = new d.Interval(Object.entries(parsed));
      return true;
    } catch(err) {
      d.rejct(err, "[AT MUTE TIME WORDFILTER SETUP]");
      return false;
    }
  };
  const availablePunish = [];
  if (canWarn) availablePunish.push("warn");
  if (canMute) availablePunish.push("mute", "pmute");
  if (canBan) availablePunish.push("ban");
  if (canKick) availablePunish.push("kick");
  if (canSoftban) availablePunish.push("softban");
  const filterPunish = str => {
    return /none/i.test(str) || availablePunish.includes(str.toLowerCase());
  };
  if (action === "list") {
    if (!perms["wordfilter.list"]) {
      return reply("Missing permission `wordfilter list`! :frowning:");
    }
    if (!words || words.length < 1) return reply(`There are no words filtered in this server!`);
    const pages = words.length === 1 ?
      [words[0]] :
      d.paginate(
        words.map(w => d.textAbstract(w, Math.floor(d.Constants.numbers.MAX_DESC_CHARS / 11))).join(" "),
        10
      );
    const page = irregArg &&
      irregArg.length > 0 &&
      irregArg[0].length < d.Constants.numbers.MAX_PAGE_LENGTH &&
      !isNaN(irregArg) ?
        Number(irregArg[0]) :
        1;
    if (page > pages.length) return reply(`Invalid page! The max page is ${pages.length}.`);
    if (page < 1) return reply(`Invalid page! Page must be at least 1.`);
    const embed = new d.Embed()
      .setTitle(`List of filtered words - Page ${page}/${pages.length}`)
      .setColor("RED");
    if (pages.length > 1) embed.setFooter(`To go to a certain page, type ${p}wordfilter list <page>.`);
    let str = "";
    for (const pagee of pages[page - 1].split(" ")) {
      if (!d._.trim(pagee)) continue;
      str += `• ${pagee.replace(/_/g, " ")}\n`;
    }
    embed.setDescription(d._.trim(str));
    reply(
      words.length === 1 ?
        "Here's the only filtered word in this server:" :
        `Here is a list of all ${words.length} filtered words in this server:`,
      { embed }
    );
  } else if (["message", "strictness", "punish", "punishment", "enable", "disable", "toggle"].includes(action)) {
    if (!config.filterSetUp) {
      return reply(`The word filter must be set up first! Type \`${p}wordfilter setup\` to do so, if you have permission.`);
    }
    if (["message", "strictness", "punish", "punishment"].includes(action)) {
      if (!arg) {
        return reply(`Please specify what to set the ${action === "punish" ? "punishment" : action} to!`);
      }
      if (action === "message") {
        if (!canMessag) return reply("Missing permission `wordfilter message`! Could also use this command with the \
Administrator saltrole or the `Manage Messages` Discord permission.");
        await d.db.table("mods").assign(
          guildId,
          { filterMessage: d.textAbstract(arg, d.Constants.numbers.MAX_MSG_CHARS - 24) },
          true
        );
        reply("Successfully changed the filtering message!");
      } else if (action === "strictness") {
        if (!canStrict) return reply("Missing permission `wordfilter strictness`! Could also use this command with the \
Administrator saltrole or the `Manage Messages` Discord permission.");
        if (!filterStrict(arg)) return reply("Please specify a number that is at least 1 and at most 5!");
        await d.db.table("mods").assign(guildId, { filterStrict: Number(arg) - 1 }, true);
        reply(`Successfully set the strictness to ${arg}!`);
      } else if (["punish", "punishment"].includes(action)) {
        if (!canPunish) return reply(`Missing permission \`wordfilter punishment\`! Could also use this with the \
Administrator saltrole or the \`Manage Server\` Discord permission.`);
        const [arg1, ...arg2] = irregArg;
        if (!canActuallyPunish && arg.toLowerCase() !== "none") return reply(`There is no punishment that both you and me \
have permissions for! Alternatively, you can choose \`none\` to set to none.`);
        if (!filterPunish(arg1)) return reply(
          `Please choose one punishment out of those that both you and me have permission for! Those include: \
${availablePunish.join(", ")}. You can also choose \`none\` for none!`
        );
        const sendPunish = arg1 && !/none/i.test(arg1) ? arg1.charAt(0) : null;
        let time = null;
        if (sendPunish === "m") {
          time = d.Interval.minutes(10);
          if (arg2) {
            if (!filterMute(arg2)) return reply(
              "Invalid timespan for mute! See help for the mute command for info on time."
            );
            time = new d.Interval(Object.entries(d.parseTimeStr(arg2.replace(/,|and/ig, ""))));
          }
        }
        await d.db.table("mods").assign(guildId, {
          filterPunishment: sendPunish,
          filterPunishmentMute: d.durationcompress(time)
        });
        reply(
          `Successfully set the punishment for saying a filtered word to **${arg1}**${sendPunish === "m" ?
` for **${time}**` :
""}`
        );
      }
    } else if (["enable", "disable", "toggle"].includes(action)) {
      if (!canToggle) return reply("Missing permission `wordfilter toggle`! Could also use this command with the \
Administrator saltrole or the `Manage Messages` Discord permission.");
      await d.db.table("mods").assignF(guildId, {
        filterEnabled: current => action === "toggle" ? !current : action === "enable"
      }, true);
      reply(`Word filtering toggled ${await d.db.table("mods").prop(guildId, "filterEnabled") ? "on" : "off"} successfully!`);
    }
  } else if (["add", "remove", "set", "clear", "setup", "register"].includes(action)) {
    if (!canModify) {
      return reply("Missing permission `wordfilter modify`! Could also use this with the Administrator saltrole or the \
`Manage Messages` Discord permission.");
    }
    const filterWords = str => {
      if (typeof str !== "string") return false;
      if (/^[^a-z\d]+$/i.test(str)) return false;
      if (str.length < 3) return false;
      const words = str.split(/\s*,\s*/).map(str => d._.trim(d.cleanify(str, 3)));
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
        if (!filterWords(d._.trim(arg))) return reply("Please, make sure every word consists of letters and have a minimum \
length of 3 characters and a maximum of 256 characters (**both not including duplicate letters**). Also, please only \
specify up to 75 words.");
        const sendWords = arg.split(/\s*,\s*/).map(w => d.cleanify(w, 0));
        if (action === "add") {
          await d.db.table("wordfilters").addMult(guildId, sendWords, true);
        } else {
          await d.db.table("wordfilters").setRejct(guildId, sendWords);
        }
        return reply(`${action === "add" ? "Added" : "Set"} ${sendWords.length} \
word${sendWords.length === 1 ? "" : "s"} to be filtered successfully!`);
      } else if (action === "remove") {
        if (words.length < 1) return reply("There are no words to remove!");
        const sendWordsUnfiltered = arg.split(/\s,\s*/).map(w => d.cleanify(w, 0));
        const sendWords = sendWordsUnfiltered.filter(w => words.includes(w));
        if (sendWords.length < 1) return reply(`None of those words are filtered!`);
        await d.db.table("wordfilters").remArrMult(guildId, sendWords, true);
        const diff = sendWordsUnfiltered.length - sendWords.length;
        return reply(`Removed ${sendWords.length} word${sendWords.length === 1 ? "" : "s"}!${diff ?
          ` ${diff} words were ignored due to not being filtered.` :
          ""}`);
      }
    } else if (action === "clear") {
      if (words.length < 1) return reply("There are no words to clear!");
      const result = await prompt({
        question: `Are you sure you want to clear the whole word filtering list? **This cannot be undone.** \
This will expire in 15 seconds. Type __y__es or __n__o.`,
        invalidMsg: "__Y__es or __n__o?",
        filter: msg2 => {
          return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
        },
        timeout: d.Time.seconds(15)
      });
      if (!result) {
        return;
      }
      if (/^[nc]/i.test(result)) {
        send("Command cancelled.");
        return;
      }
      await d.db.table("wordfilters").setRejct(guildId, []);
      return reply(`Cleared ${words.length < 2 ? "one word" : `all ${words.length} words`} from the filter successfully!`);
    } else {
      const responses = Array(5);
      const genPrompt = genPromptD({
        timeout: d.Time.seconds(15),
        array: responses,
        filter: msg2 => !/^[^a-z\d]$/i.test(msg2.content),
        invalidMsg: "Invalid response!",
        branch: (brancher, cancelled, skipped) => {
          if (cancelled) return "cancel";
          if (skipped) return "next";
          if (typeof brancher === "string") {
            return (brancher === "cancel" || !brancher) ? "cancel" : "next";
          } else if (typeof brancher.content === "string") {
            return (brancher.content === "cancel" || !brancher.content) ? "cancel" : "next";
          } else {
            return "next";
          }
        },
        cancel: true,
        exec: true,
        goCancelled: true
      });
      if (words.length) {
        const result = await prompt({
          question: `Are you sure you want to proceed? **Any words you specify will replace the whole current list\
${canDOther ? ", unless you skip the first step" : ""}.** This will expire in 15 seconds. Type __y__es or __n__o.`,
          invalidMsg: "__Y__es or __n__o?",
          filter: msg2 => {
            return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
          },
          timeout: d.Time.seconds(15)
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
      const multiPrompt = new d.MultiPrompt(
        `Now setting up word filter. What words would you like to be filtered? \
Separate words with commas. This will expire in 20 seconds. Type ${canDOther && words.length ? "`skip` to skip and " : ""}\
\`cancel\` to cancel.`,
        genPrompt({
          skip: canDOther && words.length,
          invalidMsg: "Please, make sure every word consists of letters and have a minimum length of 3 characters \
and a maximum of 256 characters (**both not including duplicate letters**). Also, please only specify up to 75 words.",
          filter: msg2 => filterWords(msg2.content),
          timeout: d.Time.seconds(20),
          index: 0
        })
      );
      multiPrompt.addBranch("cancel", "", () => {
        cancelled = true;
      });
      if (canStrict) {
        multiPrompt.addBranch(
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
        multiPrompt.branch("next");
        multiPrompt.addBranch("cancel", "", () => {
          cancelled = true;
        });
      }
      if (canMessag) {
        multiPrompt.addBranch(
          "next",
          `What message would you like to set as the message sent when someone is caught by the filter? \
This will expire in 20 seconds. Type \`skip\` to skip (defaults to a pre-defined message) and \`cancel\` to cancel.`,
          genPrompt({
            skip: true,
            invalidMsg: "",
            filter: () => true,
            index: 2,
            timeout: d.Time.seconds(20)
          })
        );
        multiPrompt.branch("next");
        multiPrompt.addBranch("cancel", "", () => {
          cancelled = true;
        });
      }
      if (canActuallyPunish) {
        multiPrompt.addBranch(
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
        multiPrompt.branch("next");
        multiPrompt.addBranch("cancel", "", () => {
          cancelled = true;
        });

        multiPrompt.addBranch(
          "next",
          `What time would you like to mute the user for? Specify time in months, weeks, days, hours, minutes and seconds.\
This will expire in 15 seconds. Type \`skip\` to skip (defaults to 10 minutes) and \`cancel\` to cancel.`,
          async question => {
            if (responses[3] === "mute") {
              await genPrompt({
                skip: true,
                invalidMsg: "Please specify a valid timespan!",
                filter: msg2 => filterMute(msg2.content),
                index: 4
              }).apply(question, [question]);
            } else {
              (question.branch("next") || { exec: async _ => _ }).exec();
            }
          }
        );
        multiPrompt.branch("next");
        multiPrompt.addBranch("cancel", "", () => {
          cancelled = true;
        });
      }
      multiPrompt.addBranch("next", "", () => {
        const unavailable = [];
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
      await (multiPrompt.toFirst().exec());
      if (!cancelled) {
        const [wordz, strict, messag, punish, muteTime] = responses;
        const sendStrict = strict ? d._.clamp(Number(strict) - 1, 0, 4) : (config.filterStrict == null ? 3 : null);
        const sendWords = wordz ?
          wordz.split(/\s*,\s*/).map(w => d.cleanify(w, 0)) :
          null;
        const sendPunish = punish && !/none/i.test(punish) ? punish.charAt(0) : null;
        let sendTime;
        if (muteTime) {
          try {
            const parsed = d.parseTimeStr(muteTime.replace(/,|and/ig, ""));
            if (!parsed[d.parseTimeStr.invalid]) sendTime = d.durationcompress(new d.Interval(Object.entries(parsed)));
          } catch(err) {
            d.rejct(err, "[AT MUTE TIME WORDFILTER SETUP SEND]");
          }
        }
        const obj = { filterSetUp: () => true, filterEnabled: enabled => enabled || false };
        if (sendStrict != null) obj.filterStrict = () => sendStrict;
        if (messag) obj.filterMessage = () => d.textAbstract(messag, d.Constants.numbers.MAX_MSG_CHARS - 24);
        if (sendPunish) obj.filterPunishment = () => sendPunish;
        if (sendTime) obj.filterPunishmentMute = () => sendTime;
        try {
          await (d.db.table("mods").assignF(guildId, obj, true));
          if (sendWords && sendWords.length > 0) await (d.db.table("wordfilters").setRejct(guildId, sendWords));
        } catch (err) {
          d.rejct(err, "[AT WORDFILTER SETUP SAVE]");
          reply("Oh no! There was an error saving the data. :frowning: Sorry!");
        }
      }
    }
  } else {
    reply("Unknown action! See help command for valid actions.");
  }
};

module.exports = new Command({
  func,
  name: "wordfilter",
  perms: {
    "wordfilter.list": true, "wordfilter.modify": false, "wordfilter.strictness": false, "wordfilter.message": false,
    "wordfilter.punishment": false, "wordfilter.toggle": false, "wordfilter.immune": false,
    "kick": { default: false, show: false }, "ban": { default: false, show: false },
    "warn": { default: false, show: false }, "softban": { default: false, show: false },
    "mute": { default: false, show: false }
  },
  description: `See the filtered words or modify the word filter. Specify an action after the command to \
show what is being done.
\nFor listing all words filtered, specify \`list\` as the action. You can include a page after it to go to specific pages.
**For setting up the word filter** (You cannot use other actions without setting up first), specify \`setup\` or \`register\`\
 as action.
For modifying the word filter list, you can specify \`add\`, \`remove\` and \`set\` to add, remove and set words \
(respectively), separated by comma. Specify \`clear\` as an action to remove all words.
For setting the word filter strictness, specify \`strictness\` as the action. It must be between 1 and 5.
For setting the filtering message, specify \`message\` as the action.
For setting the filtering punishment, specify \`punishment\` (or \`punish\`) as the action, plus a punishment. If you \
specify mute, specify the time muted as well after it. (Note that both you and the bot need to be able to execute said \
punishment to be able to choose it.)
For toggling the word filtering, specify \`enable\`, \`disable\` or \`toggle\` to enable it, disable it or toggle it, \
respectively.

About permissions: The \`wordfilter modify\` permission lets you use \`add\`/\`set\`/\`remove\`/\`setup\`, the \`wordfilter \
toggle\` permission lets you use \`enable\`/\`disable\`/\`toggle\`, the \`wordfilter immune\` permission makes you immune \
to the word filter and the rest are for their respective actions.
`,
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