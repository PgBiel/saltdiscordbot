import Command from "../../classes/command";
import { _, bot, rejct, Message, Embed, paginate as dpaginate } from "../../misc/d";
import { cmdFunc } from "../../misc/contextType";
import { ExtendedMsgOptions } from "../../handlerfuncs/senders/proto-send";

const map = { Mod: "Moderation", Admin: "Administration", Util: "Utility" };

const func: cmdFunc = async function(msg: Message, { args, arrArgs, send, reply, prefix, botmember, dummy, guild, perms }) {
  if (guild && !perms.help) return reply("Missing permission `help`! (Try using this command by messaging me instead.)");
  const sendIt = (emb: Embed, opts?: ExtendedMsgOptions) => {
    return send(Object.assign({ embed: emb, autoCatch: false, deletable: true }, opts))
      .catch(err => [403, 50013].includes(err.code) ?
        send("Please make sure I can send embeds in this channel.") :
        void(rejct(err)));
  };
  const filtered = _.fromPairs(
    Object.entries(bot.commands)
      .filter(([n, c]) => c && c.category !== "Private" && (c.show || c.show == null))
  );
  const categories: { [category: string]: { [cmdname: string]: Command } } = {};
  Object.entries(filtered).forEach(([k, v]) => {
    if (v.category !== "Private" && (v.show || v.show == null)) {
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
  const extraCategories = Object.assign({}, categories, { Mod: null, Admin: null, Util: null }); // categories + ALIASES
  if (!args /* || _.trim(args.toLowerCase()) === "all" */) { // List categories
    const embed: Embed = new Embed();
    embed
      .setColor("RANDOM")
      .setTitle("List of categories")
      .setFooter(`To view all ${filtered.length} commands, \
type ${prefix}help all.`);
    /* Object.entries(categories).forEach(([k, v]) => {
      let str = "";
      Object.keys(v).forEach(k2 => {
        str += k2 + "\n";
      });
      embed.addField(k, _.trim(str), true);
    }); */
    /**
     * Array with the categories and their sizes
     */
    const arr: Array<[string, number]> = [];
    Object.entries(categories).forEach(([cat, cmds]) => {
      const size = Object.getOwnPropertyNames(cmds).length;
      arr.push([cat, size]);
    });

    let table: string = "";
    for (const obj of arr.sort((a, b) => b[1] - a[1])) {
      table += `• **${obj[0]}**: **${obj[1]}** commands\n`;
    }
    table = _.trim(table);
    embed.setDescription(`Categories of commands available (Type \`${prefix}help <category>\` to view its commands):

${table}`);
    sendIt(embed);
  } else if (arrArgs[0].toLowerCase().replace(/^\w/, m => m.toUpperCase()) in extraCategories) { // List of commands in category
    const category: string = arrArgs[0].toLowerCase().replace(/^\w/, m => m.toUpperCase());
    const page: number = Number(arrArgs[1] || 1);
    if (isNaN(page) || page < 1 || /\./.test(page.toString())) return reply(`Please provide a valid page (the second parameter)! \
It must be a number that is higher than or equal to 1, and not have decimals.`);
    let str: string = "";
    Object.values(categories[category in map ? map[category] : category])
      .filter(c => c.show == null || c.show)
      .sort(({ name: a }, { name: b }) => a > b ? 1 : (a < b ? -1 : 0))
      .forEach(cmd => str += `${cmd.name}\n`);
    str = _.trim(str);
    const pages = dpaginate(str);
    if (pages.length < page) return reply(`Invalid page! The max page is **${pages.length}**.`);
    const gen = (page: number): Embed => {
      const emb = new Embed();
      emb
        .setColor("RANDOM")
        .setTitle(`List of commands in category "${category in map ? map[category] : category}" - Page ${page}/${pages.length}`)
        .setDescription(`All commands available in that category. Type \`${prefix}help <command>\` to view info of a command.`)
        .addField("Commands", pages[page - 1].split("\n").sort().map(l => "• " + l).join("\n"));
      if (pages.length > 1) emb.setFooter(`To go to a certain page, use \
${prefix}help ${category in map ? map[category] : category} <page>.`);
      return emb;
    };

    sendIt(gen(page), { paginate: { page, pages, maxPage: pages.length, usePages: true, format: gen, content: "" } });
  } else if (arrArgs[0].toLowerCase() === "all") { // List of all commands
    const page: number = Number(arrArgs[1] || 1);
    if (isNaN(page) || page < 1 || /\./.test(page.toString())) return reply(`Please provide a valid page (the second parameter)! \
It must be a number that is higher than or equal to 1, and not have decimals.`);
    let str: string = "";
    Object.values(filtered)
      .sort(({ name: a }, { name: b }) => a > b ? 1 : (a < b ? -1 : 0))
      .forEach(cmd => str += `${cmd.name}\n`);
    str = _.trim(str);
    const pages = dpaginate(str);
    if (pages.length < page) return reply(`Invalid page! The max page is **${pages.length}**.`);
    const gen = (page: number): Embed => {
      const emb: Embed = new Embed();
      emb
        .setColor("RANDOM")
        .setTitle(`List of all commands - Page ${page}/${pages.length}`)
        .setDescription(`All commands available. Type \`${prefix}help <command>\` to view info of a command.`)
        .addField("Commands", pages[page - 1].split(/\s+/).sort().map(l => "• " + l).join("\n"));
      if (pages.length > 1) emb.setFooter(`To go to a certain page, use ${prefix}help all <page>.`);
      return emb;
    };
    sendIt(gen(page), { paginate: { page, pages, maxPage: pages.length, usePages: true, format: gen, content: "" } });
  } else if (_.trim(args.toLowerCase()) in bot.commands) { // Help of a command
    const cmdn: string = _.trim(args.toLowerCase());
    const embed: Embed = bot.commands[cmdn].help(prefix, { useEmbed: true, guild });
    sendIt(embed);
  } else { // no idea
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

export const help = new Command({
  func,
  name: "help",
  perms: "help",
  default: true,
  description: "Show information about commands/a command/a category of commands.",
  example: "{p}help\n{p}help 8ball\n{p}help Fun\n{p}help All",
  category: "Utility",
  args: {"command or category": true, "page (Default: 1)": true},
  guildOnly: false
});
