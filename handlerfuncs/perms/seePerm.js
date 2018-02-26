const hasPermission = require("./hasPermission");
const checkRole = require("./checkRole");

module.exports = msg => {
  return async (perm, perms, setPerms, { srole, hperms }) => {
    if (setPerms[perm] && perms[perm]) return true;
    if (hperms && hasPermission(msg)(Array.isArray(hperms) ? hperms : [hperms])) return true;
    if (srole && await (checkRole(msg)(srole))) return true;
    return perms[perm] || false;
  };
};