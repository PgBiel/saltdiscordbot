const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (
  msg, { guildId, reply, send, args, arrArgs, prefix: p, hasPermission, perms },
) {
  if (arrArgs.length < 1) {
    const prefixUsed = (await d.db.table("prefixes").get(guildId)) || "+";
    return send(`Current prefix for this server: ${prefixUsed}`);
  }
  d.logger.debug("prefix:", arrArgs.toString());
  if (!hasPermission(["MANAGE_GUILD"]) && !perms.prefix) {
    return reply(
    "You do not have `Manage Server` (nor a permission overwrite).",
    );
  }
  try {
    await d.db.table("prefixes").setRejct(guildId, args);
    send(`Prefix set to \`${args}\`!`);
  } catch(err) {
    d.rejct(err);
    send(`Failed to set the prefix! :(`);
  }
};
module.exports = new Command({
  func,
  name: "prefix",
  perms: "prefix",
  description:
  "Set the prefix of the bot for the server. This always has the prefix +. \
This also requires, without extra permissions, at least `Manage Server`.",
  example: "+prefix +",
  category: "Administration",
  customPrefix: "+",
  args: {"new prefix": true},
  guildOnly: true
});
