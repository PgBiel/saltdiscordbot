const logger = require("../../classes/logger");
const bot = require("../../util/bot");
const vm = require("vm");
const _ = require("lodash");
const { CrossItem: { prototype: { _insp: inspect } } } = require("../../classes/cross");
/**
 * Processes a process message
 * @param {*} data Data
 */
module.exports = function processMessage(data) {
  logger.debug("Received message");
  if (data.type === "coll" && data.message) {
    const { message: { name, func, args, cleaner, filter, isFunc = true, argsIsFunc = false }, resID, shard } = data;
    let coll = bot[name];
    if (!coll) return;
    const emptySandbox = {};
    vm.createContext(emptySandbox);
    if (filter) coll = coll.filter(typeof filter === "string" ? vm.runInContext(filter, emptySandbox) : filter);
    try {
      bot.shard.send({
        type: "resColl",
        resID,
        shard,
        message: inspect(
          isFunc == null || isFunc ?
            bot.funcs[cleaner](coll[func](...(_.castArray(vm.runInContext(args, emptySandbox))))) : 
            bot.funcs[cleaner](coll[func]),
          true
        )
      });
    } catch (err) {
      bot.shard.send({ type: "resColl", resID, shard, err: inspect(err) });
    }
  }
};
