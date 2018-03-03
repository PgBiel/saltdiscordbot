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
  if (data.type === "coll" && data.data) {
    const { data: { name, func, args, cleaner, filter, isFunc = true, vars: initVars = {} }, resID, shard } = data;
    let coll = bot[name];
    if (!coll) return;
    const vars = vm.createContext(initVars == null || typeof initVars !== "object" ? {} : initVars);
    if (filter) {
      const { func: fFuncStr } = filter;
      vm.createContext(vars);
      const filterFunc = vm.runInContext(filter, vars);
      if (typeof filterFunc === "function") {
        coll = coll.filter(typeof filter === "string" ? vm.runInContext(filterFunc, vars) : filter);
      }
    }
    try {
      const data = (isFunc == null || isFunc) ?
        bot.funcs[cleaner](coll[func](...(_.castArray(vm.runInContext(args, vars))))) : 
        bot.funcs[cleaner](coll[func]);
      bot.shard.send({
        type: "resColl",
        resID,
        shard,
        data
      });
    } catch (err) {
      bot.shard.send({ type: "resColl", resID, shard, err: inspect(err) });
    }
  }
};
