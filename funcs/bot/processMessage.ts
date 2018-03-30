import logger from "../../classes/logger";
import bot from "../../util/bot";
import * as vm from "vm";
import * as _ from "lodash";
import { inspector } from "../../classes/cross";
import { Collection } from "discord.js";
/**
 * Processes a process message
 * @param {*} data Data
 */
export default function processMessage(data: any) {
  logger.debug("Received message");
  if (data.type === "coll" && data.data) {
    const { data: { name, func, args, cleaner, filter, isFunc = true, vars: initVars = {} }, resID, shard }: {
      data: {
        name: string,
        func: string,
        args?: string,

        cleaner: string,
        filter?: string,
        isFunc?: boolean,
        vars?: string | object
      },
      resID: number,
      shard: number
    } = data;
    let coll: Collection<any, any> = bot[name];
    if (!coll) return;
    const vars = vm.createContext(initVars == null || typeof initVars !== "object" ? {} : initVars);
    if (filter) {
      vm.createContext(vars);
      const filterFunc: Function = vm.runInContext(String(filter), vars);
      if (typeof filterFunc === "function") {
        coll = coll.filter(typeof filter === "string" ? vm.runInContext(String(filterFunc), vars) : filter);
      }
    }
    try {
      const data: any = (isFunc == null || isFunc) ?
        bot.funcs[cleaner](coll[func](...(_.castArray(vm.runInContext(args, vars))))) :
        bot.funcs[cleaner](coll[func]);
      bot.shard.send({
        type: "resColl",
        resID,
        shard,
        data
      });
    } catch (err) {
      bot.shard.send({ type: "resColl", resID, shard, err: inspector(err) });
    }
  }
}
