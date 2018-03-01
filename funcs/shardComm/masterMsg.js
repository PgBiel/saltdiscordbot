const { bot, Time } = require("../../util/deps");

/**
 * Send a message to master and expect or not a response
 * @param {*} message Message
 * @param {number} [timeout=15000] Time in milliseconds to expire and reject (0 for none)
 */
module.exports = function masterMsg(message, { awaitRes = true, timeout = Time.seconds(15) } = {}) {
  return new Promise((res, rej) => {
    const resID = Date.now();
    if (awaitRes) {
      const handler = response => {
        if (response.shard === bot.shard.id && response.resID === resID) {
          process.removeListener("message", handler);
          res(response);
        }
      };
      process.on("message", handler);
      if (timeout && !isNaN(timeout)) setTimeout(() => rej(new Error("Timeout")), timeout);
    }
    bot.shard.send({ shard: bot.shard.id, resID, message });
  });
};
