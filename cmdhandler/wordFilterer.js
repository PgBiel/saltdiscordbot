const { bot, Constants, db, Interval, logger, Time } = require("../util/deps");
const perms = require("../classes/permissions");
const { cleanify, durationdecompress, rejctF } = require("../funcs/funcs");
const muteP = require("../punishments/mute");
const warnP = require("../punishments/warn");
const kickP = require("../punishments/kick");
const banP = require("../punishments/ban");

module.exports = async function wordFilterer(msg, context, act = true) { 
  if (!msg || !msg.guild) return false;
  const guildId = msg.guild.id;
  const wordsF = await (db.table("wordfilters").get(guildId, []));
  const mods = await (db.table("mods").get(guildId, {}));
  let filtered = false;
  let isImmune = { hasPerm: false };
  try {
    isImmune = await perms.hasPerm(msg.member, guildId, "wordfilter.immune", false); // execute hasPerm to check immunity
  } catch (err) {
    logger.custom(err, { prefix: `[ERR/PERMCHECK]`, color: "red", type: "error" });
  }
  if (
    isImmune &&
    !isImmune.hasPerm &&
    wordsF &&
    wordsF.length > 0 && 
    mods && 
    mods.filterStrict != null &&
    msg.guild &&
    (mods.filterEnabled == null || mods.filterEnabled)
  ) {
    for (const nonWord of wordsF) {
      const word = nonWord && typeof nonWord === "string" ? cleanify(nonWord, mods.filterStrict) : "";
      if (typeof word !== "string" || !word) continue;
      let condition;
      if (mods.filterStrict === 4) {
        condition = cleanify(msg.content, 4)
          .split("")
          .filter(l => word.split("").includes(l))
          .join("")
          .includes(word);
      } else {
        condition = cleanify(msg.content, mods.filterStrict).includes(word);
      }
      if (condition) {
        filtered = true;
        if (act) {
          msg.delete();
          msg.reply(mods.filterMessage || "Your message was caught in the word filter!")
            .then(m => m.delete({ timeout: Time.seconds(7) }))
            .catch(rejctF("[WORDFILTERER-FILTERMSG]"));
          const punishment = mods.filterPunishment;
          if (punishment && typeof punishment === "string" && punishment[0] in Constants.maps.PUNISHMENTS && context) { 
            msg.reply(`For saying a filtered word, you will receive the punishment of a \
**${Constants.maps.PUNISHMENTS[punishment[0]][0].replace("pmute", "permanent mute")}** (defined by this server's \
settings.`);
            const name = punishment[0];
            if (/p|m/.test(name)) {
              muteP.punish(msg.member, {
                author: bot.user,
                reason: "<Auto punishment by Word Filter>",
                auctPrefix: "[Auto-mute issued by Word Filter] ",
                time: mods.filterPunishmentMute ?
                  new Interval(durationdecompress(mods.filterPunishmentMute)) :
                  Interval.minutes(10),
                permanent: name === "p",
                context
              });
            } else if (/b|s/.test(name)) {
              banP.punish(msg.member, msg.guild, context, {
                author: bot.user,
                reason: "<Auto punishment by Word Filter>",
                auctPrefix: "[Auto-ban issued by Word Filter] ",
                usePrompt: false,
                days: 1,
                isSoft: name === "s"
              });
            } else if (/k/.test(name)) {
              kickP.punish(msg.member, {
                author: bot.user,
                reason: "<Auto punishment by Word Filter>",
                auctPrefix: "[Auto-kick issued by Word Filter] ",
                context
              });
            } else if (/w/.test(name)) {
              warnP.punish(msg.member, {
                author: bot.user,
                reason: "<Auto punishment by Word Filter>",
                auctPrefix: "[Auto-warn issued by Word Filter] ",
                context,
                automatic: true
              });
            }
          }
        }
        break;
      }
    }
  }
  return filtered;
};
