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
    Object.entries(bot.commands).forEach(([cmd, v]) => v.default ? arr.push(v.perms) : (typeof v === "string" ? null : Object.entries(v).forEach(([perm, vv]) => {
      if (vv === true) return arr.push(perm);
      if (vv && vv.default) return arr.push(perm);
    })));
    return arr;
  }

  /**
   * Check permissions
   * @param {GuildMember} member Member to check
   * @param {string} guildid Guild to check
   * @param {string} perm The permission node to check (e.g. command.subcommand)
   * @param {boolean} [isDefault=false] If it is a default permission
   * @returns {boolean}
   */
  async checkPerm(member, gueldid, perm, isDefault = false) {
    const [cmdname, extra] = _.toPath(perm);
    const whereobj = { serverid: gueldid, type: "user", thingid: member.id };
    // if (extra1) whereobj.extra1 = extra1;
    // if (extra2) whereobj.extra2 = extra2;
    // if (extra3) whereobj.extra3 = extra3;
    const thingy = await permissions.findAll({ where: whereobj });
    let hasPerm = false;
    let returnvalue;
    const thingyfiltered = thingy.filter(item => item.command === cmdname || item.command
     === "any").sort((a, b) => a.command === "any" ? -1 : (b.command === "any" ? 1 : 0));
    if (thingyfiltered.length < 1) {
      whereobj.type = "role";
      const roles = [];
      member.roles.forEach(roles.push.bind(roles));
      roles.sort((a, b)=>b.position - a.position);
      for (const role of roles) {
        whereobj.thingid = role.id;
        const attempt = await permissions.findAll({ where: whereobj });
        if (attempt.length < 1) continue;
        const attemptfiltered = attempt.filter(item => item.command === cmdname || item.command
     === "any").sort((a, b) => a.command === "any" ? -1 : (b.command === "any" ? 1 : 0));
        if (attemptfiltered.length < 1) hasPerm = !!isDefault;
        else attemptfiltered.forEach(item => {
          if (item.command === "all") hasPerm = !item.disabled;
          else if (item.extra === null) hasPerm = !item.disabled;
          else if (extra && item.extra === extra) hasPerm = !item.disabled;
        });
      }
    } else 
      thingyfiltered.forEach(item => {
        if (item.command === "all") hasPerm = !item.disabled;
        else if (item.extra === null) hasPerm = !item.disabled;
        else if (extra && item.extra === extra) hasPerm = !item.disabled;
      });
    return hasPerm;
  }

  /**
   * Check if a command is disabled
   * @param {string} guildid The id of the guild
   * @param {string} channelid The id of the channel
   * @param {string} name The command name
   * @returns {boolean}
   */
  async isDisabled(gueldid, channelid, name) {
    const thingy = await disabledcmds.findOne({ where: { serverid: gueldid, command: name } });
    if (!thingy) return false;
    if (thingy.type === "server") return thingy.type;
    else if (thingy.type === "channel") {
      // WIP
    }
    return thingy ? thingy.type : false;
  }
}

const permz = new Permz();

permz.hasPerm = permz.checkPerm;

module.exports = permz;