/**
 * An argument.
 * @typedef {Object} CommandArgument
 * @property {boolean} optional If this argument is optional or not
 */

import { Message, MessageEmbed } from "discord.js";
import { Constants, _, logger, Guild } from "../util/deps";

import cloneObject from "../funcs/util/cloneObject";
import textAbstract from "../funcs/strings/textAbstract";
import escMarkdown from "../funcs/strings/escMarkdown";

import * as assert from "assert";
import { Context, TContext, BaseContext, DjsChannel } from "../misc/contextType";

// TypeScript Remainder
export interface IAliasData {
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

export interface ICommandArgs { [prop: string]: boolean | IArgument; }

export type CommandSetPerm = boolean | { default?: boolean, show?: boolean };

export type CommandPerms = string | {
  [perm: string]: CommandSetPerm
};

export interface ICommandSubHelp {
  description?: string;
  perms?: CommandPerms; // actually have no effect here, just to show help
  default?: boolean; // if perm is default
  /** Whether or not should show on Subpages */
  subShow?: boolean;
  args?: ICommandArgs;
  /** Alias subcommands */
  aliases?: string[];
  /** Place after command name for subcommand material */
  preArgs?: string; // +[cmdname] [preArgs] [args, args, args, args]
  example?: string;

  /** If title should be +cmd sub instead of +cmd -> Subpage "sub" | Default: true */
  useSubTitle?: boolean;
}

interface ICommandOptionsProto<D = object, C extends Context = Context> {
  aliases?: {[name: string]: Command | D} | string[];
  aliasData?: IAliasData;
  perms?: CommandPerms;
  default?: boolean;
  show?: boolean;
  aliasShow?: boolean;
  pattern?: RegExp | string;
  description?: string;
  subHelps?: {
    [name: string]: ICommandSubHelp;
  };
  example?: string;
  args?: ICommandArgs;
  category?: string;
  devonly?: boolean;
  guildOnly?: C extends TContext ? true : boolean;
  customPrefix?: string;
}

type AliasData<D = object, C extends Context = Context> = ICommandOptionsProto<D, C> & {
  func?: (message: Message, context: C & { dummy?: D }) => any;
};

type CommandOptions<D = object, C extends Context = Context> = ICommandOptionsProto<D, C> & {
  name: string;
  func: (message: Message, context: C & { dummy?: D }) => any;
};

// avoid some loops 'n stuff with those functions
function debug(...text: string[]): void {
  return logger.debug(...text);
}

/**
 * A command
 * @template D Dummy type
 */
export class Command<D = object, C extends Context = Context> {
  /**
   * If should show on help command
   * @type {boolean}
   */
  public show?: boolean;
  /**
   * If should show on help command as alias
   * @type {boolean}
   */
  public aliasShow?: boolean;
  /**
   * Name of the command.
   * @type {string}
   */
  public name: string;
  /**
   * The command function.
   * @type {Function}
   */
  public func: (message: Message, context: C & { dummy?: D }) => any;
  /**
   * The command permissions.
   * @type {?string|Object}
   */
  public perms?: string | {[perm: string]: CommandSetPerm};
  /**
   * Aliases for the command.
   * @type {?Object<string, CommandOrString>}
   */
  public aliases?: { [alias: string]: Command<D> | D } | string[];
  /**
   * Alias data for using at the `dummy` object.
   * @type {?Object<string, any>}
   */
  public aliasData?: {
    __aliasOf?: Command,
    [prop: string]: any,
  };
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
   * List of subcommands to show on help
   * @type {object}
   */
  public subHelps?: { [name: string]: ICommandSubHelp };
  /**
   * The description of the command.
   * @type {?string}
   */
  public description?: string;
  /**
   * An example of usage of the command.
   * Note: This replaces every occurrence of {p} with the prefix.
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
  public guildOnly: C extends TContext ? true : boolean;
  /**
   * If this command has a set custom prefix to be used.
   * @type {?string}
   */
  public customPrefix?: string;

  /**
   * Generate a command as alias from another.
   * @param {Command} cmd The command.
   * @param {string} name The name of the alias.
   * @param {Object<string, any>} data The alias data.
   * @returns {Command} The newly created command.
   */

