const { _, bot, Time } = require("../../util/deps");

/**
 * Send a message to master and expect or not a response
 * @param {*} message Message
 * @param {object} [opts] Options
 * @param {number} [opts.timeout=15000] Time in milliseconds to expire and reject (0 for none)
 * @param {boolean} [opts.awaitRes=true] If should await response
 * @param {string} [opts.type=null] Type to send
 * @param {string} [opts.awaitType=null] Type to await
 * @param {boolean|number} [opts.receiveMultiple=false] If true, receive multipel until shard count is met. IF a number,
 * until that count of responses is met
 * @returns {Promise<*>} Response (if awaiting one, undefined otherwise)
 */
module.exports = function masterMsg(
  message, { type = null, awaitRes = true, awaitType = null, timeout = Time.seconds(15), receiveMultiple = false } = {}
) {
  return new Promise((res, rej) => {
    const resID = Date.now();
    if (awaitRes) {
      const responses = [];
      let maxNum = null;
      let num = -1;
      const handler = response => {
        if (response.shard === bot.shard.id && response.resID === resID) {
          if (receiveMultiple != null && num === -1) {
            if (typeof receiveMultiple === "boolean") {
              maxNum = response.shardCount || 5;
            } else {
              maxNum = receiveMultiple;
            }
            num = 0;
          }
          if (
            (awaitType ? response.type === awaitType : true) &&
            (receiveMultiple ? ++num > maxNum : true)
          ) {
            process.removeListener("message", handler);
            res(receiveMultiple ? _.castArray(response) : response);
          }
        }
      };
      process.on("message", handler);
      if (timeout && !isNaN(timeout)) {
        setTimeout(() => {
          process.removeListener("message", handler);
          rej(new Error("Timeout"));
        }, timeout);
      }
    }
    bot.shard.send({ type, shard: bot.shard.id, resID, message });
  });
};
