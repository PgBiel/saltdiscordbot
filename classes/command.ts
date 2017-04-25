import { Message, RichEmbed } from "discord.js";
import * as _ from "lodash";

import { assert } from "../util/deps";

interface IArgument {
  optional: boolean;
}

interface ICommandOptions {
  name: string;
  func: (message: Message, context: {[prop: string]: any}) => any;
  perms?: string;
  default?: boolean;
  pattern?: RegExp | string;
  description?: string;
  example?: string;
  args?: {[prop: string]: boolean | IArgument};
  category?: string;
  devonly?: boolean;
}

export default class Command {
  public name: string;
  public func: (message: Message, context: {[prop: string]: any}) => any;
  public perms?: string;
  public default: boolean;
  public pattern?: RegExp | string;
  public description?: string;
  public example?: string;
  public args?: {[prop: string]: boolean | IArgument};
  public category?: string;
  public private?: boolean;
  constructor(options: ICommandOptions) {
    if (!options.name) {
      throw new Error("No name given.");
    }
    if (!options.func) {
      throw new Error(`No function given for ${options.name}.`);
    }
    /**
     * Name of the command.
     * @type {string}
     */
    this.name = options.name;

    /**
     * The command function.
     * @type {Function}
     */
    this.func = options.func;

    /**
     * The command permissions.
     * @type {?string}
     */
    this.perms = options.perms;

    /**
     * If this command is accessible by default.
     * @type {boolean}
     */
    this.default = Boolean(options.default);

    /**
     * The description of the command.
     * @type {?string}
     */
    this.description = options.description || "";

    /**
     * An example of usage of the command.
     * @type {?string}
     */
    this.example = options.example || "";

    /**
     * An argument.
     * @typedef {Object} CommandArgument
     * @property {boolean} optional If this argument is optional or not
     */

    /**
     * Arguments on the command.
     * @type {?Object<string, boolean | CommandArgument>}
     */
    this.args = options.args || null;

     /**
      * The category this command fits in.
      * @type {?string}
      */
    this.category = options.category || "";

    /**
     * If this command may only be used by devs or not.
     * @type {boolean}
     */
    this.private = Boolean(options.devonly);
  }

  /**
   * Get the help embed or string.
   * @param {string} p The prefix to use
   * @param {boolean} [useEmbed=false] If it should use embed or not
   * @returns {boolean|RichEmbed} The result
   */
  public help(p: string, useEmbed = false) {
    if (!p) {
      throw new TypeError("No prefix given.");
    }
    let usedargs = "";
    if (this.args) {
      Object.entries([this.args, usedargs += " "][0]).map(([a, v]) => {
        if (v.optional) {
          usedargs += (usedargs.endsWith(" ") ? `[${a}]` : ` [${a}]`);
        } else {
          usedargs += (usedargs.endsWith(" ") ? `{${a}}` : ` {${a}}`);
        }
      });
    }
    if (!useEmbed) {
      return `\`\`\`
${p}${this.name}${this.private ? " (Dev-only)" : ""}
${this.description}
Usage: ${p}${this.name}${usedargs}${this.example ? `\n\nExample: ${_.trim(this.example).replace("{p}", p)}` : ``}
\`\`\``;
    }
    const embed = new RichEmbed();
    embed
      .setTitle(`\`${p}${this.name}\` ${this.private ? " (Dev-only)" : ""}`)
      .setDescription(this.description || "\u200B")
      .addField("Usage", "${p}${this.name}${usedargs}");
    if (this.example) {
      embed.addField("Example", _.trim(this.example).replace("{p}", p));
    }
    return embed;
  }
}
