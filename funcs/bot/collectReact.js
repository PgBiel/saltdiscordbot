const { _, bot, Time } = require("../../util/deps");

/**
 * React and collect those reactions 
 * @param {Message} msg Discord message to react on
 * @param {string[]|string} emojis Emoji(s) to react and listen to
 * @param {string[]|string} validUsers List of users that can react (or one user)
 * @param {object} [options] Options
 * @param {Function} [options.onSuccess=msg.delete()] Function to run when successful reaction
 * @param {Function} [options.onTimeout] Function to run when it timeouts (defaults to remove all reactions)
 * @param {number} [options.timeout=60000] Timeout in milliseconds (defaults to 60000, 0 for no timeout)
 */
module.exports = async function collectReact(
  msg, emojis, validUsers, {
    onSuccess = () => msg.delete(), onTimeout = rs => rs.forEach(r => r.users.remove()), timeout = Time.minutes(1)
  } = {}
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
    const returnValue = onSuccess(results, collected.array());
    if (returnValue && typeof returnValue.then === "function") await returnValue;
  } catch(collected) {
    if (typeof onTimeout === "function") {
      const timeoutRValue = onTimeout(results, collected.array());
      if (timeoutRValue && typeof timeoutRValue.then === "function") await timeoutRValue;
    }
  }
};