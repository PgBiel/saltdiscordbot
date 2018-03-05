const { _, Constants, bot, Time } = require("../../util/deps");
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
 * @returns {Promise<string>} What happened?
 */
module.exports = function collectReact(
  msg, emojis, validUsers, {
    onSuccess = () => msg.delete(), onTimeout = rs => rs.forEach(r => r.users.remove()), timeout = Time.minutes(1)
  } = {}
) {
  return new Promise(async (res, rej) => {
    let stop = false;
    emojis = _.compact(_.castArray(emojis));
    validUsers = _.compact(_.castArray(validUsers));
    const results = [];
    const collector = msg.createReactionCollector(
      (reaction, usr) => emojis.includes(reaction.emoji.name) && (validUsers.length < 1 ? true : validUsers.includes(usr.id)),
      Object.assign({ max: 1 }, timeout >= 0 ? { time: timeout + 1 } : {})
    );
    collector.on("end", async (collected, reason) => {
      stop = true;
      console.log("END", reason, collected);
      if (reason === "time") {
        if (typeof onTimeout === "function") onTimeout((collected || { array: _ => _ }).array(), collected.array());
        res("time");
      } else if (/limit/i.test(reason)) {
        if (typeof onSuccess === "function") onSuccess((collected || { array: _ => _ }).array(), collected.array());
        res("collect");
      } else {
        rej(reason);
      }
    });
    for (let i = 0; i < emojis.length; i++) {
      if (stop) break;
      const emoji = emojis[i];
      const emojiToUse = typeof emoji === "string" && Constants.regex.EMOJI_MENTION.test(emoji) ?
        emoji.match(Constants.regex.EMOJI_MENTION)[1] :
        emoji;
      results.push(await msg.react(emojiToUse));
      console.log("EMJLENGTH", emojis.length, i, emojis.length > 1 && 1 < emojis.length - 1);
      if (emojis.length > 1 && i < emojis.length - 1) await sleep(250); 
    }
  });
};
