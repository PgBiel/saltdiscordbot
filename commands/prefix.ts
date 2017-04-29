import { Message } from "discord.js";
import Command from "../classes/command";
import Database from "../classes/database";
import { TcmdFunc } from "../commandHandler";
import { prefixes } from "../sequelize/sequelize";
import { Constants, logger } from "../util/deps";

const func: TcmdFunc = async (msg: Message, { guildId, reply, send, args, arrArgs, prefix, hasPermission, perms }) => {
  if (arrArgs.length < 1) {
    return send(`Current prefix for this server: ${prefix}`);
  }
  logger.debug("prefix:", arrArgs.toString());
  if (!hasPermission("MANAGE_GUILD") && !perms.prefix) {
    return reply(
    "You do not have `Manage Server` (nor a permission overwrite).",
    );
  }
  const result = await Database.findAdd(prefixes, { where: { serverid: guildId }, defaults: { prefix: args } });
  if (!result[1]) {
    result[0].update({ prefix: args });
  }
  send(`Prefix set to \`${args}\`!`);
};
export const prefix = new Command({
  func,
  name: "prefix",
  perms: "prefix",
  description:
  "Set of the bot for the server. This always has the prefix +.\
   This also requires, without extra permissions, at least `Manage Server`.",
  example: "+prefix +",
  category: "Administration",
  customPrefix: "+",
  guildOnly: true,
});
