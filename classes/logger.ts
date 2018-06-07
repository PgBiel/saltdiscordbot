import colors, { Chalk } from "chalk";
import { EventEmitter } from "events";

export type StringResolvable = string | any;

export type ChalkColor = "reset" |
  "bold" |
  "dim" |
  "italic" |
  "underline" |
  "inverse" |
  "hidden" |
  "strikethrough" |

  "visible" |

  "black" |
  "red" |
  "green" |
  "yellow" |
  "blue" |
  "magenta" |
  "cyan" |
  "white" |
  "gray" |
  "grey" |
  "blackBright" |
  "redBright" |
  "greenBright" |
  "yellowBright" |
  "blueBright" |
  "magentaBright" |
  "cyanBright" |
  "whiteBright" |

  "bgBlack" |
  "bgRed" |
  "bgGreen" |
  "bgYellow" |
  "bgBlue" |
  "bgMagenta" |
  "bgCyan" |
  "bgWhite" |
  "bgBlackBright" |
  "bgRedBright" |
  "bgGreenBright" |
  "bgYellowBright" |
  "bgBlueBright" |
  "bgMagentaBright" |
  "bgCyanBright" |
  "bgWhiteBright";

export interface ICustomLogOptions {
  prefix?: string;
  color?: ChalkColor;
  type?: keyof Console;
}

class Logger extends EventEmitter {
  /**
   * Print information
   * @param {...string} text The text to print in console
   * @returns {void}
   */
  public info(...text: string[]) {
    console.log(colors.blue("[INFO]"), ...text);
    this.emit("info", text);
  }

  /**
   * Print debug
   * @param {...string} text The text to print in console
   * @returns {void}
   */
  public debug(...text: string[]) {
    console.log(colors.green("[DEBUG]"), ...text);
    this.emit("debug", text);
  }

  /**
   * Print an error
   * @param {...string} text The text to print in console
   * @returns {void}
   */
  public error(...text: string[]) {
    console.error(colors.red("[ERROR]"), ...text);
    this.emit("info", text);
  }

  /**
   * Print a warning
   * @param {...string} text The text to print in console
   * @returns {void}
   */
  public warn(...text: string[]) {
    console.log(colors.yellow("[WARN]"), ...text);
    this.emit("warn", text);
  }

  /**
   * Custom-print some text
   * @param {string} text The text to print in console
   * @param {Object} options The options
   */
  public custom(
    text: string,
    {
      prefix = "[GENERIC]", color = "cyan", type = "log"
    }: ICustomLogOptions = { prefix: "[GENERIC]", color: "cyan", type: "log" }
  ) {
    console[type].apply(this, [colors[color](prefix), text]);
    this.emit("custom", { text, prefix, color, type });
  }

  /**
   * Print information (Alias of public info())
   * @param {...string} text The text to print in console
   * @returns {void}
   */
  public log(...text) {
    return this.info.apply(this, text);
  }
}

export default new Logger();
