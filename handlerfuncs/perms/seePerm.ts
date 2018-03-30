import hasPermission from "./hasPermission";
import checkRole, { SaltRole } from "./checkRole";
import { Message, RecursiveArray, PermissionResolvable } from "discord.js";

interface IPermObj {
  [perm: string]: boolean;
}

export default (msg: Message) => {
  return async (
    perm: string, perms: IPermObj, setPerms: IPermObj,
    { srole, hperms }: { srole?: SaltRole, hperms?: PermissionResolvable | PermissionResolvable[] } = {}
  ): Promise<boolean> => {
    if (setPerms[perm] && perms[perm]) return true;
    if (hperms && hasPermission(msg)(Array.isArray(hperms) ? hperms : [hperms])) return true;
    if (srole && await (checkRole(msg)(srole, msg.member))) return true;
    return perms[perm] || false;
  };
};
