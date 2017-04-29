"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _ = require("lodash");
const logger_1 = require("./classes/logger");
const permissions_1 = require("./classes/permissions");
const sequelize_1 = require("./sequelize/sequelize");
const bot_1 = require("./util/bot");
const deps_1 = require("./util/deps");
const funcs_1 = require("./util/funcs");
const doError = logger_1.default.error;
exports.default = async (msg) => {
    const input = msg.content;
    const channel = msg.channel;
    const message = msg;
    const guildId = msg.guild ? msg.guild.id : null;
    const reply = (content, options = {}) => {
        const result = msg.reply.bind(msg)(content, options);
        if (options.autoCatch == null || options.autoCatch) {
            result.catch(funcs_1.rejct);
        }
        return result;
    };
    const send = (content, options = {}) => {
        const result = channel.send.bind(channel)(content, options);
        if (options.autoCatch == null || options.autoCatch) {
            result.catch(funcs_1.rejct);
        }
        return result;
    };
    const checkRole = async (role, member) => {
        if (["mod", "admin"].includes(role)) {
            role = role === "mod" ? "moderator" : "administrator";
        }
        if (!guildId) {
            return false;
        }
        const result = await sequelize_1.moderation.findOne({ where: { serverid: guildId } });
        if (!result || !result[role]) {
            return false;
        }
        if (member.roles && member.roles.get(result[role])) {
            return true;
        }
        return false;
    };
    const hasPermission = msg.member.hasPermission;
    const userError = (data) => reply(`Sorry, but it seems there was an error while executing this command.\
    If you want to contact the bot devs, please tell them this information: \`${data}\`. Thanks!`);
    const context = {
        input, channel, message, msg, guildId,
        reply, send, hasPermission, hasPermissions: hasPermission,
        botmember: msg.guild ? msg.guild.member(bot_1.bot.user) : null,
        checkRole,
    };
    const possiblePrefix = msg.guild ?
        (await sequelize_1.prefixes.findOne({ where: { serverid: msg.guild.id } })) || "+" :
        "+";
    for (const cmdn in bot_1.bot.commands) {
        if (!bot_1.bot.commands.hasOwnProperty(cmdn)) {
            continue;
        }
        const subContext = context;
        const cmd = bot_1.bot.commands[cmdn];
        if (!cmd.name || !cmd.func) {
            continue;
        }
        let prefix;
        if (cmd.customPrefix) {
            prefix = cmd.customPrefix;
        }
        else {
            prefix = possiblePrefix;
        }
        if (cmd.guildOnly && !msg.guild) {
            continue;
        }
        subContext.prefix = prefix;
        const mentionfix = input.startsWith(`<@${bot_1.bot.user.id}> `) ? `<@${bot_1.bot.user.id}> ` : null;
        const usedPrefix = mentionfix || prefix || "+";
        if (!message.content.toUpperCase().startsWith(usedPrefix.toUpperCase())) {
            continue;
        }
        const instruction = subContext.instruction = input.replace(new RegExp(`^${_.escapeRegExp(usedPrefix)}`), "");
        const checkCommandRegex = cmd.pattern || new RegExp(`^${_.escapeRegExp(cmd.name)}\s{0,4}$`);
        if (!checkCommandRegex.test(instruction)) {
            continue;
        }
        const authorTag = subContext.authorTag = `${msg.author.username}#${msg.author.discriminator}`;
        logger_1.default.custom(// log when someone does a command.
        `User ${deps_1.chalk.cyan(authorTag)}, ${channel instanceof discord_js_1.TextChannel ?
            `at channel ${deps_1.chalk.cyan("#" + channel.name)} of ${deps_1.chalk.cyan(msg.guild.name)}` :
            `in DMs with Salt`}, ran command ${deps_1.chalk.cyan(cmd.name)}.`, "[CMD]", "magenta");
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
        if (cmd.perms) {
            const permsToCheck = typeof cmd.perms === "string" ?
                {} :
                funcs_1.cloneObject(cmd.perms);
            if (typeof cmd.perms === "string") {
                permsToCheck[cmd.perms] = Boolean(cmd.default);
            }
            const parsedPerms = {};
            for (const permission in permsToCheck) {
                if (!permsToCheck.hasOwnProperty(permission)) {
                    continue;
                }
                const isDefault = Boolean(permsToCheck[permission]);
                try {
                    parsedPerms[permission] = Boolean(await permissions_1.default.hasPerm(msg.member, guildId, permission, isDefault));
                }
                catch (err) {
                    parsedPerms[permission] = false; // ¯\_(ツ)_/¯
                    logger_1.default.custom(err, `[ERR/PERMCHECK]`, "red", "error");
                }
            }
            subContext.perms = parsedPerms;
        }
        const cmdRegex = new RegExp(`^${_.escapeRegExp(cmd.name)}\\s*`, "i");
        const args = subContext.args = instruction.replace(cmdRegex, "").length < 1 ?
            null :
            instruction.replace(cmdRegex, ""); // yes
        subContext.arrArgs = args ? args.split(" ") : []; // array form of arguments.
        // and finally... we execute the command.
        try {
            const result = cmd.func(message, subContext);
            if (result instanceof Promise) {
                result.catch(funcs_1.rejct);
            }
        }
        catch (err) {
            return userError("AT EXECUTION");
        }
    }
};
