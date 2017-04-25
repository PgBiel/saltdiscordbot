import { GuildMember } from "discord.js";
import * as _ from "lodash";

import { disabledcmds, permissions } from "../sequelize/sequelize";
import { bot } from "../util/bot";

interface IAnyObj {
  [prop: string]: any;
}

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
    Object.entries(bot.commands).forEach(
      ([cmd, v]) => v.default ?
       arr.push(v.perms) :
        (typeof v === "string" ? null : Object.entries(v).forEach(([perm, vv]) => {
      if (vv === true) {
        return arr.push(perm);
      }
      if (vv && vv.default) {
        return arr.push(perm);
      }
    })));
    return arr;
  }

  /**
   * Check permissions
   * @param {GuildMember} member Member to check
   * @param {string} guildid Guild to check
   * @param {string} perm The permission node to check (e.g. command.subcommand)
   * @param {boolean} [isDefault=false] If it is a default permission
   * @returns {Promise<boolean>}
   */
  public async checkPerm(member: GuildMember, gueldid: string, perm: string, isDefault: boolean = false) {
    const [cmdname, extra] = _.toPath(perm);
    const whereobj = { serverid: gueldid, type: "user", thingid: member.id };
    // if (extra1) whereobj.extra1 = extra1;
    // if (extra2) whereobj.extra2 = extra2;
    // if (extra3) whereobj.extra3 = extra3;
    const thingy: IAnyObj[] = await permissions.findAll({ where: whereobj });
    let hasPerm = false;
    const thingyfiltered = thingy.filter((item: any) => item.command === cmdname || item.command
     === "any").sort((a, b) => a.command === "any" ? -1 : (b.command === "any" ? 1 : 0));
    if (thingyfiltered.length < 1) {
      whereobj.type = "role";
      const roles = [];
      member.roles.forEach(roles.push.bind(roles));
      roles.sort((a, b) => b.position - a.position);
      for (const role of roles) {
        whereobj.thingid = role.id;
        const attempt: IAnyObj[] = await permissions.findAll({ where: whereobj });
        if (attempt.length < 1) {
          continue;
        }
        const attemptfiltered = attempt.filter((item: any) => item.command === cmdname || item.command
     === "any").sort((a, b) => a.command === "any" ? -1 : (b.command === "any" ? 1 : 0));
        if (attemptfiltered.length < 1) {
          hasPerm = !!isDefault;
        } else {
          attemptfiltered.forEach((item: any) => {
            if (item.command === "all") {
              hasPerm = !item.disabled;
            } else if (item.extra === null) {
              hasPerm = !item.disabled;
            } else if (extra && item.extra === extra) {
              hasPerm = !item.disabled;
            }
          });
        }
      }
    } else {
      thingyfiltered.forEach((item: any) => {
        if (item.command === "all") {
          hasPerm = !item.disabled;
        } else if (item.extra === null) {
          hasPerm = !item.disabled;
        } else if (extra && item.extra === extra) {
          hasPerm = !item.disabled;
        }
      });
    }
    return hasPerm;
  }

  /**
   * Check if a command is disabled
   * @param {string} guildid The id of the guild
   * @param {string} channelid The id of the channel
   * @param {string} name The command name
   * @returns {Promise<string>}
   */
  public async isDisabled(gueldid: string, channelid: string, name: string): Promise<string> {
    const thingy: {[prop: string]: any} = await disabledcmds.findOne({ where: { serverid: gueldid, command: name } });
    if (!thingy) {
      return "";
    }
    if (thingy.type === "server") {
      return thingy.type;
    }
    if (thingy.type === "channel") {
      if (thingy.channelid === channelid) {
        return thingy.type;
      }
    }
    return thingy ? thingy.type : "";
  }

  /**
   * Check permissions
   * @alias checkPerm
   * @param {GuildMember} member Member to check
   * @param {string} guildid Guild to check
   * @param {string} perm The permission node to check (e.g. command.subcommand)
   * @param {boolean} [isDefault=false] If it is a default permission
   * @returns {Promise<boolean>}
   */
  public hasPerm(member: GuildMember, gueldid: string, perm: string, isDefault: boolean = false) {
    return this.checkPerm(member, gueldid, perm, isDefault);
  }
}

export default new Permz();
