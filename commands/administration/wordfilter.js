const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (
  msg, {
    prompt, guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms, seePerm,
    genPromptD
  },
) {
  const words = await (d.db.table("wordfilters").get(guildId, []));
  const config = await (d.db.table("mods").get(guildId, {}));
  if (!args) {
    if (!words || words.length < 1) return reply("There are no words filtered in this server! To manage, see the help command.");
    return reply(`There are ${words.length} words filtered in this server! To manage, see the help command.`);
  }
  let [action] = arrArgs;
  action = action.toLowerCase();
  const arg = args.replace(new RegExp(`^\\s*${d._.escapeRegExp(action)}\\s*`, "i"), "");
  const canModify = seePerm("wordfilter.modify", perms, setPerms, { srole: "Administrator", hperms: "MANAGE_MESSAGES" });
  const canStrict = seePerm("wordfilter.strictness", perms, setPerms, { srole: "Administrator", hperms: "MANAGE_MESSAGES" });
  const canMessag = seePerm("wordfilter.message", perms, setPerms, { srole: "Administrator", hperms: "MANAGE_MESSAGES" });
  const canPunish = seePerm("wordfilter.punishment", perms, setPerms, { srole: "Administrator", hperms: "MANAGE_GUILD" });
  const canBan = seePerm("ban", perms, setPerms, { hperms: "BAN_MEMBERS" });
  const canSoftban = seePerm("softban", perms, setPerms, { hperms: "BAN_MEMBERS" });
  const canKick = seePerm("kick", perms, setPerms, { hperms: "KICK_MEMBERS" });
  const canWarn = seePerm("warn", perms, setPerms, { srole: "Moderator", hperms: "MANAGE_ROLES" });
  const canMute = seePerm("mute", perms, setPerms, { srole: "Moderator", hperms: "MANAGE_ROLES" });
  const canActuallyPunish = canPunish && (canBan || canSoftban || canKick || canWarn || canMute);
  const canDOther = canStrict || canMessag || canActuallyPunish;
  if (action === "list") {
    // wip
  } else {
    if (!canModify) {
      return reply("Missing permission `wordfilter modify`! Could also use this with the Administrator saltrole or the \
`Manage Messages` Discord permission.");
    }
    if (["setup", "register"].includes(action)) {
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
            return brancher === "cancel" || !brancher ? "cancel" : "next";
          } else if (typeof brancher.content === "string") {
            return brancher.content === "cancel" || !brancher.content ? "cancel" : "next";
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
(**not including duplicate letters**).",
          filter: msg2 => {
            if (/^[^a-z\d]+$/i.test(msg2.content)) return false;
            if (msg2.content.length < 3) return false;
            const words = msg2.content.split(/\s*,\s*/).map(str => d._.trim(d.cleanify(str, 3)));
            for (const word of words) {
              if (word.length < 3) return false;
            }
            return true;
          },
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
            filter: msg2 => {
              if (!/^\d$/.test(msg2.content)) return false;
              const num = Number(msg2.content);
              return num >= 1 && num <= 5;
            },
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
        const available = [];
        if (canWarn) available.push("warn");
        if (canMute) available.push("mute", "pmute");
        if (canBan) available.push("ban");
        if (canKick) available.push("kick");
        if (canSoftban) available.push("softban");
        multiPrompt.addBranch(
          "next",
          `Would you like to set any punishment for reaching the word filter? You have permissions for the following: \
${available.join(", ")}. This will expire in 15 seconds. Type \`skip\` to skip (defaults to none) and \`cancel\` to cancel.`,
          genPrompt({
            skip: true,
            invalidMsg: "Please choose one punishment out of those that you have permission for!",
            filter: msg2 => available.includes(msg2.content.toLowerCase()),
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
                filter: msg2 => {
                  if (/^[^a-z\d]+$/i.test(msg2.content)) return false;
                  let result;
                  try {
                    const parsed = d.parseTimeStr(msg2.content.replace(/,|and/ig, ""));
                    if (parsed[d.parseTimeStr.invalid]) return false;
                    result = new d.Interval(Object.entries(parsed));
                    return true;
                  } catch(err) {
                    d.rejct(err, "[AT MUTE TIME WORDFILTER SETUP]");
                    return false;
                  }
                },
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
        const sendStrict = strict ? d._.clamp(Number(strict), 0, 4) : (config.filterStrict == null ? 3 : null);
        const sendWords = wordz ? wordz.split(/\s*,\s*/).map(word => d.cleanify(word, sendStrict == null ? 3 : sendStrict)) : null;
        const sendPunish = punish ? punish.charAt(0) : null;
        let sendTime;
        if (muteTime) {
          try {
            const parsed = d.parseTimeStr(muteTime.replace(/,|and/ig, ""));
            if (!parsed[d.parseTimeStr.invalid]) sendTime = d.durationcompress(new d.Interval(Object.entries(parsed)));
          } catch(err) {
            d.rejct(err, "[AT MUTE TIME WORDFILTER SETUP SEND]");
          }
        }
        const obj = {};
        if (sendStrict != null) obj.filterStrict = sendStrict;
        if (messag) obj.filterMessage = messag;
        if (sendPunish) obj.filterPunishment = sendPunish;
        if (sendTime) obj.filterPunishmentMute = sendTime;
        try {
          await d.db.table("mods").assign(guildId, obj, true);
          if (sendWords && sendWords.length > 0) await d.db.table("wordfilters").setRejct(guildId, obj);
        } catch (err) {
          d.rejct(err, "[AT WORDFILTER SETUP SAVE]");
          reply("Oh no! There was an error saving the data. :frowning: Sorry!");
        }
      }
    }
  }
};

module.exports = new Command({
  func,
  name: "wordfilter",
  perms: {
    "wordfilter.list": true, "wordfilter.modify": false, "wordfilter.strictness": false, "wordfilter.message": false,
    "wordfilter.punishment": false, "kick": { default: false, show: false }, "ban": { default: false, show: false },
    "warn": { default: false, show: false }, "softban": { default: false, show: false },
    "mute": { default: false, show: false }
  },
  description: `Set or view warn punishments for reaching a certain (or multiple) warn count(s). For a list of them, \
don't specify an action. For the "get" action, you specify a number after it which is the warn count punishment you want to view.\n\
For the "set", "unset", "add" (same as "set") and "remove" (same as "unset") actions, specify a number after it which is the \
warn count punishment to set/unset. That's all you need if unsetting. If setting, specify a punishment after it (one of kick, \
ban, softban, pmute, mute). For mute, specify amount of minutes after it; if you don't specify an amount of minutes it defaults to 10. \
Otherwise, the punishment will set.\n\nMax warn count (for punishments) is 20.

For permissions, use the \`warnlimit set\` permission for setting/unsetting and the \`warnlimit get\` permission for \
eeing/listing them. :wink:`,
  example: `{p}warnlimit get 5 (see punishment on 5 warns)\n\
{p}warnlimit set 13 kick (on 13 warns, kick)\n\
{p}warnlimit set 10 mute 15 (on 10 warns, mute for 15 mins)\n\
{p}warnlimit unset 10 (remove punishment on 10 warns)`,
  category: "Administration",
  args: { action: true, "warn count": true, "punishment (if setting)": true, "mute minutes (if setting temporary mute)": true },
  guildOnly: true
});