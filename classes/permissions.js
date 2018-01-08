const { GuildMember } = require("discord.js");
const _ = require("lodash");

// const { disabledcmds, permissions } = require("../sequelize/sequelize");
const { bot } = require("../util/bot");
const Constants = require("../misc/Constants");
const { db } = require("../util/deps");

function uncompress(str) {
    return Buffer.from(str + "=".repeat(str.length % 4), "base64").toString("hex");
}

/* interface IPermsResult {
  hasPerm: boolean;
  setPerm: boolean;
} */

const immune = [Constants.identifiers.OWNER];
exports.immune = immune;

class Permz {
  get permlist() {
    const obj = {};
    Object.entries(bot.commands).forEach(([cmd, v]) => {
      obj[cmd] = v.perms;
    });
    return obj;
  }

  get defaultPerms() {
    const arr = [];
    Object.entries(bot.commands).forEach(([cmdn, cmd]) => {
      if (cmd.default) {
        arr.push(cmd.perms);
      } else if (typeof cmd.perms !== "string") {
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
   * @param {string} guildId Guild to check
   * @param {string} perm The permission node to check (e.g. command.subcommand)
   * @param {boolean} [isDefault=false] If it is a default permission
   * @returns {Object}
   */
  checkPerm(member, guildId, perm, isDefault = false) {
    const [cmdname, extra] = _.toPath(perm);
    console.log(member.id, guildId, perm, isDefault);
    // if (extra1) whereobj.extra1 = extra1;
    // if (extra2) whereobj.extra2 = extra2;
    // if (extra3) whereobj.extra3 = extra3;
    const perms = db.table("perms").get(guildId, []).filter(item => item.type.startsWith("m") && uncompress(item.id) === member.id);
    let hasPerm = isDefault;
    let setPerm = false;
    const filtered = perms.find(item => item.command === "any" || item.command
     === cmdname);
    if (!filtered) { // no user perm that could influence the execution. Proceeding to role perms.
      const roles = member.roles.sort((a, b) => b.position - a.position).array();
      for (const role of roles) {
        const roleperms = db.table("perms").get(guildId, []).filter(it => it.type.startsWith("r") && it.id === role.id);
        if (roleperms.length < 1) {
          continue;
        }
        const item = roleperms.find(it => it.command === "any" || it.command === cmdname);
        if (!item) { // nothing that could influence the command execution. Check if is default.
          hasPerm = !!isDefault;
        } else { // yay there's a role perm. Let's check if it's negated.
            if (item.command === "any") {
              hasPerm = !item.negated;
              setPerm = true;
              break;
            } else if (item.extra == null) {
              hasPerm = !item.negated;
              setPerm = true;
            } else if (extra && item.extra === extra) {
              hasPerm = !item.negated;
              setPerm = true;
            }
        }
      }
    } else {
      if (filtered.command === "any") {
        hasPerm = !filtered.negated;
        setPerm = true;
      } else if (filtered.extra == null) {
        hasPerm = !filtered.negated;
        setPerm = true;
      } else if (extra && filtered.extra === extra) {
        hasPerm = !filtered.negated;
        setPerm = true;
      }
    }
    // hasPerm = immune.includes(member.id) ? true : hasPerm; // commented for testing permissions
    return {
      hasPerm,
      setPerm
    };
  }

  /**
   * Check if a command is disabled
   * @param {string} guildId The id of the guild
   * @param {string} channelid The id of the channel
   * @param {string} name The command name
   * @returns {string}
   */
  isDisabled(guildId, channelid, name) {
    const disabled = db.table("perms").get(guildId, [])
      .find(
        item => (item.command === "any" || item.command === name)
        && (item.type === "channel" || item.type === "guild")
        && item.negated,
        );
    if (!disabled) {
      return "";
    }
    if (disabled.type === "guild" || (disabled.type === "channel" && disabled.id === channelid)) {
      return disabled.type;
    }
    return "";
  }

  /**
   * Check permissions
   * @alias checkPerm
   * @param {GuildMember} member Member to check
   * @param {string} guildId Guild to check
   * @param {string} perm The permission node to check (e.g. command.subcommand)
   * @param {boolean} [isDefault=false] If it is a default permission
   * @returns {Promise<Object>}
   */
  hasPerm(member, guildId, perm, isDefault = false) {
    return this.checkPerm(member, guildId, perm, isDefault);
  }
}

module.exports = new Permz();
