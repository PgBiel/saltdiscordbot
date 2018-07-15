import { TcmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "../info/info";
import { _, Role, bot, search, Embed, Constants, Command, sleep, paginate, GuildMember } from "../../misc/d";
import { Collection, Guild, GuildEmoji, GuildChannel } from "discord.js";
import { SearchType } from "../../funcs/parsers/search";

/* const units = [
  ["thousand", "k"], ["million", "M"], ["billion", "b"], ["trillion", "t"], ["quadrillion", "qd"],
  ["quintillion", "qn"], ["sextillion", "sx"], ["septillion", "sp"], ["octillion", "o"], ["nonillion", "n"],
  ["decillion", "de"], ["undecillion", "ud"], ["duodecillion", "dd"], ["tredecillion", "tdd"],
  ["quattuordecillion", "qdd"], ["quindecillion", "qnd"]
]

function stringifyNum(num) {
  const str = String(num);
  if (!/\d/.test(str)) return str;
  if (str.length < 4) return str;
  const groups = str.replace(/[^\d]+/g, "").match(/(\d{3}|\d{2}|\d)/g);
  const firstn = groups.pop();
  let stra = /^0+$/.test(String(firstn)) ? "" : `${firstn}`;
  let index = 0;
  for (const num of groups.reverse()) {
    if (/^0+$/.test(String(num))) {
      index++;
      continue;
    }
    stra = `${String(num).replace(/^0+/, "") || "NoNe"} ${(units[index++]||["mahajapit"])[0]}, ` + stra;
  }
  return stra.replace(/[\s,]+$/, "");
}
*/
/**
 * Only get props of that type
 * @template T The type to get props of
 * @template C The type that props should be
 */
export type OnlyPropsOf<T, C> = {
  [P in keyof T]: T[P] extends C ? P : never;
}[keyof T];

/**
 * Used to get all keys of an Union Type
 * @template T The type to get props of
 */
export type PossibleProps<T> = T extends any ? keyof T : never;

/**
 * Only get props that aren't of that type
 * @template T The type to get props of
 * @template C The type that props shouldn't be
 */
export type NoPropsOf<T, C> = {
  [P in keyof T]: T[P] extends C ? never : P;
}[keyof T];

type PossibleListing = GuildMember | GuildEmoji | Role | GuildChannel;

type MultiInfoDummy = AInfoDummy & {
  data?: {
    noArgCont: string;
    noArgInvalid: string;
    noArgTitle: string;

    argCont: string;
    argInvalid: string;
    argTitle: string;

    /**
     * Type to search when using subject wide collection
     */
    type: SearchType;
    sort: (a: PossibleListing, b: PossibleListing) => number;
    textWorker: (
      val: PossibleListing, arr: PossibleListing[], isGuild: boolean, isAndroid: boolean, guild: Guild
    ) => string;
    filterer?: (val: PossibleListing, guild: Guild) => boolean;

    /**
     * for subjectWide collection
     */
    subjectProp?: PossibleProps<PossibleListing>;
    /**
     * for guildWide collection
     */
    guildProp: OnlyPropsOf<Guild, Collection<string, PossibleListing>>;
  }
};

const datas: { [prop: string]: MultiInfoDummy["data"] } = {
  roles: {
    noArgCont: "Here are the server's roles:",
    noArgInvalid: "This server has no roles (other than the default)!",
    noArgTitle: "All Roles",

    argCont: "Here are {user.tag}'s roles:",
    argInvalid: "That member has no roles (other than the default)!",
    argTitle: "{user.tag}'s Roles",

    type: "user",
    sort: (a: Role, b: Role) => b.position - a.position,
    textWorker: (role: Role, arr: Role[], isGuild: boolean, isAndroid: boolean) => {
      const rolePos = arr.indexOf(role);
      const position = arr.length - rolePos; // rolesArr length - rolePos to reverse the sorting
      const roleText = isAndroid ?
        role.name.replace(/<([@#])/, "<\\$1") :
        `<@&${role.id}>`;
      return `**${isNaN(position) ? `${position}:` : `\`${position}.\``}** ${roleText}`;
    },
    filterer: (v: PossibleListing, g: Guild) => v instanceof Role && v.id !== g.id,

    subjectProp: "roles",
    guildProp: "roles"
  },
  members: {
    noArgCont: "Here are the server's members:",
    noArgInvalid: "This server has no members that I know of! (Huh?)",
    noArgTitle: "All Members",

    argCont: `Here are the members of the role \`{name}\`:`,
    argInvalid: "That role has no members!",
    argTitle: `Members of the Role \`{name}\``,

    type: "role",
    guildProp: "members", // all members in the server if no member is specified
    sort: (
      a: GuildMember, b: GuildMember
    ) => (b.roles.highest.position - a.roles.highest.position), // highest pos; if not, oldest member
    textWorker: (member: GuildMember, arr: GuildMember[], _isG: boolean, isAndroid: boolean, guild: Guild) => {
      const membPos = arr.indexOf(member);
      const position = arr.length - membPos; // Arr length - membPos to reverse the sorting;
      const memberText = isAndroid ?
        member.user.tag.replace(/<([@#])/, "<\\$1") :
        `<@!${member.id}>`;
      return `• ${memberText}${member.id === guild.ownerID ? Constants.emoji.rjt.OWNER : ""}`;
    },
    filterer: (m: PossibleListing) => m instanceof GuildMember,
    subjectProp: "members"
  }
};

const func: TcmdFunc<MultiInfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member, sendIt
}) {
  if (!perms["info.roles"]) return reply("Missing permission `info roles`! :frowning:");
  channel.startTyping();
  const {
    android, action, arg: _arg, trArg,
    data: {
      noArgCont,
      noArgInvalid,
      noArgTitle,

      argCont,
      argInvalid,
      argTitle,

      type,
      sort,
      textWorker,
      filterer = () => true,

      subjectProp,
      guildProp
    } = datas.roles
  } = dummy || {} as never;
  const arg = trArg || _arg || args;
  /**
   * Content to send with msg
   */
  let content: string;
  /**
   * Text to send if invalid input was given
   */
  let invalid: string;
  /**
   * Embed title
   */
  let title: string;

  /**
   * List of roles/subjects to use
   */
  let subjects: Collection<string, PossibleListing>;
  /**
   * Page to use
   */
  let page: number;
  /**
   * Page specified
   */
  let strPage: string;
  /**
   * Search term-
   */
  let argu: string;
  const sepArg = arg.split(" ");
  if (/^\d+$/.test(sepArg[sepArg.length - 1])) {
    strPage = sepArg.pop();
  } else {
    strPage = "1";
  }
  argu = sepArg.join(" ");
  if (!arg || /^\d{1,5}$/.test(arg)) { // all from guild
    subjects = guild[guildProp];
    content = noArgCont;
    invalid = noArgInvalid;
    title = noArgTitle;
  } else { // all from a sub-subject (member for roles, role for members)
    let subSubject: PossibleListing;
    const searched = await (search(arg, "user", self, { allowForeign: false }));
    if (searched.subject) {
      subSubject = guild.member(searched.subject);
    } else {
      return;
    }
    subjects = _.at(subSubject, [subjectProp as any])[0] as any; // get the subjects we want from the sub subject

    const escReplace = (str: string) => String( // replace placeholders of paths like {name} to their value using _.at
      _.at(
        subSubject,
        [str.match(/\{([\w\.]+)\}/)[1] as any]
      )[0]
    ).replace(/`/g, "'");
    content = `Here are ${member.user.tag}'s roles:`;
    invalid = "That member has no roles (other than the default)!";
    title = `${member.user.tag}'s Roles`;
  }
  const arr = subjects.array().sort(sort).filter(v => filterer(v, guild));
  if (arr.length < 1) return reply(invalid);
  const isG = subjects === guild[guildProp];
  const pages = paginate(arr);
  if (strPage.length > 5) {
    page = 1;
  } else {
    page = Number(strPage);
  }
  /**
   * Generate a page embed
   * @param page Page number
   * @returns Generated embed
   */
  const gen = (page: number) => {
    page = _.clamp(isNaN(page) ? 1 : page, 1, pages.length);
    const emb = new Embed()
      .setAuthor(title);
    if (pages.length > 1) emb.setFooter(`To go to a specific page, write ${p}info ${action || "roles"} \
${argu ? argu + "<page>" : "<page>"}.`);
    let desc = "";
    for (const role of pages[page - 1]) {
      desc += `${textWorker(role, arr, isG, android, guild)}\n`;
    }
    emb.setDescription(_.trim(desc));
    return emb;
  };
  const paginateObj = {
    page,
    maxPage: pages.length,
    pages,
    usePages: true,
    format: gen,
    content
  };
  await sleep(100); // to maek typing count
  return sendIt(gen(page), { content, paginate: paginateObj });
};

/* export const roles = new Command({
  description: "Alias to info roles. View all or a member's roles.",
  func,
  name: "serverinfo",
  perms: "info.server",
  args: {},
  guildOnly: true,
  category: "Info",
  example: `
{p}{name}`,
  default: true,
  aliases: {
    guildinfo: {
      description: "View info of current server",
      action: "serverinfo"
    },
    serverid: {
      description: "View ID of current server",
      action: "serverid"
    },
    guildid: {
      description: "View ID of current server",
      action: "serverid"
    }
  }
}); */