  constructor(options: CommandOptions<D, C>) {
    this.config(options);
  }

  public config(options: CommandOptions<D, C>): this {
    if (!options) throw new Error("No options given.");
    if (!options.name) throw new Error("No name given.");
    if (!options.func && (options.aliasData ? !options.aliasData.__aliasOf : true)) {
      throw new Error(`No function given for ${options.name}.`);
    }

    this.name = options.name;

    this.show = options.show;

    this.aliasShow = options.aliasShow;

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

    (this as any).guildOnly = options.guildOnly == null ? true : Boolean(options.guildOnly);

    this.customPrefix = options.customPrefix || null;

    this.aliases = typeof options.aliases === "object" ?
      _.fromPairs(Object.entries(options.aliases).map(([k, v]) => typeof v === "object" ?
        [k, Command.aliasFrom(this, k, Object.assign({ show: false }, v))] :
        [k, null]
      )) :
      null;

    this.subHelps = typeof options.subHelps === "object" ? options.subHelps :
      null;
    return this;
  }

  /**
   * Execute the command!
   * @param {Message} msg The message
   * @param {Object} options The options
   * @returns {*} The result.
   */
  public exec(msg: Message, options: C & { dummy?: D }): any {
    // Object.entries(options).forEach(([k, v]) => this[k] = v);
    return this.func.call(this, msg, options);
  }

