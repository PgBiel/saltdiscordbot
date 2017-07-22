"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const sequelize_1 = require("../sequelize/sequelize");
const bot_1 = require("../util/bot");
const deps_1 = require("../util/deps");
exports.immune = [deps_1.Constants.identifiers.OWNER];
class Permz {
    get permlist() {
        const obj = {};
        Object.entries(bot_1.bot.commands).forEach(([cmd, v]) => {
            obj[cmd] = v.perms;
        });
        return obj;
    }
    get defaultPerms() {
        const arr = [];
        Object.entries(bot_1.bot.commands).forEach(([cmdn, cmd]) => {
            if (cmd.default) {
                arr.push(cmd.perms);
            }
            else if (typeof cmd.perms !== "string") {
                Object.entries(cmd.perms).forEach(([permName, perm]) => {
                    if (perm === true) {
                        return arr.push(permName);
                    }
                    if (perm && perm.default) {
                        return arr.push(permName);
                    }
                });
            }
        });
        return arr;
    }
    /**
     * Check permissions
     * @param {GuildMember} member Member to check
     * @param {string} guildid Guild to check
     * @param {string} perm The permission node to check (e.g. command.subcommand)
     * @param {boolean} [isDefault=false] If it is a default permission
     * @returns {Promise<Object>}
     */
    async checkPerm(member, gueldid, perm, isDefault = false) {
        const [cmdname, extra] = _.toPath(perm);
        const whereobj = { serverid: gueldid, type: "user", thingid: member.id };
        // if (extra1) whereobj.extra1 = extra1;
        // if (extra2) whereobj.extra2 = extra2;
        // if (extra3) whereobj.extra3 = extra3;
        const perms = await sequelize_1.permissions.findAll({ where: whereobj });
        let hasPerm = false;
        let setPerm = false;
        const filtered = perms.filter((item) => item.command === cmdname || item.command
            === "any").sort((a, b) => a.command === "any" ? -1 : (b.command === "any" ? 1 : 0));
        if (filtered.length < 1) {
            whereobj.type = "role";
            const roles = member.roles.array().sort((a, b) => b.position - a.position);
            for (const role of roles) {
                whereobj.thingid = role.id;
                const roleperms = await sequelize_1.permissions.findAll({ where: whereobj });
                if (roleperms.length < 1) {
                    continue;
                }
                const rolefiltered = roleperms.filter((item) => item.command === cmdname || item.command
                    === "any").sort((a, b) => a.command === "any" ? -1 : (b.command === "any" ? 1 : 0));
                if (rolefiltered.length < 1) {
                    hasPerm = !!isDefault;
                }
                else {
                    rolefiltered.forEach((item) => {
                        if (item.command === "any") {
                            hasPerm = !item.disabled;
                            setPerm = true;
                        }
                        else if (item.extra == null) {
                            hasPerm = !item.disabled;
                            setPerm = true;
                        }
                        else if (extra && item.extra === extra) {
                            hasPerm = !item.disabled;
                            setPerm = true;
                        }
                    });
                }
            }
        }
        else {
            filtered.forEach((item) => {
                if (item.command === "any") {
                    hasPerm = !item.disabled;
                    setPerm = true;
                }
                else if (item.extra == null) {
                    hasPerm = !item.disabled;
                    setPerm = true;
                }
                else if (extra && item.extra === extra) {
                    hasPerm = !item.disabled;
                    setPerm = true;
                }
            });
        }
        // hasPerm = immune.includes(member.id) ? true : hasPerm; // commented for testing permissions
        return {
            hasPerm,
            setPerm,
        };
    }
    /**
     * Check if a command is disabled
     * @param {string} guildid The id of the guild
     * @param {string} channelid The id of the channel
     * @param {string} name The command name
     * @returns {Promise<string>}
     */
    async isDisabled(gueldid, channelid, name) {
        const disabled = await sequelize_1.disabledcmds
            .findOne({ where: { serverid: gueldid, command: name } });
        if (!disabled) {
            return "";
        }
        if (disabled.type === "server") {
            return disabled.type;
        }
        if (disabled.type === "channel") {
            if (disabled.channelid === channelid) {
                return disabled.type;
            }
        }
        return disabled ? disabled.type : "";
    }
    /**
     * Check permissions
     * @alias checkPerm
     * @param {GuildMember} member Member to check
     * @param {string} guildid Guild to check
     * @param {string} perm The permission node to check (e.g. command.subcommand)
     * @param {boolean} [isDefault=false] If it is a default permission
     * @returns {Promise<Object>}
     */
    hasPerm(member, gueldid, perm, isDefault = false) {
        return this.checkPerm(member, gueldid, perm, isDefault);
    }
}
exports.default = new Permz();
