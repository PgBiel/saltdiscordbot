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
function filterPunishes(punishments: CaseObj[], id: string) {
  const punishes = punishments.filter(c => uncompress(c.target) === id && !c.deleted).reverse();
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
  { user, isAuthor, punishments, p, reply, send, maxCases }: {
    user: User, isAuthor: boolean, punishments: CaseObj[], p: string, reply: ExtendedSendUnit, send: ExtendedSendUnit,
    maxCases: number
  }
) {
  const filtered = filterPunishes(punishments, user.id);
  if (!filtered.all || filtered.all.length < 1) return reply(`${isAuthor ?
    "You haven't" :
    "That user hasn't"} ever been punished! :smiley:`);
  let text: string = `Punishments available (Type \`${p}listpunish ${isAuthor ? "" : "<user> "}<punishment>\` to a view a list):

`;
  for (const [type, filt] of Object.entries(filtered).sort(([, a], [, b]) => b.length - a.length)) {
    if (/^all/i.test(type)) continue;
    text += `• **${_.capitalize(type)}**: **${filt.length}**${exampleCases(filt)}\n`;
  }
  const embed: Embed = new Embed();
  embed
    .setTitle(`List of punishments (last ${maxCases} cases)`)
    .setDescription(_.trim(text))
    .setColor("RANDOM")
    .setFooter(`${isAuthor ?
      "You have" :
      "That user"} been punished ${filtered.all.length} times. To see all of ${isAuthor ? "your" : "their"} punishments, \
type ${p}listpunish ${isAuthor ? "" : "<user> "}all.`);
  if (isAuthor) {
    reply("Here's your punishment list:", { embed, deletable: true });
  } else {
    send(`Here's the punishment list for ${user.tag}:`, { embed, deletable: true });
  }
}

async function specific(msg: Message, {
  user, isAuthor, punishments, p, type: aType, reply, send, page: ogPage, maxCases, isWarn, guildId
}: {
  user: User, isAuthor: boolean, punishments?: CaseObj[], p: string, type?: keyof ReturnType<typeof filterPunishes>,
  reply: ExtendedSendUnit, send: ExtendedSendUnit, page: number, maxCases: number, isWarn: boolean, guildId: string
}): Promise<Message> {
  /**
   * All punishments for +listpunish, All warns for +listwarns
   */
  let filtered: ReturnType<typeof filterPunishes> | WarnObj[];
  /**
   * The specific punishments to see
   */
  let typed: Array<CaseObj | WarnObj>;
  if (isWarn) { // if this is +listwarns
    filtered = typed = await (db.table("warns").get(guildId, []));
    if (!filtered || filtered.length < 1) return reply(`There are no active warns on this guild!`);
    typed = (typed as WarnObj[]).filter(w => uncompress(w.userid) === user.id).reverse();
    if (typed.length < 1) return reply(`${isAuthor ? "You have" : "That user has"} no active warns on this guild!`);
  } else { // if this is +listpunish
    filtered = filterPunishes(punishments, user.id);
    if (!filtered.all || filtered.all.length < 1) return reply(`${isAuthor ?
      "You haven't" :
      "That user hasn't"} ever been punished! :smiley:`);
    typed = filtered[endChar((aType || "").toLowerCase(), "s")];
    if (!typed) return reply(`Unknown punishment.`);
  }
  if (typed.length < 1) {
    return reply(`${isAuthor ? "You haven't" : "That user hasn't"} ever received that punishment! :smiley:`);
  }
  const type = isWarn ?
    "warns" :
    (
      /^all/i.test(aType) ?
      "all" :
      endChar((aType || "").toLowerCase(), "s")
    );
  let cprop: "case" | "casenumber";
  let mprop: "moderatorid" | "moderator";
  if (isWarn) {
    cprop = "casenumber";
    mprop = "moderatorid";
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
      .setTitle(`List of ${head} for ${user.tag}${isWarn ? "" : ` (last ${maxCases} cases)`}`)
      .setColor(color);
    if (pages.length > 1) emb.setFooter(`Page ${page}/${pages.length} – To change, type ${p}list${isWarn ? "warns" : "punish"} \
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
      const field: [string, string] = [
        `Case ${punish[cprop]} by ${((await bot.users.fetch(uncompress(punish[mprop]))) || { tag: "Unknown" }).tag}${extra}`,
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
  warns?: boolean;
}

const func: TcmdFunc<IListPunishDummy> = async function(
  msg, {
    prompt, guildId, guild, reply, checkRole, author, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms,
    searcher, promptAmbig, dummy, member
  },
) {
  const punishments = await (db.table("punishments").get(guildId));
  const maxCases = Constants.numbers.max.CASES(guild.members.size);
  if (dummy.warns) { // +listwarns
    if (!punishments || punishments.length < 1) return reply(`Nobody has been warned in this guild!`);
    if (!perms.listwarns) return reply(`Missing permission \`listwarns\`! :(`);
    if (!args) {
      return await specific(msg, {
        user: author, isAuthor: true, p, isWarn: true, reply, send, page: 1, maxCases, guildId
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
        user: memberToUse.user, isAuthor: false, guildId, p, isWarn: true, reply, send, page, maxCases
      });
    }
  } else { // +listpunish
    if (!punishments || punishments.length < 1) return reply(`Nobody has been punished in this guild!`);
    if (!perms.listpunish) return reply(`Missing permission \`listpunish\`! :(`);
    if (!args) {
      main({
        user: author, isAuthor: true, punishments, p, reply, send, maxCases });
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
      if (!user && !name) return reply(`Please specify a valid user to check their punishments!`);
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
            send, page, maxCases, isWarn: false, guildId
          });
        } else {
          main({
            user: memberToUse.user, isAuthor: memberToUse.user.id === author.id, punishments, p, reply, send, maxCases
          });
        }
      } else {
        return await specific(msg, {
          user: author, isAuthor: true, punishments, p, type: name as keyof ReturnType<typeof filterPunishes>, reply, send,
          page, maxCases, isWarn: false, guildId
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
  default: true,
  aliases: {
    listwarns: {
      perms: "listwarns",
      warns: true,
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
