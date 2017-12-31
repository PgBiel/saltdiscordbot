const Command = require("../../classes/command");
const actionLog = require("../../classes/actionlogger");

const func = async function (
  msg, { prompt, guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms },
) {
  if (!args) return reply(`Please specify an action! (See the help command for details.)`);
  const punishments = this.db.table("punishments").get(guildId);
  if (!punishments || punishments.length < 1) return reply(`There are no actions logged on this guild!`);
  const action = arrArgs[0].toLowerCase();
  const arg = arrArgs[1];
  if (action === "get") {
    if (!arg) return reply(`Please specify an action log number to get!`);
  } else if (action === "edit") {

  } else {
    return reply(`Action must be either \`get\` or \`edit\`.`);
  }
};
