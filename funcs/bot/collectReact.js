const { _, Constants, bot, Time } = require("../../util/deps");
const customReact = require("./customReact");
const rejct = require("../util/rejct");
const sleep = require("../util/sleep");

/**
 * React and collect those reactions 
 * @param {Message} msg Discord message to react on
 * @param {string[]|string} emojis Emoji(s) to react and listen to
 * @param {string[]|string} validUsers List of users that can react (or one user)
 * @param {object} [options] Options
 * @param {Function} [options.onSuccess=msg.delete()] Function to run when successful reaction
 * @param {Function} [options.onTimeout] Function to run when it timeouts (defaults to remove all reactions)
 * @param {number} [options.timeout=60000] Timeout in milliseconds (defaults to 60000, 0 for no timeout)
 * @param {boolean} [rawReact=false] If should request directly to API to react
 * @returns {Promise<string>} What happened?
 */
const func = function collectReact(
  msg, emojis, validUsers, {
    onSuccess = func.DELETE_MSG, onTimeout = func.REMOVE_ALL, timeout = Time.minutes(1),
    rawReact = false
  } = {}
) {
  return new Promise(async (res, rej) => {
    let stop = false;
    emojis = _.compact(_.castArray(emojis));
    validUsers = _.compact(_.castArray(validUsers));
    const results = [];
    const collector = msg.createReactionCollector(
      (reaction, usr) => (
          emojis.includes(reaction.emoji.name)
          || emojis.includes(`<:${reaction.emoji.name}:${reaction.emoji.id}>`)
          || emojis.includes(`${reaction.emoji.name}:${reaction.emoji.id}`)
        ) &&
        (validUsers.length < 1 ? true : validUsers.includes(usr.id)),
      Object.assign({ max: 1 }, timeout >= 0 ? { time: timeout + 1 } : {})
    );
    collector.on("end", async (collected, reason) => {
      stop = true;
      if (reason === "time") {
        if (typeof onTimeout === "function") onTimeout(results, collected.array(), msg);
        res({
          reason: "time",
          results,
          collected,
          msg
        });
      } else if (/limit/i.test(reason)) {
        if (typeof onSuccess === "function") onSuccess(results, collected.array(), msg);
        res({
          reason: "collected",
          results,
          collected,
          msg
        });
      } else {
        rej({
          reason,
          results,
          collected,
          msg
        });
      }
    });
    let calculatedPing = (bot.pings || [])[0];
    calculatedPing = calculatedPing > 1000 || isNaN(calculatedPing) ? 200 : Number(calculatedPing);
    calculatedPing = calculatedPing + ((calculatedPing || 1000) / 10);
    const emojiToUse = emojis.map(e => typeof e === "string" && Constants.regex.EMOJI_MENTION.test(e) ?
      e.match(Constants.regex.EMOJI_MENTION)[1] :
      e
    );
    for (let i = 0; i < emojiToUse.length; i++) {
      if (stop) break;
      await sleep(calculatedPing);
      const emoji = emojiToUse[i];
      if (rawReact) {
        results.push(await customReact(encodeURIComponent(emojiToUse[i]), msg));
      } else {
        results.push(await msg.react(emoji));
      }
    }
  });
};
func.REMOVE_ALL = rs => rs.forEach(r => r.users.remove());
func.DELETE_MSG = (_re, _coll, msg) => msg.delete();

module.exports = func;
