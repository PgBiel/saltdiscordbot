/**
 * An argument.
 * @typedef {Object} CommandArgument
 * @property {boolean} optional If this argument is optional or not
 */

const { Message, MessageEmbed } = require("discord.js");
const { applyDeps, logger } = require("../util/deps");
const { applyFuncs } = require("../funcs/funcs");
const Constants = require("../misc/constants");

const assert = require("assert");
const _ = require("lodash");

// TypeScript Remainder
/* export interface IAliasData {
  perms?: string | {[perm: string]: CommandSetPerm};
  default?: boolean;
  pattern?: RegExp | string;
  description?: string;
  example?: string;
  args?: {[prop: string]: boolean | IArgument};
  [prop: string]: any;
}

interface IArgument {
  optional: boolean;
}

export type CommandSetPerm = boolean | { default: boolean };

interface ICommandOptions {
  name: string;
  func: (message: Message, context: {[prop: string]: any}) => any;
  aliases?: {[name: string]: Command} | string[];
  aliasData?: IAliasData;
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
} */

// avoid some loops 'n stuff with those functions
function debug(...text) {
  console.log.apply(console.log, [require("chalk").green("[DEBUG]"), ...text]);
}

function cloneObject (objec) {
  return Object.assign(Object.create(objec), objec);
}

/**
 * Abstract strings if it is too long.
 * @param {string} text The string to abstract.
 * @param {number} length The max length.
 * @returns {string} The abstracted string.
 */
