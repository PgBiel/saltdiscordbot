import cloneObject from "../util/cloneObject";
import p from "../../classes/permissions";
import logger from "../../classes/logger";
import { CommandPerms } from "../../classes/command";
import { GuildMember } from "discord.js";

interface IReturnVal {
  parsedPerms: {
    [prop: string]: boolean;
  };
  setPerms: {
    [prop: string]: boolean;
  };
}

/**
 * Fetch multiple permissions.
 * @param {*} perms Permissions
 * @param {GuildMember} member The member
 * @param {boolean} [defaultPerm=false] The default permission (if only using a single perm)
 * @returns {object} Parsed and set perms
 */
export default async function fetchPerms(
  perms: CommandPerms, member: GuildMember, defaultPerm = false
): Promise<IReturnVal> {
  const permsToCheck = typeof perms === "string" ? // a single perm or...
    {} :
    cloneObject(perms); // ...multiple perms?
  if (typeof perms === "string") {
    permsToCheck[perms] = Boolean(defaultPerm); // (treat it like multiple but add it to object)
  }

  const obj: IReturnVal = { parsedPerms: {}, setPerms: {} };
  for (const permission in permsToCheck) {
    if (!permsToCheck.hasOwnProperty(permission)) {
      continue;
    }
    const perme = permsToCheck[permission];
    const isDefault = typeof perme === "boolean" ? perme : perme.default; // if perm is default
    try {
      // execute hasPerm to check perm
      const permsResult = await p.hasPerm(member, member.guild.id, permission, isDefault);
      logger.debug("Result: " + require("util").inspect(permsResult) + " . Permission: " + permission);
      obj.parsedPerms[permission] = Boolean(permsResult.hasPerm); // add if has perm
      obj.setPerms[permission] = Boolean(permsResult.setPerm); // add if perm was set or is it default
    } catch (err) {
      obj.parsedPerms[permission] = false; // ¯\_(ツ)_/¯
      obj.setPerms[permission] = false;
      logger.custom(err, { prefix: `[ERR/PERMCHECK]`, color: "red", type: "error" });
    }
  }
  return obj;
}
