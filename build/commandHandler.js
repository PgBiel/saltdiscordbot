"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _ = require("lodash");
const logger_1 = require("./classes/logger");
const permissions_1 = require("./classes/permissions");
const searcher_1 = require("./classes/searcher");
const commandHandlerFuncs_1 = require("./commandHandlerFuncs");
const sequelize_1 = require("./sequelize/sequelize");
const bot_1 = require("./util/bot");
const deps_1 = require("./util/deps");
const funcs_1 = require("./util/funcs");
__export(require("./commandHandlerFuncs"));
const doError = logger_1.default.error;
exports.default = async (msg) => {
    const input = msg.content;
    const channel = msg.channel;
    const message = msg;
    const guildId = msg.guild ? msg.guild.id : null;
    const { hasPermission, userError, promptAmbig, checkRole, send, reply, doEval, prompt, actionLog, } = commandHandlerFuncs_1.default(msg);
    const context = {
        input, channel, message, msg, guildId,
        author: msg.author, member: msg.member,
        tag: `${msg.author.username}#${msg.author.discriminator}`,
        guild: msg.guild, dummy: {},
        reply, send, hasPermission, hasPermissions: hasPermission,
        botmember: msg.guild ? msg.guild.member(bot_1.bot.user) : null,
        searcher: msg.guild ? new searcher_1.default({ guild: msg.guild }) : null,
        checkRole, promptAmbig, userError, doEval, prompt, actionLog,
    };
    let possiblePrefix = msg.guild ?
        (await sequelize_1.prefixes.findOne({ where: { serverid: msg.guild.id } })) || "+" :
        "+";
    if (!possiblePrefix) {
        possiblePrefix = "+";
    }
    if (possiblePrefix.prefix) {
        possiblePrefix = possiblePrefix.prefix;
    }
    for (const cmdn in bot_1.bot.commands) {
        if (!bot_1.bot.commands.hasOwnProperty(cmdn)) {
            continue;
        }
        const subContext = funcs_1.cloneObject(context);
        subContext.dummy = {};
        const cmd = bot_1.bot.commands[cmdn];
        const descCmd = cmd.aliasData && cmd.aliasData.__aliasOf ? cmd.aliasData.__aliasOf : cmd;
        if (!cmd.name || !descCmd.func) {
            continue;
        }
        let prefix;
        if (cmd.aliasData) {
            for (const key in cmd.aliasData) {
                if (!cmd.aliasData.hasOwnProperty(key)) {
                    continue;
                }
                subContext.dummy[key] = cmd.aliasData[key];
            }
        }
        if (descCmd.customPrefix) {
            prefix = descCmd.customPrefix;
        }
        else {
            prefix = possiblePrefix;
        }
        if (descCmd.guildOnly && !msg.guild) {
            continue;
        }
        subContext.prefix = prefix;
        const mentionfix = input.startsWith(`<@${bot_1.bot.user.id}> `) ? `<@${bot_1.bot.user.id}> ` : null;
        const usedPrefix = mentionfix || prefix || "+";
        if (!message.content.toUpperCase().startsWith(usedPrefix.toUpperCase())) {
            continue;
        }
        const instruction = subContext.instruction = input.replace(new RegExp(`^${_.escapeRegExp(usedPrefix)}`), "");
        const checkCommandRegex = cmd.pattern || new RegExp(`^${_.escapeRegExp(cmd.name)}(?:\\s{1,4}[^]*)?$`, "i");
        if (!checkCommandRegex.test(instruction)) {
            continue;
        }
        if (guildId) {
            try {
                const disabled = await permissions_1.default.isDisabled(guildId, channel.id, cmd.name);
                if (disabled) {
                    return send(":lock: That command is disabled for this " + disabled + "!");
                }
            }
            catch (err) {
                logger_1.default.error(`At disable: ${err}`);
                return userError(`AT DISABLE`);
            }
        }
        const authorTag = subContext.authorTag = msg.author.tag;
        logger_1.default.custom(// log when someone does a command.
        `User ${deps_1.chalk.cyan(authorTag)}, ${channel instanceof discord_js_1.TextChannel ?
            `at channel ${deps_1.chalk.cyan("#" + channel.name)} of ${deps_1.chalk.cyan(msg.guild.name)}` :
            `in DMs with Salt`}, ran command ${deps_1.chalk.cyan(cmd.name)}.`, "[CMD]", "magenta");
        if (cmd.perms && guildId) {
            const permsToCheck = typeof cmd.perms === "string" ?
                {} :
                funcs_1.cloneObject(cmd.perms);
            if (typeof cmd.perms === "string") {
                permsToCheck[cmd.perms] = Boolean(cmd.default);
            }
            const parsedPerms = {};
            const setPerms = {};
            for (const permission in permsToCheck) {
                if (!permsToCheck.hasOwnProperty(permission)) {
                    continue;
                }
                const isDefault = Boolean(permsToCheck[permission]);
                try {
                    const permsResult = await permissions_1.default.hasPerm(msg.member, guildId, permission, isDefault);
                    parsedPerms[permission] = Boolean(permsResult.hasPerm);
                    setPerms[permission] = Boolean(permsResult.setPerm);
                }
                catch (err) {
                    parsedPerms[permission] = false; // ¯\_(ツ)_/¯
                    setPerms[permission] = false;
                    logger_1.default.custom(err, `[ERR/PERMCHECK]`, "red", "error");
                }
            }
            subContext.perms = parsedPerms;
            subContext.setPerms = setPerms;
        }
        else {
            subContext.perms = null;
            subContext.setPerms = null;
        }
        const cmdRegex = new RegExp(`^${_.escapeRegExp(cmd.name)}\\s*`, "i");
        const args = subContext.args = instruction.replace(cmdRegex, "").length < 1 ?
            null :
            instruction.replace(cmdRegex, ""); // yes
        subContext.arrArgs = args ? args.split(" ") : []; // array form of arguments.
        subContext.self = subContext; // The context itself.
        // and finally... we execute the command.
        try {
            const result = descCmd.func(message, subContext);
            if (result instanceof Promise) {
                result.catch(funcs_1.rejct);
            }
        }
        catch (err) {
            logger_1.default.error(`At Execution: ${err}`);
            return userError("AT EXECUTION");
        }
    }
};
