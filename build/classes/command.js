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
