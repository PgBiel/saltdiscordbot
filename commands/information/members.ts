import { TcmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "./info";
import { _, Role, bot, search, Embed, Constants, Command, sleep, paginate, GuildMember, escMarkdown } from "../../misc/d";
import { Collection, Guild, GuildEmoji, GuildChannel, GuildMemberStore } from "discord.js";
import { SearchType } from "../../funcs/parsers/search";

type PossibleListing = GuildMember | GuildEmoji | Role | GuildChannel;

/* type MultiInfoDummy = AInfoDummy & {
  data?: {
    noArgCont: string;
    noArgInvalid: string;
    noArgTitle: string;

    argCont: string;
    argInvalid: string;
    argTitle: string;

    /**
     * Type to search when using subject wide collection
     * /
    type: SearchType;
    sort: (a: PossibleListing, b: PossibleListing) => number;
    textWorker: (val: PossibleListing, arr: PossibleListing[], isGuild: boolean, isAndroid: boolean) => string;
    filterer?: (val: PossibleListing, guild: Guild) => boolean;

    /**
     * for subjectWide collection
     * /
    subjectProp?: PossibleProps<PossibleListing>;
    /**
     * for guildWide collection
     * /
    guildProp: OnlyPropsOf<Guild, Collection<string, PossibleListing>>;
  }
}; */

/* const datas: { [prop: string]: MultiInfoDummy["data"] } = {
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
}; */

const func: TcmdFunc<AInfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member, sendIt
}) {
  if (!perms["info.members"]) return reply("Missing permission `info members`! :frowning:");
  channel.startTyping();
  const {
    android, action, arg: _arg, trArg
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
  let members: Collection<string, GuildMember> | GuildMemberStore;
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
  const sepArg = (arg || "").split(" ");
  if (/^\d+$/.test(sepArg[sepArg.length - 1])) {
    strPage = sepArg.pop();
  } else {
    strPage = "1";
  }
  argu = sepArg.join(" ");
  let isGRoles = false;
  if (!arg || /^\d{1,5}$/.test(arg)) { // all from guild
    members = guild.members;
    isGRoles = true;
    content = "Here are the server's members:";
    invalid = "This server has no members that I know of! (Huh?)";
    title = "All Members";
  } else { // all from a sub-subject (member for roles, role for members)
    let subSubject: Role;
    const searched = await (search(arg, "role", self, { allowForeign: false }));
    if (searched.subject) {
      subSubject = searched.subject;
    } else {
      return;
    }
    members = subSubject.members;
    content = `Here are the members of the role ${subSubject.name}`;
    invalid = "That role has no members!";
    title = `Members of the Role ${subSubject.name}`;
  }
  const membersArr = members.array()
    .sort((a, b) => {
      const isHigher = a.displayName > b.displayName; // secondary
      const hoisted = { // primary
        a: a.roles.filter(r => r.hoist).sort((c, d) => d.position - c.position).array(),
        b: b.roles.filter(r => r.hoist).sort((c, d) => d.position - c.position).array()
      };
      if (hoisted.a.length === hoisted.b.length && hoisted.b.length === 0) return Number(isHigher) || -1; // no hoisted
      if (hoisted.a.length < 1) return 1;
      if (hoisted.b.length < 1) return -1;
      const res = hoisted.b[0].position - hoisted.a[0].position;
      if (res) return res;
      if (isHigher) return 1;
      return -1;
    })
    .filter(m => m instanceof GuildMember);
  if (membersArr.length < 1) return reply(invalid);
  const pages = paginate(membersArr);
  if (strPage.length > 5) {
    page = 1;
  } else {
    page = Number(strPage);
  }

  const hoistedRoles = new Collection<string, Collection<string, GuildMember>>();
  const hoistedArr = guild.roles.array().reverse().filter(r => r.id === guild.id ? false : r.hoist);

  const allHoistedMembers: GuildMember[] = [];

  for (const role of hoistedArr) {
    if (role.id === guild.id) {

      hoistedRoles.set("online", online).set("offline", offline);
    } else {
      role.members.forEach(m => allHoistedMembers.push(m));
      hoistedRoles.set(role.id, role.members);
    }
  }

  const everyoneMembers = guild.roles.get(guild.id).members // default role
    .filter(m => m.roles.filter(r => r.id === guild.id ? false : !r.hoist).size === 0);
  const online = everyoneMembers.filter(m => m.user.presence.status !== "offline");
  online.forEach(m => allHoistedMembers.push(m));
  const offline = everyoneMembers.filter(m => m.user.presence.status === "offline");
  offline.forEach(m => allHoistedMembers.push(m));
  const pagedHoisted = paginate(allHoistedMembers);
  /**
   * Generate a page embed
   * @param page Page number
   * @returns Generated embed
   */
  const gen = (page: number) => {
    page = _.clamp(isNaN(page) ? 1 : page, 1, pages.length);
    const emb = new Embed()
      .setAuthor(title)
      .setFooter("Top→Bottom");
    if (pages.length > 1) emb.setFooter(emb.footer.text + ` | Page ${page}/${pages.length} – To change, write ${p}info members \
${argu ? argu + "<page>" : "<page>"}.`);
    let desc = "";
    let currentRole: string;
    for (const member of pagedHoisted[page - 1]) {
      const hoistedR = member.roles.filter(r => r.hoist);
      const highestHoisted = hoistedR.last().id;
      if (highestHoisted === guild.id) {
        if (currentRole === "online") {
          if (member.user.presence.status === "offline") {
            currentRole = "offline";
            desc += `**__`
          }
        }
      }
      const membPos = membersArr.indexOf(member);
      const position = membersArr.length - membPos; // Arr length - membPos to reverse the sorting;
      const memberText = android ?
         escMarkdown(member.user.tag.replace(/<([@#])/, "<\\$1")) :
        `<@!${member.id}>`;
      desc += `• ${memberText}${member.id === guild.ownerID ? Constants.emoji.rjt.OWNER : ""}\
${member.user.bot ? " **[BOT]**" : ""}\n`;
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

export const members = new Command({
  description: "View the list of members in the server or of a role",
  func,
  name: "members",
  perms: "info.members",
  args: { role: true },
  guildOnly: true,
  category: "Information",
  example: `
{p}{name}
{p}{name} A Fancy Role`,
  default: true,
  aliases: {
    amembers: {
      description: "Android Members – View the list of members in the server or of a role, but without mentions.",
      perms: "info.members",
      args: { role: true },
      android: true
    }
  }
});
