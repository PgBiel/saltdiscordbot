"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _ = require("lodash");
const logger_1 = require("./classes/logger");
const permissions_1 = require("./classes/permissions");
const searcher_1 = require("./classes/searcher");
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
    const sendingFunc = (func) => {
        return (content, options) => {
            if (typeof content === "object" && !options && !(content instanceof Array)) {
                options = content;
                content = "";
            }
            else if (!options) {
                options = {};
            }
            const result = channel.send.bind(channel)(content, options);
            if (options.autoCatch == null || options.autoCatch) {
                result.catch(funcs_1.rejct);
            }
            return result;
        };
    };
    const reply = sendingFunc(msg.reply.bind(msg));
    const send = sendingFunc(channel.send.bind(channel));
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
    const promptAmbig = async (members) => {
        let satisfied = false;
        let cancelled = false;
        let currentOptions = [];
        members.forEach((gm) => currentOptions.push(gm));
        const filter = (msg2) => {
            const options = currentOptions;
            if (msg2.author.id !== msg.author.id) {
                return false;
            }
            if (msg2.content === "cancel" || msg2.content === "`cancel`") {
                cancelled = true;
                return true;
            }
            const tagOptions = options.map((gm) => gm.user.tag);
            if (tagOptions.includes(msg2.content)) {
                satisfied = true;
                currentOptions = [options[tagOptions.indexOf(msg2.content)]];
                return true;
            }
            const collOptions = new discord_js_1.Collection();
            options.forEach((gm) => {
                collOptions.set(gm.id, gm);
            });
            const searcher2 = new searcher_1.default({ members: collOptions });
            const resultingMembers = searcher2.searchMember(msg2.content);
            if (resultingMembers.length < 1) {
                return true;
            }
            if (resultingMembers.length > 1) {
                currentOptions = resultingMembers;
                return true;
            }
            satisfied = true;
            currentOptions = resultingMembers;
            return true;
        };
        reply(`Multiple members have matched that search. Please specify one.
This command will automatically cancel after 30 seconds. Type \`cancel\` to cancel.
__**Members Matched**__:
\`${currentOptions.map((gm) => gm.user.tag).join("`,`")}\``);
        for (let i = 0; i < 5; i++) {
            try {
                const result = await channel.awaitMessages(filter, {
                    time: deps_1.Constants.times.AMBIGUITY_EXPIRE, maxMatches: 1,
                    errors: ["time"],
                });
                if (satisfied) {
                    return {
                        member: currentOptions[0],
                        cancelled: false,
                    };
                }
                if (cancelled) {
                    send("Command cancelled.");
                    return {
                        member: null,
                        cancelled: true,
                    };
                }
                if (i < 5) {
                    reply(`Multiple members have matched that search. Please specify one.
This command will automatically cancel after 30 seconds. Type \`cancel\` to cancel.
**Members Matched**:
\`${currentOptions.map((gm) => gm.user.tag).join("`,`")}\``);
                }
            }
            catch (err) {
                send("Command cancelled.");
                return {
                    member: null,
                    cancelled: true,
                };
            }
        }
        send("Automatically cancelled command.");
        return {
            member: null,
            cancelled: true,
        };
    };
    const hasPermission = msg.member ? msg.member.hasPermission.bind(msg.member) : null;
    const userError = (data) => reply(`Sorry, but it seems there was an error while executing this command.\
    If you want to contact the bot devs, please tell them this information: \`${data}\`. Thanks!`);
    const context = {
        input, channel, message, msg, guildId,
        author: msg.author, member: msg.member,
        tag: `${msg.author.username}#${msg.author.discriminator}`,
        reply, send, hasPermission, hasPermissions: hasPermission,
        botmember: msg.guild ? msg.guild.member(bot_1.bot.user) : null,
        searcher: msg.guild ? new searcher_1.default({ guild: msg.guild }) : null,
        checkRole, promptAmbig,
    };
    const possiblePrefix = msg.guild ?
        (await sequelize_1.prefixes.findOne({ where: { serverid: msg.guild.id } })).prefix || "+" :
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
        const authorTag = subContext.authorTag = `${msg.author.username}#${msg.author.discriminator}`;
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
        else {
            subContext.perms = null;
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
            logger_1.default.error(`At Execution: ${err}`);
            return userError("AT EXECUTION");
        }
    }
};
