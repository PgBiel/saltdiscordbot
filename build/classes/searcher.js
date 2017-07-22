"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const deps_1 = require("../util/deps");
/**
 * Utility class for searching for members,
 * channels, and roles.
 */
class Searcher {
    /**
     * @param {SearcherOptions} options The options
     */
    constructor(options) {
        const { guild, members, roles, channels } = options;
        if (guild) {
            this.guild = guild;
            this.roles = guild.roles;
            this.channels = guild.channels;
            this.members = guild.members;
        }
        if (roles) {
            if (roles instanceof Array) {
                const rolesToUse = new discord_js_1.Collection();
                for (const role of roles) {
                    rolesToUse.set(role.id, role);
                }
                this.roles = rolesToUse;
            }
            else {
                this.roles = roles;
            }
        }
        if (channels) {
            if (channels instanceof Array) {
                const channelsToUse = new discord_js_1.Collection();
                for (const channel of channels) {
                    channelsToUse.set(channel.id, channel);
                }
                this.channels = channelsToUse;
            }
            else {
                this.channels = channels;
            }
        }
        if (members) {
            if (members instanceof Array) {
                const membersToUse = new discord_js_1.Collection();
                for (const member of members) {
                    membersToUse.set((member instanceof discord_js_1.GuildMember || member instanceof discord_js_1.User) ?
                        member.id :
                        member.toString(), member);
                }
                this.members = membersToUse;
            }
            else {
                this.members = members;
            }
        }
    }
    /**
     * Search for a member.
     * @param {string|RegExp} nameOrPattern The name/nickname to look for or pattern to test for
     * @returns {Array<MemberColl>} The result(s)
     */
    searchMember(nameOrPattern) {
        const pattern = nameOrPattern instanceof RegExp ?
            nameOrPattern :
            new RegExp(deps_1._.escapeRegExp(nameOrPattern), "i");
        const match = [];
        const getUser = (member) => {
            const userToUse = member instanceof discord_js_1.GuildMember ?
                member.user :
                member instanceof discord_js_1.User ?
                    member :
                    null;
            return userToUse;
        };
        if (typeof nameOrPattern === "string" && deps_1.Constants.regex.NAME_AND_DISCRIM.test(nameOrPattern)) {
            const result = this.members.find((memb) => getUser(memb).tag === nameOrPattern);
            if (result) {
                match.push(result);
                return match;
            }
        }
        for (const [id, member] of this.members) {
            const userToUse = getUser(member);
            if ((typeof nameOrPattern === "string" && userToUse.username === nameOrPattern)
                || (typeof nameOrPattern !== "string" && pattern.test(userToUse.username))) {
                match.push(member);
            }
        }
        if (match.length < 1 && typeof nameOrPattern === "string") {
            for (const [id, member] of this.members) {
                const userToUse = getUser(member);
                if (pattern.test(userToUse.username)) {
                    match.push(member);
                }
            }
        }
        // if (match.length < 1) {
        for (const [id, member] of this.members) {
            if (pattern.test(member instanceof discord_js_1.GuildMember ? member.nickname : getUser(member).username)) {
                let shouldContinue = false;
                match.forEach((m) => {
                    if (shouldContinue) {
                        return;
                    }
                    if ((getUser(m) ? getUser(m).id : m) === (getUser(member) || { id: member }).id) {
                        shouldContinue = true;
                    }
                });
                if (shouldContinue) {
                    continue;
                }
                match.push(member);
            }
        }
        // }
        if (match.length < 1 && typeof nameOrPattern === "string") {
            if (this.members.has(nameOrPattern)) {
                match.push(this.members.get(nameOrPattern));
            }
        }
        deps_1.logger.debug(match.toString());
        return match;
    }
    searchChannel(nameOrPattern, type) {
        const pattern = nameOrPattern instanceof RegExp ?
            nameOrPattern :
            new RegExp(deps_1._.escapeRegExp(nameOrPattern), "i");
        const match = [];
        let toLook;
        switch (type) {
            case "text":
                toLook = this.channels.filter((c) => c.type === "text");
                break;
            case "voice":
                toLook = this.channels.filter((c) => c.type === "voice");
                break;
            default:
                toLook = this.channels;
                break;
        }
        for (const [id, channel] of toLook) {
            if ((typeof nameOrPattern === "string" && channel.name === nameOrPattern)
                || (typeof nameOrPattern !== "string" && pattern.test(channel.name))) {
                match.push(channel);
            }
        }
        if (match.length < 1 && typeof nameOrPattern === "string") {
            for (const [id, channel] of toLook) {
                if (pattern.test(channel.name)) {
                    match.push(channel);
                }
            }
            if (match.length < 1 && toLook.has(nameOrPattern)) {
                match.push(toLook.get(nameOrPattern));
            }
        }
        return match;
    }
    /**
     * Search for a role.
     * @param {string|RegExp} nameOrPattern The name to look for or pattern to test for
     * @returns {Array<Role>} The result(s)
     */
    searchRole(nameOrPattern) {
        const pattern = nameOrPattern instanceof RegExp ?
            nameOrPattern :
            new RegExp(deps_1._.escapeRegExp(nameOrPattern), "i");
        const match = [];
        for (const [id, role] of this.roles) {
            if ((typeof nameOrPattern === "string" && role.name === nameOrPattern)
                || (typeof nameOrPattern !== "string" && pattern.test(role.name))) {
                match.push(role);
            }
        }
        if (match.length < 1 && typeof nameOrPattern === "string") {
            for (const [id, role] of this.roles) {
                if (pattern.test(role.name)) {
                    match.push(role);
                }
            }
            if (match.length < 1) {
                if (this.roles.has(nameOrPattern)) {
                    match.push(this.roles.get(nameOrPattern));
                }
            }
        }
        return match;
    }
}
exports.default = Searcher;
