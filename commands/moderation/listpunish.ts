import Command from "../../classes/command";
import actionLog from "../../classes/actionlogger";
import {
  uncompress, User, Embed, _, db, endChar, paginate as dpaginate, durationdecompress, Interval, bot,
  Constants, Message, GuildMember, xreg
} from "../../misc/d";
import { HelperVals } from "../../misc/tableValues";
import { ExtendedSendUnit, PageGenerator } from "../../handlerfuncs/senders/proto-send";
import { ColorResolvable } from "discord.js";
import { TcmdFunc } from "../../misc/contextType";

function cloneObject(objec) {
  return Object.assign(Object.create(objec), objec);
}

type CaseObj = HelperVals["punishments"];
type WarnObj = HelperVals["warns"];

/**
 * Get a filter of all kinds of punishments
 * @param {CaseObj[]} punishments List of punishments
 * @param {string} id ID to find of user
 * @returns {object} List of punishments
 */
function filterPunishes(punishments: CaseObj[], id: string, isMod: boolean = false) {
  const punishes = punishments.filter(c => uncompress(isMod ? c.moderator : c.target) === id && !c.deleted).reverse();
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

/**
 * Returns a list of example cases
 * @param {CaseObj[]} punishes List of punishments
 * @param {string} [init=" "] Text explaining the examples
 * @returns {string}
 */
function exampleCases(punishes: CaseObj[], init: string = " ") {
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

function main(
  { user, isAuthor, punishments, p, reply, send, maxCases, isMod }: {
    user: User, isAuthor: boolean, punishments: CaseObj[], p: string, reply: ExtendedSendUnit, send: ExtendedSendUnit,
    maxCases: number, isMod: boolean // isMod for +listmod - listing punishments done from themselves
  }
) {
  const filtered = filterPunishes(punishments, user.id, isMod);
  if (!filtered.all || filtered.all.length < 1) return reply(`${isAuthor ?
    "You haven't" :
    "That user hasn't"} ever ${isMod ? "punished someone" : "been punished"}! :smiley:`);
  let text: string = `Punishments available (Type \`${p}\
list${isMod ? "mod" : "punish"} ${isAuthor ? "" : "<user> "}<punishment>\` to a view a list):

`;
  for (const [type, filt] of Object.entries(filtered).sort(([, a], [, b]) => b.length - a.length)) {
    if (/^all/i.test(type)) continue;
    text += `• **${_.capitalize(type)}**: **${filt.length}**${exampleCases(filt)}\n`;
  }
  const embed: Embed = new Embed();
  const footer = (isAuthor ? "You have " : "That user has ") + (
    isMod ?
      `executed ${filtered.all.length} punishments. To see all punishments that ${isAuthor ? "you" : "they"} have authored, \
type ${p}listmod ${isAuthor ? "" : "<user> "}all.` :
      `been punished ${filtered.all.length} times. To see all of ${isAuthor ? "your" : "their"} punishments, \
type ${p}listpunish ${isAuthor ? "" : "<user> "}all.`
  );
  embed
    .setTitle(`List of punishments (last ${maxCases} cases)`)
    .setDescription(_.trim(text))
    .setColor("RANDOM")
    .setFooter(footer);
  if (isAuthor) {
    reply(
      isMod ? "Here's the list of punishments that you authored:" : "Here's your punishment list:",
      { embed, deletable: true }
    );
  } else {
    send(
      isMod ? `Here's the list of punishments authored by ${user.tag}:` : `Here's the punishment list for ${user.tag}:`,
      { embed, deletable: true }
    );
  }
}

async function specific(msg: Message, {
  user, isAuthor, punishments, p, type: aType, reply, send, page: ogPage, maxCases, mode, guildId
}: {
  user: User, isAuthor: boolean, punishments?: CaseObj[], p: string, type?: keyof ReturnType<typeof filterPunishes>,
  reply: ExtendedSendUnit, send: ExtendedSendUnit, page: number, maxCases: number, mode: "warns" | "mod", guildId: string
}): Promise<Message> {
  /**
   * All punishments for +listpunish, All warns for +listwarns
   */
  let filtered: ReturnType<typeof filterPunishes> | WarnObj[];
  /**
   * The specific punishments to see
   */
  let typed: Array<CaseObj | WarnObj>;
  const isWarn = mode === "warns";
  const isMod = mode === "mod";
  if (isWarn) { // if this is +listwarns
    filtered = typed = await (db.table("warns").get(guildId, []));
    if (!filtered || filtered.length < 1) return reply(`There are no active warns on this guild!`);
    typed = (typed as WarnObj[]).filter(w => uncompress(w.userid) === user.id).reverse();
    if (typed.length < 1) return reply(`${isAuthor ? "You have" : "That user has"} no active warns on this guild!`);
  } else { // if this is +listpunish or +listmod
    filtered = filterPunishes(punishments, user.id, isMod);
    if (!filtered.all || filtered.all.length < 1) return reply(`${isAuthor ?
      "You haven't" :
      "That user hasn't"} ever ${isMod ? "punished someone" : "been punished"}! :smiley:`);
    typed = filtered[endChar((aType || "").toLowerCase(), "s")];
    if (!typed) return reply(`Unknown punishment type.`);
  }
  if (typed.length < 1) {
    return reply(`${isAuthor ? "You haven't" : "That user hasn't"} ever ${isMod ? "issued" : "received"} that punishment! \
:smiley:`);
  }
  const type = isWarn ?
    "warns" :
    (
      /^all/i.test(aType) ?
      "all" :
      endChar((aType || "").toLowerCase(), "s")
    );
  /**
   * Property for obtaining case number
   */
  let cprop: "case" | "casenumber";
  /**
   * Property for obtaining ID of moderator (or victim, for +listmod)
   */
  let mprop: "moderatorid" | "moderator" | "target";
  if (isWarn) {
    cprop = "casenumber";
    mprop = "moderatorid";
  } else if (isMod) {
    cprop = "case";
    mprop = "target";
  } else {
    cprop = "case";
    mprop = "moderator";
  }
  const pages = typed.length === 1 ?
    [typed[0][cprop].toString()] :
    dpaginate(typed.map(c => c[cprop].toString()).join(" "), 4);
  if (isNaN(ogPage)) return reply(`That page doesn't exist!`);
  const page = ogPage - 1;
  if (page < 0) return reply(`That page doesn't exist!`);
  if (page > pages.length - 1) return reply(`Invalid page! The max page is **${pages.length}**.`);
  let color: ColorResolvable;
  if (/^all/i.test(type)) {
    color = "RANDOM";
  } else if (/^unban/i.test(type)) {
    color = Constants.maps.PUNISHMENTS.U[2];
  } else {
    color = (Constants.maps.PUNISHMENTS[type[0].toLowerCase()] || [0, 0, "RANDOM"])[2];
  }
  let head: string;
  if (isWarn) {
    head = "currently active warns";
  } else {
    head = /^all/.test(type) ? "punishments" : type;
  }
  const parseCase = async (page: number): Promise<Embed> => {
    const emb = new Embed()
      .setTitle(`List of ${head} ${isMod ? "issued by" : "for"} ${user.tag}${isWarn ? "" : ` (last ${maxCases} cases)`}`)
      .setColor(color);
    if (pages.length > 1) emb.setFooter(`Page ${page}/${pages.length} – To change, type ${p}list${mode || "punish"} \
${isAuthor ? "" : "<user> "}${isWarn ? "" : (type + " ")}<page>.`);
    for (const pagee of pages[page - 1].split(" ")) {
      if (isNaN(pagee) || !_.trim(pagee)) continue;
      const num = Number(_.trim(pagee));
      const punish = isWarn ?
        (filtered as WarnObj[]).find(w => w.casenumber === num) :
        (filtered as ReturnType<typeof filterPunishes>).all.find(c => c.case === num);
      const typeToUse = isWarn ? "w" : (punish as CaseObj).type;
      const [
        name, _desc, _color, extraFields
      ] = Constants.maps.PUNISHMENTS[typeToUse] as [string, string, string, [[string, string]]];
      let extra: string;
      if (extraFields) {
        const extraPart = typeToUse === "p" ?
        [
          "Permanently muted"
        ] :
        [
          extraFields[0][0].replace(/^Muted For$/, "Muted for"),
          extraFields[0][1].replace("<d>", new Interval(durationdecompress((punish as CaseObj).duration)).toString())
        ];
        extra = ` - ${extraPart.join(" ")}`;
      } else {
        extra = !["p", "m"].includes(typeToUse) && /^all/i.test(type) ? ` - ${_.capitalize(name)}` : "";
      }
      const fieldKey: string = `Case ${punish[cprop]} ${isMod ? "against" : "by"} \
${((await bot.users.fetch(uncompress(punish[mprop]))) || { tag: "Unknown" }).tag}${extra}`;
      const field: [string, string] = [
        fieldKey,
        `${punish.reason === "None" ? "No reason" : (punish.reason || "No reason")}`
      ];
      emb.addField(field[0], field[1]);
    }
    return emb;
  };
  const embed: Embed = await parseCase(page + 1);
  const content = isAuthor ? `Here is a list of your ${head}:` : "";
  const paginate = {
    page: ogPage,
    maxPage: pages.length,
    usePages: true,
    format: parseCase,
    pages,
    content
  };
  if (isAuthor && page < 1) {
    reply(content, { embed, paginate, deletable: true });
  } else {
    send({ embed, paginate, deletable: true });
  }
}

export interface IListPunishDummy {
  mode?: "warns" | "mod";
}

const func: TcmdFunc<IListPunishDummy> = async function(
  msg, {
    prompt, guildId, guild, reply, checkRole, author, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms,
    searcher, promptAmbig, dummy, member
  },
) {
  const punishments = await (db.table("punishments").get(guildId));
  const maxCases = Constants.numbers.max.CASES(guild.members.size);
  if (dummy.mode === "warns") { // +listwarns
    if (!punishments || punishments.length < 1) return reply(`Nobody has been warned in this guild!`);
    if (!perms.listwarns) return reply(`Missing permission \`listwarns\`! :(`);
    if (!args) {
      return await specific(msg, {
        user: author, isAuthor: true, p, mode: "warns", reply, send, page: 1, maxCases, guildId
      });
    } else {
      const match = args.match(Constants.regex.LIST_WARNS_MATCH);
      let user: string;
      let pageStr: string;
      let onlyPageSpecified: boolean = false;
      if (match[1]) {
        user = match[1];
        pageStr = match[2];
      } else {
        user = match[3];
        if (/^\d+$/.test(user)) {
          pageStr = user;
          user = "";
          onlyPageSpecified = true;
        }
      }
      const page: number = pageStr &&
        pageStr.length < Constants.numbers.max.length.PAGE && !isNaN(Number(_.trim(pageStr))) ? (Number(pageStr) || 1) : 1;
      let memberToUse: GuildMember;
      let membersMatched: GuildMember[];
      if (onlyPageSpecified) {
        memberToUse = member;
      } else if (/[^]#\d{4}$/.test(user)) {
        const split: string[] = user.split("#");
        const discrim: string = split.pop();
        const username: string = split.join("#");
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
        memberToUse = result.subject;
      } else if (membersMatched) {
        return reply("Multiple members have matched your search. Please be more specific.");
      }
      if (!memberToUse) {
        return;
      }
      return await specific(msg, {
        user: memberToUse.user, isAuthor: false, guildId, p, mode: "warns", reply, send, page, maxCases
      });
    }
  } else { // +listpunish
    if (!punishments || punishments.length < 1) return reply(`Nobody has been punished in this guild!`);
    const isMod = dummy.mode === "mod";
    const permToUse = "list" + (isMod ? "mod" : "punish");
    if (!perms[permToUse]) return reply(`Missing permission \`${permToUse}\`! :(`);
    if (!args) {
      main({
        user: author, isAuthor: true, punishments, p, reply, send, maxCases, isMod
      });
    } else {
      const matchObj = args.match(xreg(Constants.regex.LIST_PUNISH_MATCH, "xi"));
      let user: string;
      let name: string;
      let pageStr: string;
      if (matchObj[1]) {
        name = matchObj[1];
        pageStr = matchObj[2];
      } else if (matchObj[3]) {
        user = matchObj[3];
        name = matchObj[4];
        pageStr = matchObj[5];
      } else {
        user = matchObj[6];
      }
      if (!user && !name) return reply(`Please specify a valid user to check \
${isMod ? "who they have punished" : "their punishments"}!`);
      const page: number = pageStr && pageStr.length < 5 && /^\d+$/.test(_.trim(pageStr)) ? (Number(pageStr) || 1) : 1;
      name = name ? _.trim(name) : name;
      if (user) {
        let memberToUse: GuildMember;
        let membersMatched: GuildMember[];
        if (/[^]#\d{4}$/.test(user)) {
          const split: string[] = user.split("#");
          const discrim: string = split.pop();
          const username: string = split.join("#");
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
          memberToUse = result.subject;
        } else if (membersMatched) {
          return reply("Multiple members have matched your search. Please be more specific.");
        }
        if (!memberToUse) {
          return;
        }
        if (name) {
          return await specific(msg, {
            user: memberToUse.user, isAuthor: false, punishments, p, type: name as keyof ReturnType<typeof filterPunishes>, reply,
            send, page, maxCases, mode: dummy.mode, guildId
          });
        } else {
          main({
            user: memberToUse.user, isAuthor: memberToUse.user.id === author.id, punishments, p, reply, send, maxCases,
            isMod
          });
        }
      } else {
        return await specific(msg, {
          user: author, isAuthor: true, punishments, p, type: name as keyof ReturnType<typeof filterPunishes>, reply, send,
          page, maxCases, mode: dummy.mode, guildId
        });
      }
    }
  }
};

export const listpunish = new Command({
  func,
  name: "listpunish",
  perms: "listpunish",
  description: `List punishments of you or someone else, **from the last {maxcases} punishments**.

Run the command without specifying anything to display your list of punishments. Specify a name (or mention) to see \
someone else's instead.

Specify a punishment (i.e. ban) or "all" to display its respective list. Specify a name (or mention) before that to see \
that list for someone else instead. To switch pages, just specify a number (the page number) after the punishment name.`,
  example: `{p}{name}
{p}{name} bans
{p}{name} all 2
{p}{name} @GuyGuy#0000
{p}{name} @GuyGuy#0000 kicks
{p}{name} @GuyGuy#000 softbans 3`,
  category: "Moderation",
  args: {
    "punishment name (if no user is specified) or user": true,
    "punishment name (if an user is specified) or page (if it isn't)": true,
    "page (if an user is specified)": true
  },
  guildOnly: true,
  default: true,
  aliases: {
    listmod: {
      perms: "listmod",
      mode: "mod",
      default: true,
      description: `List punishments done by you or someone else, **from the last {maxcases} punishments**.
This command is the exact opposite of {p}listpunish: Instead of viewing punishments *suffered* by someone, you view \
the punishments *authored* by someone.

Run the command without specifying anything to display punishments you authored. Specify a name (or mention) to see \
punishments someone else did nstead.

Specify a punishment (i.e. ban) or "all" to display its respective list. Specify a name (or mention) before that to see \
that list for someone else instead. To switch pages, just specify a number (the page number) after the punishment name.`
    },
    listwarns: {
      perms: "listwarns",
      mode: "warns",
      default: true,
      description: "List active warns.",
      args: { "user or page": true, "page (when user is specified)": true },
      example: `{p}listwarns
{p}listwarns 2
{p}listwarns @Guy#0000
{p}listwarns @Guy#0000 3`,
      show: true
    }
  }
});
