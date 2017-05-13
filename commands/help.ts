import { Message, RichEmbed } from "discord.js";
import Command from "../classes/command";
import { cmdFunc } from "../commandHandler";
import { _, bot } from "../util/deps";
import { rejct } from "../util/funcs";

const func: cmdFunc = async (msg: Message, { args, send, reply, prefix, botmember }) => {
  const sendIt = (emb: RichEmbed) => {
    return send({ embed: emb, autocatch: false }).catch((err: any) => err.status === 403 ?
      send("Please make sure I can send embeds in this channel.") :
      void(rejct(err)));
  };
  const categories: {[category: string]: {[cmdName: string]: Command}} = {};
  Object.entries(bot.commands).forEach(([k, v]) => {
    let category = "Uncategorized";
    if (v.category) {
      category = v.category.replace(/^\w/, (m: string) => m.toUpperCase());
    }
    if (!categories[category]) {
      categories[category] = {};
    }
    categories[category][v.name] = v;
  });
  if (!args || _.trim(args.toLowerCase()) === "all") {
    const embed = new RichEmbed();
    embed
      .setColor("RANDOM")
      .setTitle("List of commands")
      .setDescription("Commands available.");
    Object.entries(categories).forEach(([k, v]) => {
      let str = "";
      Object.keys(v).forEach((k2: string) => {
        str += k2 + "\n\n";
      });
      embed.addField(k, _.trim(str), true);
    });
    sendIt(embed);
  } else if (_.trim(args.toLowerCase().replace(/^\w/, (m: string) => m.toUpperCase())) in categories) {
    const category = _.trim(args.toLowerCase().replace(/^\w/, (m: string) => m.toUpperCase()));
    const embed = new RichEmbed();
    embed
      .setColor("RANDOM")
      .setTitle(`List of commands in category "${category}"`)
      .setDescription("All commands available in that category.");
    let str = "";
    Object.values(categories[category]).forEach((cmd: Command) => {
      str += cmd.name + "\n\n";
    });
    str = _.trim(str);
    embed.addField("Commands", str);
    sendIt(embed);
  } else if (_.trim(args.toLowerCase()) in bot.commands) {
    const cmdn = _.trim(args.toLowerCase());
    const embed = bot.commands[cmdn].help(prefix, true);
    sendIt(embed);
  } else {
    let cmdToUse = null;
    Object.values(bot.commands).forEach((cmd: Command) => {
      if (cmdToUse) {
        return;
      }
      if (cmd.aliases) {
        Object.values(cmd.aliases).forEach((alias: Command) => {
          if (cmdToUse) {
            return;
          }
          if (alias.name.toLowerCase() === _.trim(args).toLowerCase()) {
            cmdToUse = alias;
          }
        });
      }
    });
    if (!cmdToUse) {
      return reply("Unknown command/category!");
    }
    sendIt(cmdToUse.help(prefix, true));
  }
};
export const help = new Command({
  func,
  name: "help",
  default: true,
  description: "Show information about commands/a command/a category of commands.",
  example: "{p}help\n{p}help 8ball\n{p}help fun",
  category: "Utility",
  args: {"command or category": true},
  guildOnly: false,
});
