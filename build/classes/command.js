"use strict";
/**
 * An argument.
 * @typedef {Object} CommandArgument
 * @property {boolean} optional If this argument is optional or not
 */
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const funcs_1 = require("../util/funcs");
const _ = require("lodash");
class Command {
    /**
     * Generate a command as alias from another.
     * @param {Command} cmd The command.
     * @param {string} name The name of the alias.
     * @param {Object<string, any>} data The alias data.
     * @returns {Command} The newly created command.
     */
    static aliasFrom(cmd, name, data) {
        const newData = funcs_1.cloneObject(data);
        Object.defineProperty(newData, "__aliasOf", {
            value: cmd,
            writable: false,
            enumerable: false,
            configurable: true,
        });
        const newCmd = new Command({
            name,
            func: null,
            aliasData: newData,
            category: cmd.category,
            customPrefix: cmd.customPrefix,
            devonly: cmd.private,
            perms: data.perms || cmd.perms,
            default: data.default || cmd.default,
            pattern: data.pattern || cmd.pattern,
            description: data.description || cmd.description,
            example: data.example || null,
            args: data.args || cmd.args,
        });
        return newCmd;
    }
    constructor(options) {
        if (!options.name) {
            throw new Error("No name given.");
        }
        if (!options.func && (options.aliasData ? !options.aliasData.__aliasOf : true)) {
            throw new Error(`No function given for ${options.name}.`);
        }
        this.name = options.name;
        this.func = options.func;
        this.perms = options.perms;
        this.aliases = options.aliases;
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
    }
    /**
     * Set what command this command is alias of.
     * @param {Command} cmd The command.
     * @returns {Command} This command.
     */
    setAlias(cmd) {
        if (!this.aliasData) {
            this.aliasData = {};
        }
        Object.defineProperty(this.aliasData, "__aliasOf", {
            value: cmd,
            writable: false,
            enumerable: false,
            configurable: true,
        });
        return this;
    }
    help(p, useEmbed = false) {
        if (!p) {
            throw new TypeError("No prefix given.");
        }
        let usedargs = "";
        if (this.args) {
            Object.entries([this.args, usedargs += " "][0]).map(([a, v]) => {
                if (typeof v === "boolean" ? v : v.optional) {
                    usedargs += (usedargs.endsWith(" ") ? `[${a}]` : ` [${a}]`);
                }
                else {
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
${this.description}
Usage: ${this.customPrefix || p}${this.name}${usedargs}${this.example ?
                `\n\nExample: ${_.trim(this.example).replace(/{p}/g, p)}` :
                ``}
\`\`\``;
        }
        const embed = new discord_js_1.RichEmbed();
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
            embed.setDescription(this.description);
        }
        if (this.example) {
            embed.addField("Example", _.trim(this.example).replace(/{p}/g, p), true);
        }
        return embed;
    }
}
exports.default = Command;
