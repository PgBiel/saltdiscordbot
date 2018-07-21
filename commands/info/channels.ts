import { TcmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "./info";
import {
  _, Role, bot, search, Embed, Constants, Command, sleep, paginate, GuildMember, capitalize,
  globalPositions,
  TextChannel,
  escMarkdown,
  no2Tick,
  noEscape
} from "../../misc/d";
import {
  Collection, Guild, GuildEmoji, GuildChannel, GuildChannelStore, CategoryChannel, ChannelData, VoiceChannel
} from "discord.js";
import { SearchType } from "../../funcs/parsers/search";

type PossibleListing = GuildMember | GuildEmoji | Role | GuildChannel;

export type GuildChannelType = "text" | "voice" | "category";

/*
 case "channels":
        case "texts":
        case "textchannels":
        case "voices":
        case "voicechannels":
        case "categories":
        case "ctgs":
          cPlural = channelData[action].plural;
          ccPlural = capitalize(cPlural, { all: true, lowerCase: true });

          noArgCont = `Here are the server's ${cPlural}:`;
          noArgInvalid = `This server has no ${cPlural}!`;
          noArgTitle = `All ${ccPlural}`;

          argCont = `Here are the ${cPlural} for the category \`{name}\`:`;
          argInvalid = `That category has no ${cPlural}!`;
          argTitle = `Inner ${ccPlural} of the category \`{name}\``;

          type = "channel";
          channelType = channelData[action].types;
          guildWide = guild.channels;
          sort = (a: GuildChannel, b: GuildChannel) => (
            usedGuildWide ?
              globalPos.get(b.id).position - globalPos.get(a.id).position :
              b.position - a.position
          )
          filterer = c => _.castArray(channelData[action].types).includes(c.type);
          textWorker = (chan, arr, isG) => {
            const fArr = arr.filter(c => c.type === chan.type);
            const chanPos = fArr.indexOf(chan);
            const position = fArr.length - chanPos; // Arr length - chanPos to reverse the sorting
            const emj = Constants.emoji.channels[String(chan.type).toUpperCase()] || "";
            return `**${isNaN(position) ? `${position}:` : `\`${position}.\``}** ${emj}${dankEscape(chan.name)}`;
          };
          subjectProp = "children";
          break;
*/

/* const datas: { [prop: string]: MultiInfoDummy["data"] } = {
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
    filterer: (v: Role, g: Guild) => v.id !== g.id,

    subjectProp: "members",
    guildProp: "roles"
  }
}; */

const channelData: { [name: string]: { plural: string, types: GuildChannelType[] } } = {
  channels: { plural: "channels", types: ["text", "voice"] },
  texts: { plural: "text channels", types: ["text"] },
  textchannels: { plural: "text channels", types: ["text"] },
  voices: { plural: "voice channels", types: ["voice"] },
  voicechannels: { plural: "voice channels", types: ["voice"] },
  categories: { plural: "categories", types: ["category"] },
  ctgs: { plural: "categories", types: ["category"] }
};

const typePlurals: { [type in GuildChannelType]: { normal: string, cap: string } } = {
  text: {
    normal: "text channels",
    cap: "Text Channels"
  },
  voice: {
    normal: "voice channels",
    cap: "Voice Channels"
  },
  category: {
    normal: "categories",
    cap: "Categories"
  }
};

const func: TcmdFunc<AInfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member, sendIt
}) {
  if (!perms["info.channels"]) return reply("Missing permission `info channels`! :frowning:");
  channel.startTyping();
  const {
    android, action, arg: _arg, trArg
  } = dummy || {} as never;
  const usedChan = action || "channels";
  const cPlural = channelData[usedChan].plural;
  const ccPlural = capitalize(cPlural, { lowerCase: true, all: true });
  const cType = channelData[usedChan].types;

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
  let channels: Collection<string, GuildChannel> | GuildChannelStore;
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
  const globalPos = globalPositions(guild, true);
  /**
   * Escape mentions
   */
  const dankEscape = (str: string) => str.replace(/<([@#])/, "<\\$1");
  let isGChannels = false;
  if (!arg || /^\d{1,5}$/.test(arg) || ["categories", "ctgs"].includes(usedChan)) { // all from guild
    channels = guild.channels;
    isGChannels = true;
    content = `Here are the server's ${cPlural}:`;
    invalid = `This server has no ${cPlural}!`;
    title = `All ${ccPlural}`;
  } else { // all from a sub-subject (category)
    let subSubject: CategoryChannel;
    const searched = await (search(arg, "channel", self, { channelType: "category", allowForeign: false }));
    if (searched.subject) {
      subSubject = searched.subject;
    } else {
      return;
    }
    channels = subSubject.children;
    content = `Here are the ${cPlural} for the category \
\`\`${noEscape(no2Tick(subSubject.name, { mode: "sub" }), { mode: "sub" })}\`\`:`;
    invalid = `That category has no ${cPlural}!`;
    title = `Inner ${ccPlural} of the category \`${subSubject.name}\``;
  }
  const channelsArr: GuildChannel[] = channels.array()
    .sort((a: GuildChannel, b: GuildChannel) => (
        isGChannels ?
          globalPos.get(a.id).position - globalPos.get(b.id).position : // position disconsidering categories
          a.position - b.position
    ))
    .filter(c => _.castArray(channelData[usedChan as keyof typeof channelData].types).includes(c.type as GuildChannelType));
  if (channelsArr.length < 1) return reply(invalid);
  const textChannelsArr: TextChannel[] = channelsArr.filter(c => c.type === "text") as TextChannel[];
  const voiceChannelsArr: VoiceChannel[] = channelsArr.filter(c => c.type === "voice") as VoiceChannel[];
  const pages = paginate(channelsArr);
  /**
   * New pages, grouped
   */
  let newPages: GuildChannel[][] = [];
  if (channelData[usedChan as keyof typeof channelData].types.length > 1) {
    newPages = (paginate((textChannelsArr as GuildChannel[]).concat(voiceChannelsArr as GuildChannel[])));
    /* newPages = [];
    /**
     * The current type we are grouping
     * /
    let currentLoopType: GuildChannelType = "text";
    /**
     * Current page on the loop
     * /
    let currLoopPage: number = 0;
    /**
     * If the current loop type has been used before
     * /
    let hadLoopBefore: boolean = false;
    let stampNext
    for (const semiPage of pages) { // O(n)
      newPages.push([]);
      let currEl: number = 0;
      for (const el of semiPage) { // O(n^2)
        if (el.type === currentLoopType) {
          hadLoopBefore = true;
          newPages[currLoopPage].push(el);
        } else if (hadLoopBefore) {
          if (currentLoopType === "text") newPages[0].unshift(`**${typePlurals.text.cap}**`);
          if (currEl >= pages[currLoopPage].length - 1)
        }
      }
    } */
  }
  if (strPage.length > 5) {
    page = 1;
  } else {
    page = Number(strPage);
  }

  const textWorker = (chan: GuildChannel) => {
    const fArr = channelsArr.filter(c => c.type === chan.type);
    const chanPos: number = fArr.indexOf(chan);
    const suffix: string = chanPos < 1 ?
    "Highest" :
    (
      chanPos === fArr.length - 1 ?
        "Lowest" :
        ""
    );
    const position: number = chanPos;
    const emj = Constants.emoji.channels[String(chan.type).toUpperCase()] || "";
    return `**${`\`${position}.\``}${suffix ? ` ${suffix}:` : ""}** ${emj}${escMarkdown(dankEscape(chan.name))}`;
  };
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
    if (pages.length > 1) emb.setFooter(emb.footer.text + ` | Page ${page}/${pages.length} – To change, write ${p}info roles \
${argu && !["categories", "ctgs"].includes(usedChan) ? argu + "<page>" : "<page>"}.`);
    let desc = "";
    let wasVoiced: boolean = false;
    let wasTexted: boolean = false;
    for (const chan of (usedChan === "channels" ? newPages : pages)[page - 1]) {
      if (usedChan === "channels") {
        if (!wasVoiced && chan.type === "voice") {
          desc += "**__Voice Channels__**\n";
          wasVoiced = true;
        }
        if (!wasTexted && page === 1 && voiceChannelsArr.length > 0) {
          desc = `**__Text Channels__**\n` + desc;
          wasTexted = true;
        }
      }
      desc += `${textWorker(chan)}\n`;
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

export const channels = new Command({
  description: "View the list of channels in the server or in a category",
  func,
  name: "channels",
  perms: "info.channels",
  args: { category: true },
  guildOnly: true,
  category: "Info",
  example: `
{p}{name}
{p}{name} A Cool Category`,
  default: true,
  aliases: {
    textchannels: {
      description: "View the list of text channels in the server or in a category",
      action: "textchannels",
      show: true,
      aliases: {
        texts: { action: "texts" }
      }
    },
    voicechannels: {
      description: "View the list of voice channels in the server or in a category",
      action: "voicechannels",
      show: true,
      aliases: {
        voices: { action: "voices" }
      }
    },
    categories: {
      description: "View the list of categories in the server",
      action: "categories",
      show: true,
      example: `{p}{name}`,
      args: {},
      aliases: {
        ctgs: { action: "ctgs" }
      }
    }
  }
});
