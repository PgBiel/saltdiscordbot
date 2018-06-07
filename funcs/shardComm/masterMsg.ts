import { _, bot, Time } from "../../util/deps";

export interface IMasterMsgOpts {
  type?: string;

  awaitRes?: boolean;
  awaitType?: string; // what type to await

  timeout?: number;
  receiveMultiple?: boolean;
}
/**
 * Send a message to master and expect or not a response
 * @param {*} data Message
 * @param {object} [opts] Options
 * @param {number} [opts.timeout=15000] Time in milliseconds to expire and reject (0 for none)
 * @param {boolean} [opts.awaitRes=true] If should await response
 * @param {string} [opts.type=null] Type to send
 * @param {string} [opts.awaitType=null] Type to await
 * @param {boolean|number} [opts.receiveMultiple=false] If true, receive multipel until shard count is met. IF a number,
 * until that count of responses is met
 * @returns {Promise<*>} Response (if awaiting one, undefined otherwise)
 */
export default function masterMsg(
  data,
  {
    type = null, awaitRes = true, awaitType = null, timeout = Time.seconds(15), receiveMultiple = false
  }: IMasterMsgOpts = {}
): Promise<any | any[]> {
  return new Promise((res, rej) => {
    const resID: number = Date.now();
    if (awaitRes) {
      let success = false;
      const responses: object[] = [];
      let maxNum: number = null;
      const handler = response => {
        if (
          response.shard === bot.shard.id && response.resID === resID && (awaitType ? response.type === awaitType : true)
        ) {
          if (receiveMultiple) {
            responses.push(response);
            if (responses.length < 2) {
              if (typeof receiveMultiple === "boolean") {
                maxNum = response.shardCount || 5;
              } else {
                maxNum = receiveMultiple;
              }
            }
          }
          if (receiveMultiple ? responses.length >= maxNum : true) {
            success = true;
            process.removeListener("message", handler);
            res(receiveMultiple ? responses : response);
          }
        }
      };
      process.on("message", handler);
      if (timeout && !isNaN(timeout)) {
        setTimeout(() => {
          if (!success) {
            process.removeListener("message", handler);
            rej(new Error("Timeout"));
          }
        }, timeout);
      }
    }
    bot.shard.send({ type, shard: bot.shard.id, resID, data });
  });
}
