import { Message } from "discord.js";
import Command from "../../classes/command";
import db from "../../classes/database";
import { TcmdFunc } from "../../commandHandler";
// import { prefixes } from "../../sequelize/sequelize";
import { Constants, logger } from "../../util/deps";

const func: TcmdFunc = async (
  msg: Message, { guildId, reply, send, args, arrArgs, prefix: p, hasPermission, perms },
) => {
  if (arrArgs.length < 1) {
    const prefixUsed = db.table("prefixes").get(guildId) || "+";
    return send(`Current prefix for this server: ${prefixUsed}`);
  }
  logger.debug("prefix:", arrArgs.toString());
  if (!hasPermission(["MANAGE_GUILD"]) && !perms.prefix) {
    return reply(
    "You do not have `Manage Server` (nor a permission overwrite).",
    );
  }
  db.table("prefixes").set(guildId, args);
  send(`Prefix set to \`${args}\`!`);
};
export const prefix = new Command({
  func,
  name: "prefix",
  perms: "prefix",
  description:
  "Set the prefix of the bot for the server. This always has the prefix +.\
   This also requires, without extra permissions, at least `Manage Server`.",
  example: "+prefix +",
  category: "Administration",
  customPrefix: "+",
  args: {"new prefix": true},
  guildOnly: true,
});
