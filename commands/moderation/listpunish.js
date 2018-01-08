const Command = require("../../classes/command");
const actionLog = require("../../classes/actionlogger");

function filterPunishes(punishments, id, uncompress) {
  const punishes = punishments.filter(c => uncompress(c.target) === id && !c.deleted);
  return {
    all: punishes,
    alls: punishes,
    warns: punishes.filter(c => c.type === "w"),
    mutes: punishes.filter(c => c.type === "m"),
    kicks: punishes.filter(c => c.type === "k"),
    softbans: punishes.filter(c => c.type === "s"),
    bans: punishes.filter(c => c.type === "b"),
    unbans: punishes.filter(c => c.type === "U"),
    unmutes: punishes.filter(c => c.type === "u")
  };
}
function exampleCases(punishes, init = " ") {
  if (punishes.length < 1) {
    return "";
  } else if (punishes.length === 1) {
    return `${init}[Case ${punishes[0].case}]`;
  } else if (punishes.length < 5) {
    return `${init}[Cases ${punishes.map(c => c.case.toString()).join(", ")}]`;
  } else {
    const initCases = punishes.slice(0, 4).map(c => c.case.toString()).join(", ");
    const otherCases = punishes.slice();
    otherCases.splice(0, 4);
    return `${init}[Cases ${initCases}... (and ${otherCases.length} more)]`;
  }
}

function main({ Embed, user, isAuthor, punishments, p, reply, send, uncompress, _ }) {
  const filtered = filterPunishes(punishments, user.id, uncompress);
  if (!filtered.all || filtered.all.length < 1) return reply(`${isAuthor ? 
    "You haven't" :
    "That user hasn't"} ever been punished! :smiley:`);
  let text = `Punishments available (Type \`${p}listpunish <punishment>\` to a view a list):

`;
  for (const [type, filt] of Object.entries(filtered).sort(([, a], [, b]) => b.length - a.length)) {
    if (/^all/i.test(type)) continue;
    text += `• **${_.capitalize(type)}**: **${filt.length}**${exampleCases(filt)}\n`;
  }
  const embed = new Embed();
  embed
    .setTitle("List of punishments (last 500 cases)")
    .setDescription(_.trim(text))
    .setColor("RANDOM")
    .setFooter(`${isAuthor ?
      "You have" :
      "That user"} been punished ${filtered.all.length} times. Type \`${p}listpunish all\` to see all of your punishments.`);
  if (isAuthor) {
    reply("Here's your punishment list:", { embed });
  } else {
    send(`Here's the punishment list for ${user.tag}:`, { embed });
  }
}

async function specific({
  Embed, user, Constants, isAuthor, punishments, p, type: aType, reply, send, uncompress, _, page: ogPage, paginate, endChar,
  bot, Time
}) {
  const filtered = filterPunishes(punishments, user.id, uncompress);
  if (!filtered.all || filtered.all.length < 1) return reply(`${isAuthor ? 
    "You haven't" :
    "That user hasn't"} ever been punished! :smiley:`);
  const typed = filtered[endChar((aType || "").toLowerCase(), "s")];
  if (!typed) return reply(`Unknown punishment.`);
  if (typed.length < 1) return reply(`${isAuthor ? "You haven't" : "That user hasn't"} ever received that punishment! :smiley:`);
  const type = /^all/i.test(aType) ? "all" : endChar(aType.toLowerCase(), "s");

  const pages = typed.length === 1 ? [typed[0].case.toString()] : paginate(typed.map(c => c.case.toString()).join(" "), 4);
  if (isNaN(ogPage)) return reply(`That page doesn't exist!`);
  const page = ogPage - 1;
  if (page < 0) return reply(`That page doesn't exist!`);
  if (page > pages.length - 1) return reply(`Invalid page! The max page is **${pages.length}**.`);
  const embed = new Embed();
  embed
    .setTitle(`List of ${/^all/.test(type) ? "punishments" : type} for ${user.tag} (last 500 cases) - \
Page ${page + 1}/${pages.length}`)
    .setColor(/^all/i.test(type) ? "RANDOM" : (Constants.maps.PUNISHMENTS[type[0].toLowerCase()] || [0, 0, "RANDOM"])[2]);
  if (pages.length > 1) embed.setFooter(`Type \`${p}listpunish ${isAuthor ? "" : "<user> "}${type} <page>\` to go to a \
certain page.`);
  for (const pagee of pages[page].split(" ")) {
    if (isNaN(pagee) || !_.trim(pagee)) continue;
    const punish = filtered.all.find(c => c.case === Number(_.trim(pagee)));
    const [name, _desc, color, extraFields] = Constants.maps.PUNISHMENTS[punish.type];
    const extra = extraFields ?
      ` - ${extraFields[0][0]} ${extraFields[0][1].replace("<d>", Time(Number(uncompress(punish.duration)) * 1000))}` :
      "";
    const field = [
      `Case ${punish.case} by ${((await bot.users.fetch(uncompress(punish.moderator))) || { tag: "Unknown" }).tag}${extra}`,
      `${punish.reason || "No reason"}`
    ];
    embed.addField(field[0], field[1]);
  }
  if (isAuthor) {
    reply(`Here is a list of your ${/^all/.test(type) ? "punishments" : type}:`, { embed });
  } else {
    send({ embed });
  }
}

