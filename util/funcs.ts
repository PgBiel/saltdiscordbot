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
/**
 * Loads commands.
 */
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
/**
 * Get a random value between two numbers.
 * @param {number} min The minimum number.
 * @param {number} max The maximum number.
 * @returns {number}
 */
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
/**
 * Escape Discord markdown in a string.
 * @param {string} str The string.
 * @param {boolean} [escaper=false] If backslash should be escaped.
 * @returns {string} The newly escaped string.
 */
export function escMarkdown(str: string, escaper: boolean = false): string {
  const regex = new RegExp(`[\`*_~${escaper ? "\\\\" : ""}]`, "g");
  return str.replace(regex, (piece: string) => "\\" + piece);
}
/**
 * Abstract strings if it is too long.
 * @param {string} text The string to abstract.
 * @param {number} length The max length.
 * @returns {string} The abstracted string.
 */
export function textAbstract(text: string, length: number): string {
    if (text == null) {
        return "";
    }
    if (typeof text !== "string") {
      try {
        text = (text as any).toString();
      } catch (err) {
        text = String(text);
      }
    }
    if (typeof length !== "number") {
      if (isNaN(length)) {
        throw new TypeError("Length must be a number!");
      }
      length = Number(length);
    }
    if (text.length <= length) {
        return text;
    }
    const newText = text.substring(0, length).replace(/[^]{0,3}$/, "...");
    return newText || "...";
}
