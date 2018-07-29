import { TcmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "./info";
import {
  _, Role, bot, search, Embed, Constants, Command, sleep, paginate, GuildMember, escMarkdown, logger, no2Tick,
  noEscape, capitalize
} from "../../misc/d";
import { Collection, Guild, GuildEmoji, GuildChannel, GuildMemberStore, TextChannel, VoiceChannel } from "discord.js";

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
  const {
    android, action, arg: _arg, trArg,
  } = dummy || {} as never;
  if (!perms["info." + (action || "members")]) return reply("Missing permission `info members`! :frowning:");
  channel.startTyping();
  const isDiff: boolean =  action == null ? false : action !== "members";
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
  let isGMembers = false;
  const typeText = isDiff ? (action === "readers" ? "text channel" : "voice channel") : "role";
  if (action === "readers" ? false : (!arg || /^\d{1,5}$/.test(arg))) { // all from guild - reader has a default search
    if (isDiff) {
      return reply(
        "Please specify a voice channel to view the list of members who can connect to it!"
      );
    }
    members = guild.members;
    isGMembers = true;
    content = "Here are the server's members:";
    invalid = "This server has no members that I know of! (Huh?)";
    title = `All Members`;
  } else { // all from a sub-subject (member for roles, role for members)
    let subSubject: Role | TextChannel | VoiceChannel;
    if (arg) {
      const searched = await (
        search(
          arg,
          isDiff ? "channel" : "role", self, { allowForeign: false, channelType: action === "readers" ? "text" : "voice" }
        )
      );
      if (searched.subject) {
        subSubject = searched.subject as typeof subSubject;
      } else {
        return;
      }
    } else if (action === "readers") {
      subSubject = channel;
    } else { return; }
    if (subSubject instanceof VoiceChannel) {
      members = new Collection<string, GuildMember>();
      for (const [id, member] of guild.members) {
        if (subSubject.permissionsFor(member).has("CONNECT")) members.set(id, member);
      }
    } else {
      members = subSubject.members;
    }
    content = `Here are the ${action || "member"}s of the ${typeText} \
${action === "readers" ? subSubject.toString() : `\`\`${noEscape(no2Tick(subSubject.name))}\`\``}:`; // text channels as mentions
    invalid = isDiff ?
      `No members can ${action === "readers" ? "access" : "connect to"} that ${typeText}!` :
      "That role has no members!";
    title = `${capitalize(action || "members")} of the ${capitalize(typeText, { all: true })} \`${subSubject.name}\``;
  }
  const highPosSorter = (a: Role, b: Role) => b.position - a.position;
  const membersArr = members.array()
    .sort((a, b) => {
      const alphabetic = a.displayName > b.displayName ? 1 : -1;
      if (!isGMembers && (!isDiff ? true : action === "listeners")) return alphabetic;
      const heFilterer = (m: GuildMember) => m.roles.filter(r => r.hoist || r.id === guild.id);
      const hoistAndEv = {
        a: heFilterer(a),
        b: heFilterer(b)
      };
      const highestH = {
        a: hoistAndEv.a.sort(highPosSorter).first(),
        b: hoistAndEv.b.sort(highPosSorter).first()
      };

      if (highestH.a === highestH.b) {
        if (highestH.a.id === guild.id) {
          const onOff = (m: GuildMember) => m.user.presence.status === "offline" ? "offline" : "online";
          if (onOff(a) === onOff(b)) return alphabetic; // same status
          if (onOff(a) === "offline") return 1; // ofline comes after
          return -1; // b is offline
        } else {
          return alphabetic;
        }
      }

      return highestH.b.position - highestH.a.position;
    })
    .filter(m => m instanceof GuildMember);
  if (membersArr.length < 1) return reply(invalid);
  title += ` (${membersArr.length})`;
  if (strPage.length > 5) {
    page = 1;
  } else {
    page = Number(strPage);
  }

  const everyoneMembers = guild.roles.get(guild.id).members // default role
    .filter(m => m.roles.filter(r => r.id === guild.id ? false : r.hoist).size < 1);
  const online = everyoneMembers.filter(m => m.user.presence.status !== "offline");
  const offline = everyoneMembers.filter(m => m.user.presence.status === "offline");

  const pages = paginate(membersArr);
  /**
   * Generate a page embed
   * @param page Page number
   * @returns Generated embed
   */
  const gen = (page: number) => {
    page = _.clamp(isNaN(page) ? 1 : page, 1, pages.length);
    const emb = new Embed()
      .setAuthor(title)
      .setFooter("Alphabetic Sort");
    if (pages.length > 1) emb.setFooter(emb.footer.text + ` | Page ${page}/${pages.length} – To change, write ${p}info \
${action || "members"} ${argu ? argu + " <page>" : "<page>"}.`);
    let desc = "";
    let currentRole: string;
    for (const member of pages[page - 1]) {
      if (isGMembers || action === "readers") {
        const hoistedR = member.roles.filter(r => r.hoist || r.id === guild.id).sort(highPosSorter);
        const highestHoisted = hoistedR.first();
        if (highestHoisted.id === guild.id) {
          if (currentRole !== "offline" && member.user.presence.status === "offline") {
            currentRole = "offline";
            desc += `**__Offline__ - ${offline.size}**\n`;
          } else if (member.user.presence.status !== "offline" && currentRole !== "online") {
            currentRole = "online";
            desc += `**__Online__ - ${online.size}**\n`;
          }
        } else if (currentRole !== highestHoisted.id) {
          currentRole = highestHoisted.id;
          const highMembersInIt = highestHoisted.members
            .filter(m => m.roles.filter(r => r.hoist || r.id === guild.id).sort(highPosSorter).first().id === highestHoisted.id)
            .size;
          desc += `**__${highestHoisted.name}__ - ${highMembersInIt}**\n`;
        }
      }
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
    },
    readers: {
      description: "View the list of members that can read a text channel.",
      perms: "info.readers",
      action: "readers",
      args: { "text channel": true },
      show: true,
      aliases: {
        areaders: {
          description: "Android Readers - View the list of members that can read a text channel, but without mentions.",
          android: true
        }
      }
    },
    listeners: {
      description: "View the list of members that can connect to a voice channel.",
      perms: "info.listeners",
      action: "listeners",
      args: { "voice channel": false },
      show: true,
      aliases: {
        alisteners: {
          description: "Android Listeners - View the list of members that can connect to a voice channel, but without mentions.",
          android: true
        }
      }
    }
  }
});
