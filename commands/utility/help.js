const Command = require("../../classes/command");

const func = async function (msg, { args, arrArgs, send, reply, prefix, botmember, dummy }) {
  const sendIt = (emb => {
    return send({ embed: emb, autocatch: false }).catch(err => err.status === 403 ?
      send("Please make sure I can send embeds in this channel.") :
      void(this.rejct(err)));
  });
  const categories = {};
  Object.entries(this.bot.commands).forEach(([k, v]) => {
    if (v.category !== "Private") {
      let category = "Uncategorized";
      if (v.category) {
        category = v.category.replace(/^\w/, m => m.toUpperCase());
      }
      if (!categories[category]) {
        categories[category] = {};
      }
      categories[category][v.name] = v;
    }
  });
  if (!args /* || this._.trim(args.toLowerCase()) === "all" */) {
    const embed = new this.Embed();
    embed
      .setColor("RANDOM")
      .setTitle("List of categories")
      .setFooter(`To view all ${Object.values(this.bot.commands).filter(c => c.category !== "Private").length} commands, \
type ${prefix}help all.`);
    /* Object.entries(categories).forEach(([k, v]) => {
      let str = "";
      Object.keys(v).forEach(k2 => {
        str += k2 + "\n";
      });
      embed.addField(k, this._.trim(str), true);
    }); */
    let arr = [];
    Object.entries(categories).forEach(([cat, cmds]) => {
      const size = Object.getOwnPropertyNames(cmds).length;
      arr.push([cat, size]);
    });
    let table = "";
    for (const obj of arr.sort((a, b) => b[1] - a[1])) {
      table += `• **${obj[0]}**: **${obj[1]}** commands\n`;
    }
    table = this._.trim(table);
    embed.setDescription(`Categories of commands available (Type \`${prefix}help <category>\` to view its commands):

${table}`);
    sendIt(embed);
  } else if (arrArgs[0].toLowerCase().replace(/^\w/, m => m.toUpperCase()) in categories) {
    const category = arrArgs[0].toLowerCase().replace(/^\w/, m => m.toUpperCase());
    const embed = new this.Embed();
    const page = Number(arrArgs[1] || 1);
    if (isNaN(page) || page < 1 || /\./.test(page.toString())) return reply(`Please provide a valid page (the second parameter)! \
It must be a number that is higher than or equal to 1, and not have decimals.`);
    let str = "";
    Object.values(categories[category]).forEach(cmd => {
      str += cmd.name + "\n";
    });
    str = this._.trim(str).split("\n").sort().join("\n");
    const pages = this.paginate(str);
    if (pages.length > 1) embed.setFooter(`To go to a certain page, use ${prefix}help ${category} <page>.`);
    if (pages.length < page) return reply(`Invalid page! The max page is **${pages.length}**.`);
    embed
      .setColor("RANDOM")
      .setTitle(`List of commands in category "${category}" - Page ${page}/${pages.length}`)
      .setDescription("All commands available in that category.")
      .addField("Commands", pages[page - 1]);
    sendIt(embed);
  } else if (arrArgs[0].toLowerCase() === "all") {
    const embed = new this.Embed();
    const page = Number(arrArgs[1] || 1);
    if (isNaN(page) || page < 1 || /\./.test(page.toString())) return reply(`Please provide a valid page (the second parameter)! \
It must be a number that is higher than or equal to 1, and not have decimals.`);
    let str = "";
    Object.values(this.bot.commands).forEach(cmd => {
      if (cmd.category !== "Private") str += cmd.name + "\n";
    });
    str = this._.trim(str).split("\n").sort().join("\n");
    const pages = this.paginate(str);
    if (pages.length > 1) embed.setFooter(`To go to a certain page, use ${prefix}help all <page>.`);
    if (pages.length < page) return reply(`Invalid page! The max page is **${pages.length}**.`);
    embed
      .setColor("RANDOM")
      .setTitle(`List of all commands - Page ${page}/${pages.length}`)
      .setDescription("All commands available.")
      .addField("Commands", pages[page - 1]);
    sendIt(embed);
  } else if (this._.trim(args.toLowerCase()) in this.bot.commands) {
    const cmdn = this._.trim(args.toLowerCase());
    const embed = this.bot.commands[cmdn].help(prefix, true);
    sendIt(embed);
  } else {
    return reply("Unknown command/category!");
    /* let cmdToUse = null;
    Object.values(this.bot.commands).forEach((cmd: Command) => {
      if (cmdToUse) {
        return;
      }
      if (cmd.aliases) {
        Object.values(cmd.aliases).forEach((alias: Command) => {
          if (cmdToUse) {
            return;
          }
          if (alias.name.toLowerCase() === this._.trim(args).toLowerCase()) {
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
  example: "{p}help\n{p}help 8ball\n{p}help Fun\n{p}help All",
  category: "Utility",
  args: {"command or category": true, "page (Default: 1)": true},
  guildOnly: false
});
