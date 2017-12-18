const { Message, MessageEmbed } = require("discord.js");
const Command = require("../../classes/command");
const { _, bot } = require("../../util/deps");
const { rejct } = require("../../util/funcs");

const func = async (msg, { args, send, reply, prefix, botmember }) => {
  const sendIt = (emb => {
    return send({ embed: emb, autocatch: false }).catch(err => err.status === 403 ?
      send("Please make sure I can send embeds in this channel.") :
      void(rejct(err)));
  });
  const categories = {};
  Object.entries(bot.commands).forEach(([k, v]) => {
    let category = "Uncategorized";
    if (v.category) {
      category = v.category.replace(/^\w/, m => m.toUpperCase());
    }
    if (!categories[category]) {
      categories[category] = {};
    }
    categories[category][v.name] = v;
  });
  if (!args || _.trim(args.toLowerCase()) === "all") {
    const embed = new MessageEmbed();
    embed
      .setColor("RANDOM")
      .setTitle("List of commands")
      .setDescription("Commands available.");
    Object.entries(categories).forEach(([k, v]) => {
      let str = "";
      Object.keys(v).forEach(k2 => {
        str += k2 + "\n";
      });
      embed.addField(k, _.trim(str), true);
    });
    sendIt(embed);
  } else if (_.trim(args.toLowerCase().replace(/^\w/, m => m.toUpperCase())) in categories) {
    const category = _.trim(args.toLowerCase().replace(/^\w/, m => m.toUpperCase()));
    const embed = new MessageEmbed();
    embed
      .setColor("RANDOM")
      .setTitle(`List of commands in category "${category}"`)
      .setDescription("All commands available in that category.");
    let str = "";
    Object.values(categories[category]).forEach(cmd => {
      str += cmd.name + "\n";
    });
    str = _.trim(str);
    embed.addField("Commands", str);
    sendIt(embed);
  } else if (_.trim(args.toLowerCase()) in bot.commands) {
    const cmdn = _.trim(args.toLowerCase());
    const embed = bot.commands[cmdn].help(prefix, true);
    sendIt(embed);
  } else {
    return reply("Unknown command/category!");
    /* let cmdToUse = null;
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
    }
    sendIt(cmdToUse.help(prefix, true)); */
  }
};
module.exports = new Command({
  func,
  name: "help",
  default: true,
  description: "Show information about commands/a command/a category of commands.",
  example: "{p}help\n{p}help 8ball\n{p}help fun",
  category: "Utility",
  args: {"command or category": true},
  guildOnly: false,
});
