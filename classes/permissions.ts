import { GuildMember } from "discord.js";
import * as _ from "lodash";

import { disabledcmds, permissions } from "../sequelize/sequelize";
import { bot } from "../util/bot";
import { Constants } from "../util/deps";

interface IAnyObj {
  [prop: string]: any;
}

interface IPermsResult {
  hasPerm: boolean;
  setPerm: boolean;
}

export const immune = [Constants.identifiers.OWNER];

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
   * @param {string} guildid Guild to check
   * @param {string} perm The permission node to check (e.g. command.subcommand)
   * @param {boolean} [isDefault=false] If it is a default permission
   * @returns {Promise<Object>}
   */
  public async checkPerm(
    member: GuildMember, gueldid: string, perm: string, isDefault: boolean = false,
  ): Promise<IPermsResult> {
    const [cmdname, extra] = _.toPath(perm);
    const whereobj = { serverid: gueldid, type: "user", thingid: member.id };
    // if (extra1) whereobj.extra1 = extra1;
    // if (extra2) whereobj.extra2 = extra2;
    // if (extra3) whereobj.extra3 = extra3;
    const perms: IAnyObj[] = await permissions.findAll({ where: whereobj });
    let hasPerm = false;
    let setPerm = false;
    const filtered = perms.filter((item: any) => item.command === cmdname || item.command
     === "any").sort((a, b) => a.command === "any" ? -1 : (b.command === "any" ? 1 : 0));
    if (filtered.length < 1) { // no user perm that could influence the execution. Proceeding to role perms.
      whereobj.type = "role";
      const roles = member.roles.array().sort((a, b) => b.position - a.position);
      for (const role of roles) {
        whereobj.thingid = role.id;
        const roleperms: IAnyObj[] = await permissions.findAll({ where: whereobj });
        if (roleperms.length < 1) {
          continue;
        }
        const rolefiltered = roleperms.filter((item: any) => item.command === cmdname || item.command
     === "any").sort((a, b) => a.command === "any" ? -1 : (b.command === "any" ? 1 : 0));
        if (rolefiltered.length < 1) { // nothing that could influence the command execution. Check if is default.
          hasPerm = !!isDefault;
        } else {
          rolefiltered.forEach((item: any) => { // yay there's a role perm. Let's check if it's negated.
            if (item.command === "any") {
              hasPerm = !item.disabled;
              setPerm = true;
            } else if (item.extra == null) {
              hasPerm = !item.disabled;
              setPerm = true;
            } else if (extra && item.extra === extra) {
              hasPerm = !item.disabled;
              setPerm = true;
            }
          });
        }
      }
    } else {
      filtered.forEach((item: any) => {
        if (item.command === "any") {
          hasPerm = !item.disabled;
          setPerm = true;
        } else if (item.extra == null) {
          hasPerm = !item.disabled;
          setPerm = true;
        } else if (extra && item.extra === extra) {
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
  public async isDisabled(gueldid: string, channelid: string, name: string): Promise<string> {
    const disabled: {[prop: string]: any} = await disabledcmds
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
  public hasPerm(member: GuildMember, gueldid: string, perm: string, isDefault: boolean = false) {
    return this.checkPerm(member, gueldid, perm, isDefault);
  }
}

export default new Permz();