function textAbstract(text, length) {
  if (text == null) {
    return "";
  }
  if (typeof text !== "string") {
    text = String(text);
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

module.exports = class Command {
  /**
   * Generate a command as alias from another.
   * @param {Command} cmd The command.
   * @param {string} name The name of the alias.
   * @param {Object<string, any>} data The alias data.
   * @returns {Command} The newly created command.
   */
  static aliasFrom(cmd, name, data) {
    const newData = cloneObject(data);
    Object.defineProperty(newData, "__aliasOf", {
      value: cmd,
      writable: false,
      enumerable: false,
      configurable: true
    });
    const newCmd = new Command({
      name,
      func: null,
      aliasData: newData,
      category: cmd.category,
      customPrefix: cmd.customPrefix,
      devonly: cmd.private,
      perms: data.perms || cmd.perms,
      default: data.default == null ? cmd.default : data.default,
      pattern: data.pattern || cmd.pattern,
      description: data.description || cmd.description,
      example: data.example || null,
      guildOnly: data.guildOnly == null ? cmd.guildOnly : data.guildOnly,
      args: data.args || cmd.args,
      show: data.show
    });
    return newCmd;
  }
  /*
  Properties - TypeScript Remainder
  /**
   * Name of the command.
   * @type {string}
   * /
  public name: string;
  /**
   * The command function.
   * @type {Function}
   * /
  public func: (message: Message, context: {[prop: string]: any}) => any;
  /**
   * The command permissions.
   * @type {?string|Object}
   * /
  public perms?: string | {[perm: string]: CommandSetPerm};
  /**
   * Aliases for the command.
   * @type {?Object<string, CommandOrString>}
   * /
  public aliases?: {[alias: string]: Command} | string[];
  /**
   * Alias data for using at the `dummy` object.
   * @type {?Object<string, any>}
   * /
  public aliasData?: {
    __aliasOf?: Command,
    [prop: string]: any,
  };
  /**
   * If this command is accessible by default.
   * @type {boolean}
   * /
  public default: boolean;
  /**
   * An optional pattern to match a message against.
   * @type {?RegExp}
   * /
  public pattern?: RegExp;
  /**
   * The description of the command.
   * @type {?string}
   * /
  public description?: string;
  /**
   * An example of usage of the command.
   * Note: This replaces every occurrence of {p} with the prefix.
   * @type {?string}
   * /
  public example?: string;

  /**
   * Arguments on the command.
   * @type {?Object<boolean | CommandArgument>}
   * /
  public args?: {[prop: string]: boolean | IArgument};
  /**
   * The category this command fits in.
   * @type {?string}
   * /
  public category?: string;
  /**
   * If this command may only be used by devs or not.
   * @type {boolean}
   * /
  public private?: boolean;
  /**
   * If this command may only be used inside guilds or not. True by default.
   * @type {boolean}
   * /
  public guildOnly: boolean;
  /**
   * If this command has a set custom prefix to be used.
   * @type {?string}
   * /
  public customPrefix?: string;
  */

  constructor(options) {
    this.config(options);
  }

  config(options) {
    if (!options) throw new Error("No options given.");
    if (!options.name) throw new Error("No name given.");
    if (!options.func && (options.aliasData ? !options.aliasData.__aliasOf : true)) {
      throw new Error(`No function given for ${options.name}.`);
    }

    this.name = options.name;

    this.show = options.show;

    this.func = options.func;

    this.perms = options.perms;

    this.aliasData = options.aliasData;

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

    this.aliases = typeof options.aliases === "object" ?
      _.fromPairs(Object.entries(options.aliases).map(([k, v]) => typeof v === "object" ?
        [k, Command.aliasFrom(this, k, Object.assign({ show: false }, v))] :
        [k, null]
      )) :
      null;
  }

  /**
   * Execute the command!
   * @param {Message} msg The message
   * @param {Object} options The options
   * @returns {*} The result.
   */
  exec(msg, options) {
    // Object.entries(options).forEach(([k, v]) => this[k] = v);
    return this.func.call(this, msg, options);
  }

  /**
   * Set what command this command is alias of.
   * @param {Command} cmd The command.
   * @returns {Command} This command.
   */
  alias(cmd) {
    if (!this.aliasData) {
      this.aliasData = {};
    }
    Object.defineProperty(this.aliasData, "__aliasOf", {
      value: cmd,
      writable: false,
      enumerable: false,
      configurable: true
    });
    return this;
  }

  /**
   * Get the help embed or string.
   * @param {string} p The prefix to use
   * @param {boolean} [useEmbed=true] If it should use embed or not
   * @param {Guild} [guild] Guild
   * @returns {string|MessageEmbed} The result
   */
  help(p, useEmbed = true, guild) {
    if (!p) {
      throw new TypeError("No prefix given.");
    }
    let usedargs = "";
    if (this.args) {
      Object.entries([this.args, usedargs += " "][0]).map(([a, v]) => {
        if (typeof v === "boolean" ? v : v.optional) {
          usedargs += (usedargs.endsWith(" ") ? `[${a}]` : ` [${a}]`);
        } else {
          usedargs += (usedargs.endsWith(" ") ? `{${a}}` : ` {${a}}`);
        }
      });
    }
    if (!useEmbed) {
      return `\`\`\`
${this.customPrefix || p}${this.name}${this.private ?
  " (Dev-only)" :
  ""}${this.default ?
  " (Usable by default)" :
  ""}${this.guildOnly ?
    " (Not usable in DMs)" :
    ""}
${textAbstract(this.description, Constants.numbers.MAX_MSG_CHARS - 100)}
Usage: ${this.customPrefix || p}${this.name}${usedargs}${this.example ?
  `\n\nExample(s): ${_.trim(this.example).replace(/{p}/g, p)}` :
  ``}
\`\`\``;
    }
    const embed = new MessageEmbed();
    embed
      .setColor("RANDOM")
      .setTitle(`\`${this.customPrefix || p}${this.name}\`${this.private ?
        " (Dev-only)" :
        ""}${this.default ?
          " (Usable by default)" :
          ""}${this.guildOnly ?
            " (Not usable in DMs)" :
            ""}`)
      .addField("Usage", `${this.customPrefix || p}${this.name}${usedargs}`);
    if (this.description) {
      embed.setDescription(
        textAbstract(
          this.description.replace(
            /{maxcases}/ig, Constants.numbers.MAX_CASES((guild || { members: { size: 0 } }).members.size)
          ),
          Constants.numbers.MAX_DESC_CHARS
        )
      );
    }
    if (this.perms) {
      let string = "";
      let filtered, onlyFalse;
      if (typeof this.perms === "string") {
        string = `\`${this.perms.replace(/\./g, " ")}\``;
        if (this.default) string += " (available by default)";
      } else {
        filtered = Object.entries(this.perms).filter(([_n, perm]) => typeof perm === "boolean" ?
          true :
          (perm.show == null || perm.show)
        );
        onlyFalse = filtered.filter(perm => !(typeof perm === "boolean" ? perm : perm.default));
        for (const [key, val] of filtered) {
          string += `\`${key.replace(/\./g, " ")}\``;
          if (
            (
              (
                typeof val === "boolean" && val
              ) ||
              (
                val && val.default
              )
            ) &&
            onlyFalse.length
          ) {
            string += " (available by default)";
          }
          string += ", ";
        }
      }
      embed.addField(
        `Permissions${onlyFalse && onlyFalse.length ? "" : " (All available by default)"}`,
        string.replace(/,\s+$/, "")
      );
    }
    if (this.example) {
      embed.addField("Example", _.trim(this.example).replace(/{p}/g, p), true);
    }
    return embed;
  }
};
