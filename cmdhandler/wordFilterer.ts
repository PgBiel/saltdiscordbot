import { bot, Constants, db, Interval, logger, Time } from "../util/deps";
import perms from "../classes/permissions";
import { cleanify, durationdecompress, rejctF } from "../funcs/funcs";
import muteP from "../punishments/mute";
import warnP from "../punishments/warn";
import kickP from "../punishments/kick";
import banP from "../punishments/ban";
import { Message } from "discord.js";
import { TContext } from "../misc/contextType";

/**
 * Filter on message
 * @param {Message} msg Message to filter
 * @param {object} context Context
 * @param {boolean} [act=true] If should punish accordingly
 */
export default async function wordFilterer(msg: Message, context: TContext, act = true) {
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
    isImmune && // the is immune objct exists
    !isImmune.hasPerm && // they aren't immune
    wordsF && // words-to-filtre list exists
    wordsF.length > 0 && // there are words to filter
    mods && // mod options object exists
    mods.filterStrict != null && // there is a strictness set
    msg.guild && // message has guild
    (mods.filterEnabled == null || mods.filterEnabled) // filter is enabled
  ) {
    for (const nonWord of wordsF) {
      const word = nonWord && typeof nonWord === "string" ? cleanify(nonWord, mods.filterStrict) : "";
      if (typeof word !== "string" || !word) continue;
      let condition: boolean;
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
          msg.reply(mods.filterMessage || "Your message was caught by the word filter!")
            .then(m => (m as Message).delete({ timeout: Time.seconds(7), reason: "[Message caught by wordfilter]" }))
            .catch(rejctF("[WORDFILTERER-FILTERMSG]"));
          const punishment = mods.filterPunishment;
          if (punishment && typeof punishment === "string" && punishment[0] in Constants.maps.PUNISHMENTS && context) {
            msg.reply(`For saying a filtered word, you will receive the punishment of a \
**${Constants.maps.PUNISHMENTS[punishment[0]][0].replace("pmute", "permanent mute")}** (defined by this server's \
settings.`);
            const name = punishment[0];
            const { guild, member } = msg;
            const { me } = guild;
            if (/p|m/.test(name)) {
              muteP.punish(member, {
                author: me,
                reason: "<Auto punishment by Word Filter>",
                auctPrefix: "[Auto-mute issued by Word Filter] ",
                time: mods.filterPunishmentMute ?
                  new Interval(durationdecompress(mods.filterPunishmentMute)) :
                  Interval.minutes(10),
                permanent: name === "p",
                context
              });
            } else if (/b|s/.test(name)) {
              banP.punish(member, guild, context, {
                author: me,
                reason: "<Auto punishment by Word Filter>",
                auctPrefix: "[Auto-ban issued by Word Filter] ",
                usePrompt: false,
                days: 1,
                isSoft: name === "s"
              });
            } else if (/k/.test(name)) {
              kickP.punish(member, {
                author: me,
                reason: "<Auto punishment by Word Filter>",
                auctPrefix: "[Auto-kick issued by Word Filter] ",
                context
              });
            } else if (/w/.test(name)) {
              warnP.punish(member, {
                author: me,
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
}
