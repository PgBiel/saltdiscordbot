import Command from "../../classes/command";
import { db, logger, rejct } from "../../misc/d";
import { TcmdFunc } from "../../misc/contextType";

const func: TcmdFunc<{}> = async function(
  msg, { guildId, reply, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms, seePerm },
) {
  if (arrArgs.length < 1) {
    const prefixUsed: string = (await (db.table("prefixes").get(guildId))) || "+";
    return send(`Current prefix for this server: ${prefixUsed}`);
  }
  logger.debug("prefix:", arrArgs.toString());
  if (!await seePerm("prefix", perms, setPerms, { srole: "admin", hperms: "MANAGE_GUILD" })) {
    return reply("Missing permission `prefix`! Could also use this command with the `Administrator` saltrole or the `\
Manage Server` Discord permission.");
  }
  if (args.length > 200) return reply("The prefix must not exceed 200 characters!");
  try {
    await (db.table("prefixes").set(guildId, args, true));
    send(`Prefix set to \`${args}\`!`);
  } catch (err) {
    rejct(err);
    send(`Failed to set the prefix! :(`);
  }
};
export const prefix = new Command({
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