const func = async function (
  msg, {
    prompt, guildId, guild, reply, checkRole, author, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms, searcher,
    promptAmbig
  },
) {
  const punishments = this.db.table("punishments").get(guildId);
  if (!punishments || punishments.length < 1) return reply(`Nobody has been punished in this guild!`);
  if (!args) {
    main({ Embed: this.Embed, user: author, isAuthor: true, punishments, p, reply, send, uncompress: this.uncompress, _: this._ });
  } else {
    const matchObj = args.match(this.xreg(this.Constants.regex.LIST_PUNISH_MATCH, "xi"));
    let user, name, page;
    if (matchObj[1]) {
      name = matchObj[1];
    } else if (matchObj[2]) {
      user = matchObj[2];
      name = matchObj[3];
    } else {
      user = matchObj[5];
    }
    if (!user && !name) return reply(`Please specify a valid user to check their punishments!`);
    page = matchObj[4] && matchObj[4].length < 5 && /^\d+$/.test(this._.trim(matchObj[5])) ? (Number(matchObj[5]) || 1) : 1;
    name = name ? this._.trim(name) : name;
    if (user) {
      let memberToUse;
      let membersMatched;
      if (/[^]#\d{4}$/.test(user)) {
        const split = user.split("#");
        const discrim = split.pop();
        const username = split.join("#");
        memberToUse = guild.members.find(m => m.user.username === username && m.user.discriminator === discrim);
      } else if (/^<@!?\d+>$/.test(user)) {
        memberToUse = guild.members.get(user.match(/^<@!?(\d+)>$/)[1]);
      }
      if (!memberToUse) {
        membersMatched = searcher.searchMember(user);
      }
      if (membersMatched && membersMatched.length < 1) {
        return reply("Member not found!");
      } else if (membersMatched && membersMatched.length === 1) {
        memberToUse = membersMatched[0];
      } else if (membersMatched && membersMatched.length > 1 && membersMatched.length < 10) {
        const result = await promptAmbig(membersMatched);
        if (result.cancelled) {
          return;
        }
        memberToUse = result.member;
      } else if (membersMatched) {
        return reply("Multiple members have matched your search. Please be more specific.");
      }
      if (!memberToUse) {
        return;
      }
      if (name) {
        return await specific({
          Embed: this.Embed, user: memberToUse.user, Constants: this.Constants, isAuthor: false, punishments, p, type: name, reply, 
          send, uncompress: this.uncompress, _: this._, page, paginate: this.paginate, endChar: this.endChar, bot: this.bot,
          Time: this.Time
        });
      } else {
        main({
          Embed: this.Embed, user: memberToUse.user, isAuthor: memberToUse.user.id === author.id, punishments, p, reply, send,
          uncompress: this.uncompress, _: this._
        });
      }
    } else {
      return await specific({
        Embed: this.Embed, user: author, Constants: this.Constants, isAuthor: true, punishments, p, type: name, reply, send, 
        uncompress: this.uncompress, _: this._, page, paginate: this.paginate, endChar: this.endChar, bot: this.bot, Time: this.Time
      });
    }
  }
};

module.exports = new Command({
  func,
  name: "listpunish",
  perms: {"case.get": true, "case.edit": true, "case.delete": true, "case.others": false},
  description: `Get or modify a case. Specify just a number to fetch that case and see it's information. Otherwise, specify an \
action. The actions are listed below. After it, specify a number which will be the case to interact with.

The \`get\` action works pretty much as if you just specified a number: It retrieves a case by the number specified.
The rest of the actions can be only applied to your own cases by default and require a special permission to apply to others. For \
\`edit\` and only it, if you attempt to apply it to someone else's case, you will be prompted for confirmation because you will \
become the punisher.

The \`edit\` action lets you change a case's reason. You must specify the new reason after the case number.

The \`togglethumb\` action lets you toggle if a thumbnail will be displayed on the case's embed or not.

And finally, the \`delete\` action lets you delete a case. You will always be asked for confirmation.

Permissions: \`case \` and the action name. For interacting with others' cases, use \`case others\`.`,
  example: `{p}case 5
{p}case get 5
{p}case edit 10 New reason
{p}case togglethumb 16
{p}case delete 6`,
  category: "Moderation",
  args: {
    "action or case number": false,
    "case number (only when using an action)": true,
    "new reason (only when using edit)": true
  },
  guildOnly: true,
  default: false
});
