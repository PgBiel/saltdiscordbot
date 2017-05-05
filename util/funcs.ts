import Command from "../classes/command";
import * as cmds from "../commands/cmdIndex";
import { _, bot, commandHandler, commandParse, Constants, Discord, fs, logger, messager } from "./deps";

export interface IMessagerEvalData {
  content: string;
  vars: {[prop: string]: any};
  id: number;
}

/**
 * Handle a rejection
 * @param {*} rejection The rejection to handle
 * @returns {void}
 */
export function rejct(rejection: any): void {
  logger.custom(rejection, "[ERR/REJECT]", "red", "error");
}

/**
 * Require without being on cache
 * @param {string} fpath The path to require
 * @returns {*} The required value
 */
export function ncrequire(fpath: string) {
  delete require.cache[require.resolve(fpath)];
  return require(fpath);
}

/**
 * Factory function for event function for doEval on messager
 * @param {*} evaler The eval function
 * @returns {Function} The generated function
 */
export function messagerDoEval(evaler: any) {
  /**
   * Event function for doEval on messager
   * @param {*} data Data
   * @returns {void}
   */
  return (data: IMessagerEvalData) => {
    const { bot, message, msg, input, channel, deps, funcs, guildId, send, reply } = data.vars;
    try {
      const result = eval(data.content); // tslint:disable-line:no-eval
      messager.emit(`${data.id}eval`, {
        success: true,
        result,
      });
    } catch (err) {
      messager.emit(`${data.id}eval`, {
        success: false,
        result: err,
      });
    }
  };
}
export function djsDebug(info: string) {
  logger.custom(
    info, `[${/heartbeat/i.test(info) ? "HEARTBEAT" : "DJS DEBUG"}]`, "magenta",
    );
}
export function djsWarn(info: string) {
  logger.custom(info, `[DJS WARN]`, "yellow");
}
export function botMessage(msg: Discord.Message) {
  const thingy = commandHandler(msg);
  if (thingy.catch) {
    thingy.catch(rejct);
  }
}
export function processMessage(data: any) {
  logger.debug("Received message");
}
export function cloneObject <T>(objec: T): T {
  return Object.assign(Object.create((objec as any)), objec);
}
export function loadCmds() {
  /* const loadedCmds = [];
  fs.readdirSync("./commands").map((f: string) => {
    if (/\.js$/.test(f)) {
      loadedCmds.push(ncrequire(`../commands/${f}`));
    }
  }); */
  const loadedCmds = ncrequire("../commands/cmdIndex");
  for (const cmdn in loadedCmds) {
    if (loadedCmds.hasOwnProperty(cmdn)) {
      const cmd: Command = loadedCmds[cmdn];
      // const parsed = commandParse(loadedCmds[cmd]);
      // if (parsed) {
      bot.commands[cmd.name] = cmd;
      // }
    }
  }
}
// tslint:disable-next-line:prefer-const
let isUnique = (err: Error) => err == null ? false : err.name === Constants.sql.UNIQUE_CONSTRAINT;
export function SQLLogger(...stuff: string[]) {
  return logger.custom(stuff.join(" "), "[SQL]", "yellow");
}
export function doError(...stuff: string[]): void {
  return logger.error.apply(logger, [...stuff]);
}
export function bcEval() {
  return bot.shard.broadcastEval.apply(bot.shard, Array.from(arguments));
}
export function random(min: number, max: number): number {
  if (isNaN(min) || isNaN(max)) {
    return;
  }
  [min, max] = [Math.ceil(Number(min)), Math.floor(Number(max))];
  if (min > max) {
    [min, max] = [max, min];
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}