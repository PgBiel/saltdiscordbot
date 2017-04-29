/**
 * An argument.
 * @typedef {Object} CommandArgument
 * @property {boolean} optional If this argument is optional or not
 */

import { Message, RichEmbed } from "discord.js";

import * as assert from "assert";
import * as _ from "lodash";

interface IArgument {
  optional: boolean;
}

export type CommandSetPerm = boolean | { default: boolean };

interface ICommandOptions {
  name: string;
  func: (message: Message, context: {[prop: string]: any}) => any;
  perms?: string | {[perm: string]: CommandSetPerm};
  default?: boolean;
  pattern?: RegExp | string;
  description?: string;
  example?: string;
  args?: {[prop: string]: boolean | IArgument};
  category?: string;
  devonly?: boolean;
  guildOnly?: boolean;
  customPrefix?: string;
}

export default class Command {
  /**
   * Name of the command.
   * @type {string}
   */
  public name: string;
  /**
   * The command function.
   * @type {Function}
   */
  public func: (message: Message, context: {[prop: string]: any}) => any;
  /**
   * The command permissions.
   * @type {?string|Object}
   */
  public perms?: string | {[perm: string]: CommandSetPerm};
  /**
   * If this command is accessible by default.
   * @type {boolean}
   */
  public default: boolean;
  /**
   * An optional pattern to match a message against.
   * @type {?RegExp}
   */
  public pattern?: RegExp;
  /**
   * The description of the command.
   * @type {?string}
   */
  public description?: string;
  /**
   * An example of usage of the command.
   * @type {?string}
   */
  public example?: string;

  /**
   * Arguments on the command.
   * @type {?Object<boolean | CommandArgument>}
   */
  public args?: {[prop: string]: boolean | IArgument};
  /**
   * The category this command fits in.
   * @type {?string}
   */
  public category?: string;
  /**
   * If this command may only be used by devs or not.
   * @type {boolean}
   */
  public private?: boolean;
  /**
   * If this command may only be used inside guilds or not. True by default.
   * @type {boolean}
   */
  public guildOnly: boolean;
  /**
   * If this command has a set custom prefix to be used.
   * @type {?string}
   */
  public customPrefix?: string;
  constructor(options: ICommandOptions) {
    if (!options.name) {
      throw new Error("No name given.");
    }
    if (!options.func) {
      throw new Error(`No function given for ${options.name}.`);
    }

    this.name = options.name;

    this.func = options.func;

    this.perms = options.perms;

    this.default = Boolean(options.default);

    this.description = options.description || "";

    this.pattern = (typeof options.pattern === "string" ?
        new RegExp(options.pattern) :
        options.pattern) || null;

    this.example = options.example || "";

    this.args = options.args || null;

    this.category = options.category || "";

    this.private = Boolean(options.devonly);

    this.guildOnly = options.guildOnly == null ? true : Boolean(options.guildOnly);

    this.customPrefix = options.customPrefix || null;
  }

  /**
   * Get the help embed or string.
   * @param {string} p The prefix to use
   * @param {boolean} [useEmbed=false] If it should use embed or not
   * @returns {string|RichEmbed} The result
   */
  public help(p: string, useEmbed = false): string | RichEmbed {
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
Usage: ${p}${this.name}${usedargs}${this.example ? `\n\nExample: ${_.trim(this.example).replace(/{p}/g, p)}` : ``}
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
