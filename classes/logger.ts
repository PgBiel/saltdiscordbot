import * as colors from "chalk";
import { EventEmitter } from "events";

type StringResolvable = string | any;

class Logger extends EventEmitter {
  /**
   * Print information
   * @param {...string} text The text to print in console
   * @returns {void}
   */
  public info(...text: StringResolvable[]) {
    console.log.apply(this, [colors.blue("[INFO]"), ...text]);
    this.emit("info", text);
  }

  /**
   * Print debug
   * @param {...string} text The text to print in console
   * @returns {void}
   */
  public debug(...text: StringResolvable[]) {
    console.log.apply(this, [colors.green("[DEBUG]"), ...text]);
    this.emit("debug", text);
  }

  /**
   * Print an error
   * @param {...string} text The text to print in console
   * @returns {void}
   */
  public error(...text: StringResolvable[]) {
    console.error.apply(this, [colors.red("[ERROR]"), ...text]);
    this.emit("info", text);
  }

  /**
   * Print a warning
   * @param {...string} text The text to print in console
   * @returns {void}
   */
  public warn(...text: StringResolvable[]) {
    console.log.apply(this, [colors.yellow("[WARN]"), ...text]);
    this.emit("warn", text);
  }

  /**
   * Custom-print some text
   * @param {string} text The text to print in console
   * @param {Object} options The options
   */
  public custom(
    text: string,
    { prefix = "[GENERIC]", color = "cyan", type = "log" }:
    { prefix?: string, color?: string, type?: "log" | "error" }) {
    console[type].apply(this, [colors[color](prefix), text]);
    this.emit("custom", { text, prefix, color, type });
  }

  /**
   * Print information
   * @param {...string} text The text to print in console
   * @returns {void}
   */
  public log(...text: StringResolvable[]) {
    return this.info.apply(this, text);
  }
}

export default new Logger();
