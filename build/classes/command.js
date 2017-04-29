/**
 * An argument.
 * @typedef {Object} CommandArgument
 * @property {boolean} optional If this argument is optional or not
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _ = require("lodash");
class Command {
    constructor(options) {
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
    help(p, useEmbed = false) {
        if (!p) {
            throw new TypeError("No prefix given.");
        }
        let usedargs = "";
        if (this.args) {
            Object.entries([this.args, usedargs += " "][0]).map(([a, v]) => {
                if (v.optional) {
                    usedargs += (usedargs.endsWith(" ") ? `[${a}]` : ` [${a}]`);
                }
                else {
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
        const embed = new discord_js_1.RichEmbed();
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
exports.default = Command;