  /**
   * Set what command this command is alias of.
   * @param {Command} cmd The command.
   * @returns {Command} This command.
   */
  public alias(cmd: Command): this {
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
   * @param {boolean} [options.useEmbed=true] If it should use embed or not
   * @param {Guild} [options.guild] Guild
   * @returns {string|MessageEmbed} The result
   */
  public help(p: string, { useEmbed, guild }: { useEmbed?: true, guild?: Guild }): MessageEmbed;
  public help(p: string, { useEmbed, guild }: { useEmbed?: false, guild?: Guild }): string;
  public help(
    p: string, { useEmbed = true, guild }: { useEmbed?: boolean, guild?: Guild } = {}
  ): MessageEmbed | string {
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
${textAbstract(this.description, Constants.numbers.max.chars.MSG - 100)}
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
          this.description
            .replace(
              /{maxcases}/ig, String(Constants.numbers.max.CASES((guild || { members: { size: 0 } }).members.size))
            )
            .replace(
              /{name}/ig, this.name
            )
            .replace(
              /{p}/ig, p
            ),
          Constants.numbers.max.chars.DESC
        )
      );
    }
    if (typeof this.subHelps === "object" && this.subHelps) {
      const showTime = Object.keys(this.subHelps).filter(k => this.subHelps[k].subShow == null || this.subHelps[k].subShow);
      if (showTime.length > 0) {
        embed.addField(`Subpages (Specify after \`${this.customPrefix || p}help ${this.name}\`)`, showTime.join(", "));
      }
    }
    if (this.perms) {
      let string = "";
      let filtered: Array<[string, CommandSetPerm]>;
      let onlyFalse: typeof filtered;
      if (typeof this.perms === "string") {
        string = `\`${this.perms.replace(/\./g, " ")}\``;
        if (this.default) string += " (available by default)";
      } else {
        filtered = Object.entries(this.perms).filter(([_n, perm]) => typeof perm === "boolean" ?
          true :
          (perm.show == null || perm.show)
        );
        onlyFalse = filtered.filter(([perm, on]) => typeof on === "boolean" ? !on : !(on || {}).default);
        for (const [key, val] of filtered) {
          string += `\`${key.replace(/\./g, " ")}\``;
          if (
            (
              typeof val === "boolean" ?
                val :
                (val != null && val.default)
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
    if (this.aliases) {
      embed.addField(
        "Aliases",
        textAbstract(
          Object.keys(this.aliases)
            .filter(k => this.aliases[k] && (this.aliases[k].aliasShow == null || this.aliases[k].aliasShow))
            .join(", "),
          Constants.numbers.max.chars.FIELD
        )
      );
    }
    if (this.example) {
      embed.addField("Example", _.trim(this.example).replace(/{p}/g, p).replace(/{name}/g, this.name), true);
    }
    return embed;
  }

  public subHelp(sub: string, p: string, guild?: Guild): MessageEmbed {
    const { subHelps } = this;
    if (!sub || !subHelps || !Object.keys(subHelps).length) return null;
    let obj: ICommandSubHelp;
    let parent: string;
    if (sub in subHelps) {
      obj = subHelps[sub];
    } else {
      parent = Object.getOwnPropertyNames(subHelps).find(s => subHelps[s].aliases && subHelps[s].aliases.includes(sub));
      if (!parent) return null;
      obj = subHelps[parent];
    }
    if (!p) {
      throw new TypeError("No prefix given.");
    }
    let usedargs = "";
    if (obj.args) {
      Object.entries([obj.args, usedargs += " "][0]).map(([a, v]) => {
        if (typeof v === "boolean" ? v : v.optional) {
          usedargs += (usedargs.endsWith(" ") ? `[${a}]` : ` [${a}]`);
        } else {
          usedargs += (usedargs.endsWith(" ") ? `{${a}}` : ` {${a}}`);
        }
      });
    }
    const isSubInTitle: boolean = obj.useSubTitle == null || obj.useSubTitle;
    const embed = new MessageEmbed();
    embed
      .setColor("RANDOM")
      .setTitle(`\`${this.customPrefix || p}${this.name}${isSubInTitle ? ` ${obj.preArgs || sub}` : ""} \` ${this.private ?
        " (Dev-only)" :
        ""}${obj.default ?
          " (Usable by default)" :
          ""}${this.guildOnly ?
            " (Not usable in DMs)" :
            ""}${isSubInTitle ? "" : `
**Subpage «${escMarkdown(sub)}»**`}`)
      .addField("Usage", `${this.customPrefix || p}${this.name} ${obj.preArgs || sub} ${usedargs}`);
    if (obj.description) {
      embed.setDescription(
        textAbstract(
          obj.description
            .replace(
              /{maxcases}/ig, String(Constants.numbers.max.CASES((guild || { members: { size: 0 } }).members.size))
            )
            .replace(
              /{name}/ig, sub
            )
            .replace(
              /{up}/g, this.name
            )
            .replace(
              /{p}/ig, p
            ),
          Constants.numbers.max.chars.DESC
        )
      );
    }
    if (obj.perms) {
      let string = "";
      let filtered: Array<[string, CommandSetPerm]>;
      let onlyFalse: typeof filtered;
      if (typeof obj.perms === "string") {
        string = `\`${obj.perms.replace(/\./g, " ")}\``;
        if (obj.default) string += " (available by default)";
      } else {
        filtered = Object.entries(obj.perms).filter(([_n, perm]) => typeof perm === "boolean" ?
          true :
          (perm.show == null || perm.show)
        );
        onlyFalse = filtered.filter(([perm, on]) => typeof on === "boolean" ? !on : !(on || {}).default);
        for (const [key, val] of filtered) {
          string += `\`${key.replace(/\./g, " ")}\``;
          if (
            (
              typeof val === "boolean" ?
                val :
                (val != null && val.default)
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
    if (obj.aliases) {
      embed.addField(
        "Aliases (of Subcommand)",
        textAbstract(
          obj.aliases.map(t => t === sub ? parent || "" : t).join(", "),
          Constants.numbers.max.chars.FIELD
        )
      );
    }
    if (obj.example) {
      embed.addField("Example", _.trim(obj.example).replace(/{p}/g, p).replace(/{name}/g, sub).replace(/{up}/g, this.name), true);
    }
    return embed;
  }

  public static aliasFrom<Dd, Cc extends Context>(cmd: Command<Dd, Cc>, name: string, data?: AliasData<Dd, Cc> & Dd) {
    const newData = cloneObject(data);
    Object.defineProperty(newData, "__aliasOf", {
      value: cmd,
      writable: false,
      enumerable: false,
      configurable: true
    });
    const newCmd = new Command<Dd, Cc>({
      name,
      func: cmd.func,
      aliasData: newData,
      category: cmd.category,
      customPrefix: cmd.customPrefix,
      devonly: cmd.private,
      aliases: data.aliases,
      subHelps: data.subHelps || cmd.subHelps,
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
}

export default Command;
