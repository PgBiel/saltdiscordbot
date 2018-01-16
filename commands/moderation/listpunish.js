const Command = require("../../classes/command");
const actionLog = require("../../classes/actionlogger");
const d = require("../../misc/d");

function filterPunishes(punishments, id) {
  const punishes = punishments.filter(c => d.uncompress(c.target) === id && !c.deleted).reverse();
  return {
    all: punishes,
    alls: punishes,
    warns: punishes.filter(c => c.type === "w"),
    mutes: punishes.filter(c => ["p", "m"].includes(c.type)),
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

function main({ user, isAuthor, punishments, p, reply, send, maxCases }) {
  const filtered = filterPunishes(punishments, user.id, d.uncompress);
  if (!filtered.all || filtered.all.length < 1) return reply(`${isAuthor ? 
    "You haven't" :
    "That user hasn't"} ever been punished! :smiley:`);
  let text = `Punishments available (Type \`${p}listpunish ${isAuthor ? "" : "<user> "}<punishment>\` to a view a list):

`;
  for (const [type, filt] of Object.entries(filtered).sort(([, a], [, b]) => b.length - a.length)) {
    if (/^all/i.test(type)) continue;
    text += `• **${d._.capitalize(type)}**: **${filt.length}**${exampleCases(filt)}\n`;
  }
  const embed = new d.Embed();
  embed
    .setTitle(`List of punishments (last ${maxCases} cases)`)
    .setDescription(d._.trim(text))
    .setColor("RANDOM")
    .setFooter(`${isAuthor ?
      "You have" :
      "That user"} been punished ${filtered.all.length} times. To see all of ${isAuthor ? "your" : "their"} punishments, \
  type ${p}listpunish ${isAuthor ? "" : "<user> "}all.`);
  if (isAuthor) {
    reply("Here's your punishment list:", { embed });
  } else {
    send(`Here's the punishment list for ${user.tag}:`, { embed });
  }
}

async function specific({
  user, isAuthor, punishments, p, type: aType, reply, send, page: ogPage, maxCases, isWarn, guildId
}) {
  let filtered, typed;
  if (isWarn) {
    filtered = typed = await (d.db.table("warns").get(guildId, []));
    if (!filtered || filtered.length < 1) return reply(`There are no active warns on this guild!`);
    typed = typed.filter(w => w.userid === user.id);
    if (typed.length < 1) return reply(`${isAuthor ? "You have" : "That user has"} no active warns on this guild!`);
  } else {
    filtered = filterPunishes(punishments, user.id, d.uncompress);
    if (!filtered.all || filtered.all.length < 1) return reply(`${isAuthor ? 
      "You haven't" :
      "That user hasn't"} ever been punished! :smiley:`);
    typed = filtered[d.endChar((aType || "").toLowerCase(), "s")];
    if (!typed) return reply(`Unknown punishment.`);
  }
  if (typed.length < 1)
    return reply(`${isAuthor ? "You haven't" : "That user hasn't"} ever received that punishment! :smiley:`);
  const type = isWarn ?
    "warns" :
    (
      /^all/i.test(aType) ?
      "all" :
      d.endChar((aType || "").toLowerCase(), "s")
    );
  let cprop, mprop;
  if (isWarn) {
    cprop = "casenumber";
    mprop = "moderatorid";
  } else {
    cprop = "case";
    mprop = "moderator";
  }
  const pages = typed.length === 1 ?
    [typed[0][cprop].toString()] :
    d.paginate(typed.map(c => c[cprop].toString()).join(" "), 4);
  if (isNaN(ogPage)) return reply(`That page doesn't exist!`);
  const page = ogPage - 1;
  if (page < 0) return reply(`That page doesn't exist!`);
  if (page > pages.length - 1) return reply(`Invalid page! The max page is **${pages.length}**.`);
  let color;
  if (/^all/i.test(type)) {
    color = "RANDOM";
  } else if (/^unban/i.test(type)) {
    color = d.Constants.maps.PUNISHMENTS["U"][2];
  } else {
    color = (d.Constants.maps.PUNISHMENTS[type[0].toLowerCase()] || [0, 0, "RANDOM"])[2];
  }
  const embed = new d.Embed();
  let head;
  if (isWarn) {
    head = "currently active warns";
  } else {
    head = /^all/.test(type) ? "punishments" : type;
  }
  embed
    .setTitle(`List of ${head} for ${user.tag} (last ${maxCases} cases) - \
Page ${page + 1}/${pages.length}`)
    .setColor(color);
  if (pages.length > 1) embed.setFooter(`To go to a certain page, type \`${p}list${isWarn ? "warns" : "punish"} \
  ${isAuthor ? "" : "<user> "}${isWarn ? "" : (type + " ")}<page>.`);
  for (const pagee of pages[page].split(" ")) {
    if (isNaN(pagee) || !d._.trim(pagee)) continue;
    const num = Number(d._.trim(pagee));
    const punish = isWarn ? filtered.find(w => w.casenumber === num) : filtered.all.find(c => c.case === num);
    const [name, _desc, _color, extraFields] = d.Constants.maps.PUNISHMENTS[isWarn ? "w" : punish.type];
    let extra;
    if (extraFields) {
      const extraPart = punish.type === "p" ?
      [
        "Muted for",
        "Eternity"
      ] :
      [
        extraFields[0][0].replace(/^Muted For$/, "Muted for"),
        extraFields[0][1].replace("<d>", new d.Interval(d.durationdecompress(punish.duration)))
      ];
      extra = ` - ${extraPart.join(" ")}`;
    } else {
      extra = !["p", "m"].includes(punish.type) && /^all/i.test(type) ? ` - ${d._.capitalize(name)}` : "";
    }
    const field = [
      `Case ${punish[cprop]} by ${((await d.bot.users.fetch(d.uncompress(punish[mprop]))) || { tag: "Unknown" }).tag}${extra}`,
      `${punish.reason || "No reason"}`
    ];
    embed.addField(field[0], field[1]);
  }
  if (isAuthor && page < 1) {
    reply(`Here is a list of your ${head}:`, { embed });
  } else {
    send({ embed });
  }
}

const func = async function (
  msg, {
    prompt, guildId, guild, reply, checkRole, author, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms,
    searcher, promptAmbig, dummy
  },
) {
  const punishments = await (d.db.table("punishments").get(guildId));
  guild.members.fetch().catch(d.rejct);
  const maxCases = d.Constants.numbers.MAX_CASES(guild.members.size);
  if (dummy.warns) { // +listwarns
    if (!punishments || punishments.length < 1) return reply(`Nobody has been warned in this guild!`);
    if (!perms["listwarns"]) return reply(`Missing permission \`listwarns\`! :(`);
    if (!args) {
      return await specific({
        user: author, isAuthor: true, punishments, p, isWarn: true, reply, send, page: 1, maxCases
      });
    } else {
      const match = args.match(d.Constants.regex.LIST_WARNS_MATCH);
      let user, page;
      if (match[1]) {
        user = match[1];
        page = match[2];
      } else {
        user = match[3];
      }
      page = page && page.length < 5 && /^\d+$/.test(d._.trim(page)) ? (Number(page) || 1) : 1;
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
      return await specific({
        user: memberToUse.user, isAuthor: false, punishments, p, isWarn: true, reply, send, page, maxCases
      });
    }
  } else { // +listpunish
    if (!punishments || punishments.length < 1) return reply(`Nobody has been punished in this guild!`);
    if (!perms["listpunish"]) return reply(`Missing permission \`listpunish\`! :(`);
    if (!args) {
      main({
        user: author, isAuthor: true, punishments, p, reply, send, maxCases });
    } else {
      const matchObj = args.match(d.xreg(d.Constants.regex.LIST_PUNISH_MATCH, "xi"));
      let user, name, page;
      if (matchObj[1]) {
        name = matchObj[1];
        page = matchObj[2];
      } else if (matchObj[3]) {
        user = matchObj[3];
        name = matchObj[4];
        page = matchObj[5];
      } else {
        user = matchObj[6];
      }
      if (!user && !name) return reply(`Please specify a valid user to check their punishments!`);
      page = page && page.length < 5 && /^\d+$/.test(d._.trim(page)) ? (Number(page) || 1) : 1;
      name = name ? d._.trim(name) : name;
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
            user: memberToUse.user, isAuthor: false, punishments, p, type: name, reply, send, page, maxCases
          });
        } else {
          main({
            user: memberToUse.user, isAuthor: memberToUse.user.id === author.id, punishments, p, reply, send, maxCases
          });
        }
      } else {
        return await specific({
          user: author, isAuthor: true, punishments, p, type: name, reply, send, page, maxCases
        });
      }
    }
  }
};

module.exports = new Command({
  func,
  name: "listpunish",
  perms: "listpunish",
  description: `List punishments of you or someone else.

Run the command without specifying anything to display your list of punishments. Specify a name (or mention) to see \
someone else's instead.

Specify a punishment (i.e. ban) or "all" to display its respective list. Specify a name (or mention) before that to see \
that list for someone else instead. To switch pages, just specify a number (the page number) after the punishment name.`,
  example: `{p}listpunish
{p}listpunish bans
{p}listpunish all 2
{p}listpunish @GuyGuy#0000
{p}listpunish @GuyGuy#0000 kicks
{p}listpunish @GuyGuy#000 softbans 3`,
  category: "Moderation",
  args: {
    "punishment name (if no user is specified) or user": true,
    "punishment name (if an user is specified) or page (if it isn't)": true,
    "page (if an user is specified)": true
  },
  guildOnly: true,
  default: true
});
