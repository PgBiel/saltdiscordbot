const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (
  msg, {
    prompt, guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms, seePerm,
    genPromptD
  },
) {
  const words = await (d.db.table("wordfilters").get(guildId, []));
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
      const responses = [];
      const genPrompt = genPromptD({
        timeout: d.Time.seconds(15),
        array: responses,
        filter: msg2 => !/^[^a-z\d]$/i.test(msg2.content),
        invalidMsg: "Invalid response!",
        branch: () => "next",
        cancel: true
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
      const multiPrompt = new d.MultiPrompt(
        `Now setting up word filter. What words would you like to be filtered? \
Separate words with commas. Type ${canDOther ? "`skip` to skip and `" : ""}\`cancel\` to cancel.`,
        genPrompt({
          skip: canDOther,
          invalidMsg: "Every word must consist of letters and have a minimum length of 3 characters \
(**not including duplicate letters**).",
          filter: msg2 => {
            if (/^[^a-z\d]$/i.test(msg2.content)) return false;
            if (msg2.content.length < 3) return false;
            const words = msg2.content.split(/\s*,\s*/).map(str => d._.trim(d.cleanify(str, 3)));
            for (const word of words) {
              if (word.length < 3) return false;
            }
            return true;
          }
        })
      );
      if (canStrict) {
        const hasNext = canMessag || canPunish;
        multiPrompt.addBranch(
          "next", `What strictness would you like to set for the word filter (1-5)? Strictness **1** \
is normal filtering with basic replacement (not recommended). Strictness **2** ignores spaces. Strictness **3** ignores \
duplicated characters. Strictness **4** adds a huge replacement character list (RECOMMENDED). Finally, strictness **5** \
ignores the order of letters and can spot words hidden in words, but give many false positives (not recommended). `
        );
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