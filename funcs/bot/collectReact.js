const { _, bot, Time } = require("../../util/deps");

/**
 * React and collect those reactions 
 * @param {Message} msg Discord message to react on
 * @param {string[]|string} emojis Emoji(s) to react and listen to
 * @param {string[]|string} validUsers List of users that can react (or one user)
 * @param {Function} onSuccess Function to run when successful reaction
 * @param {Function} [onTimeout] Function to run when it timeouts (defaults to remove all reactions)
 * @param {number} [timeout=60000] Timeout in milliseconds (defaults to 60000, 0 for no timeout)
 */
module.exports = async function collectReact(
  msg, emojis, validUsers, onSuccess, onTimeout = rs => rs.map(r => r.users.remove(bot.user)), timeout = Time.minutes(1)
) {
  emojis = _.compact(_.castArray(emojis));
  validUsers = _.compact(_.castArray(validUsers));
  const results = [];
  for (const emoji of emojis) {
    results.push(await msg.react(emoji));
  }
  try {
    const collected = await msg.awaitReactions(
      (reaction, usr) => emojis.includes(reaction.emoji.name) && (validUsers.length < 1 ? true : validUsers.includes(usr.id)),
      Object.assign({ max: 1 }, timeout >= 1 ? { errors: ["time"], time: timeout } : {})
    );
    const returnValue = onSuccess(collected.array());
    if (typeof returnValue.then === "function") await returnValue;
  } catch(collected) {
    if (typeof onTimeout === "function") {
      const timeoutRValue = onTimeout(collected.array());
      if (typeof timeoutRValue.then === "function") await timeoutRValue;
    }
  }
};