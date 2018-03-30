import { TcmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "../info/info";
import { Role, bot, search, Embed, Constants, Command, sleep, paginate } from "../../misc/d";
import { Collection } from "discord.js";
import { SearchType } from "../../funcs/parsers/search";

class B {
  constructor() {  }
}

const a: InstanceType<B>;

type MultiInfoDummy = AInfoDummy & {
  data?: {
    noArgCont: string;
    noArgInvalid: string;
    noArgTitle: string;

    argCont: string;
    argInvalid: string;
    argTitle: string;

    type: SearchType;
    sort: (a, b) => number;
    textWorker: (v, arr, isGuild: boolean) => string;
    filterer?: (v) => boolean;

    subjectProp?: string;

    guildProp: {
      [P in keyof Guild.prototype]: P
    };
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
    data = {
      noArgCont: "
    }
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
   * List of roles to use
   */
  let roles: Collection<string, Role>;
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
  if (!arg || /^\d{1,5}$/.test(arg)) {
    roles = guild.roles;
    content = "Here are the server's roles:";
    invalid = "This server has no roles (other than the default)!";
    title = "All Roles";
  } else {
    let member;
    const searched = await (search(arg, "user", self, { allowForeign: false }));
    if (searched.subject) {
      member = guild.member(searched.subject);
    } else {
      return;
    }
    roles = member.roles;
    content = `Here are ${member.user.tag}'s roles:`;
    invalid = "That member has no roles (other than the default)!";
    title = `${member.user.tag}'s Roles`;
  }
  const rolesArr = roles.array().sort((a, b) => b.position - a.position).filter(r => r.id !== guild.id);
  if (rolesArr.length < 1) return reply(invalid);
  const isGRoles = roles === guild.roles;
  const pages = paginate(rolesArr);
  if (strPage.length > 5) {
    page = 1;
  } else {
    page = Number(strPage);
  }
  const gen = (page: number) => {
    page = _.clamp(isNaN(page) ? 1 : page, 1, pages.length);
    const emb = new Embed()
      .setAuthor(title);
    if (pages.length > 1) emb.setFooter(`To go to a specific page, write ${p}info roles \
${argu ? argu + "<page>" : "<page>"}.`);
    let desc = "";
    for (const role of pages[page - 1]) {
      if (role.id === guild.id) continue;
      const rolePos = rolesArr.indexOf(role);
      const position = rolePos < 1 ?
      (isGRoles ? "Top" : "Highest") :
      (
        rolePos === rolesArr.length - 1 ?
          (isGRoles ? "Bottom" : "Lowest") :
          rolesArr.length - 1 - rolePos // rolesArr length - rolePos to reverse the sorting; - 1 to keep zero-indexed
      );
      desc += `**${isNaN(position) ? `${position}:` : `${position}.`}** <@&${role.id}> \n`;
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

export const serverinfo = new Command({
  description: "View info of current server",
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
});