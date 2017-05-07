"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const deps_1 = require("../util/deps");
const funcs_1 = require("../util/funcs");
const func = async (msg, { args, send, reply, prefix, botmember }) => {
    const sendIt = (emb) => {
        return send({ embed: emb, autocatch: false }).catch((err) => err.status === 403 ?
            send("Please make sure I can send embeds in this channel.") :
            void (funcs_1.rejct(err)));
    };
    const categories = {};
    Object.entries(deps_1.bot.commands).forEach(([k, v]) => {
        let category = "Uncategorized";
        if (v.category) {
            category = v.category.replace(/^\w/, (m) => m.toUpperCase());
        }
        if (!categories[category]) {
            categories[category] = {};
        }
        categories[category][v.name] = v;
    });
    if (!args || deps_1._.trim(args.toLowerCase()) === "all") {
        const embed = new discord_js_1.RichEmbed();
        embed
            .setColor("RANDOM")
            .setTitle("List of commands")
            .setDescription("Commands available.");
        Object.entries(categories).forEach(([k, v]) => {
            let str = "";
            Object.keys(v).forEach((k2) => {
                str += k2 + "\n\n";
            });
            embed.addField(k, deps_1._.trim(str), true);
        });
        sendIt(embed);
    }
    else if (deps_1._.trim(args.toLowerCase().replace(/^\w/, (m) => m.toUpperCase())) in categories) {
        const category = deps_1._.trim(args.toLowerCase().replace(/^\w/, (m) => m.toUpperCase()));
        const embed = new discord_js_1.RichEmbed();
        embed
            .setColor("RANDOM")
            .setTitle(`List of commands in category "${category}"`)
            .setDescription("All commands available in that category.");
        let str = "";
        Object.values(categories[category]).forEach((cmd) => {
            str += cmd.name + "\n\n";
        });
        str = deps_1._.trim(str);
        embed.addField("Commands", str);
        sendIt(embed);
    }
    else if (deps_1._.trim(args.toLowerCase()) in deps_1.bot.commands) {
        const cmdn = deps_1._.trim(args.toLowerCase());
        const embed = deps_1.bot.commands[cmdn].help(prefix, true);
        sendIt(embed);
    }
    else {
        let cmdToUse = null;
        Object.values(deps_1.bot.commands).forEach((cmd) => {
            if (cmdToUse) {
                return;
            }
            if (cmd.aliases) {
                Object.values(cmd.aliases).forEach((alias) => {
                    if (cmdToUse) {
                        return;
                    }
                    if (alias.name.toLowerCase() === deps_1._.trim(args).toLowerCase()) {
                        cmdToUse = alias;
                    }
                });
            }
        });
        if (!cmdToUse) {
            return reply("Unknown command/category!");
        }
        sendIt(cmdToUse.help(prefix, true));
    }
};
exports.help = new command_1.default({
    func,
    name: "help",
    description: "Show information about commands/a command/a category of commands.",
    example: "{p}help\n{p}help 8ball\n{p}help fun",
    category: "Utility",
    args: { "command or category": true },
    guildOnly: false,
});
