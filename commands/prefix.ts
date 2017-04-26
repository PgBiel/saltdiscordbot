import { Message } from "discord.js";
import Command from "../classes/command";
import Database from "../classes/database";
import { TcmdFunc } from "../commandHandler";

const func: TcmdFunc = async (msg: Message, { reply, send, arrArgs, prefix, hasPermission, perms }) => {
  if (arrArgs.length < 1) {
    return send(`Current prefix for this server: ${prefix}`);
  }
  if (!hasPermission("MANAGE_GUILD") && !perms.prefix) {
    return reply(
    "You do not have `Manage Server` (nor a permission overwrite).",
    );
  }
};
const prefix = new Command({
  func,
  name: "prefix",
  perms: "prefix",
  description:
  "Set of the bot for the server. This always has the prefix +.\
   This also requires, without extra permissions, at least `Manage Server`.",
  example: "+prefix +",
  category: "Administration",
});

export default prefix;
