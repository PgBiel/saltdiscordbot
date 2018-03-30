import Command from "../../classes/command";
import {
  https, http, bot, rejct, User, Constants, formatStatus, formatActivity, Embed, ago, momentUTC, _, TextChannel,
  search, cross, no2Tick, escMarkdown, GuildMember, Role, GuildChannel, globalPositions, capitalize, paginate, sleep
} from "../../misc/d";
import { cmdFunc, TContext } from "../../misc/contextType";
import { Guild, GuildEmoji, Collection } from "discord.js";
import { ExtendedMsgOptions } from "../../handlerfuncs/senders/proto-send";
import { SearchType } from "../../funcs/parsers/search";
import { Storage } from "saltjs";

export type AInfoDummy = InfoDummy & { arg?: string, trArg?: string };

export type InfoDummy = {
  android?: boolean;
  action?: string;
}

/**
 * Info actions that can be used outside of guilds, even if limitedly
 */
export type NoGInfoAction = "user"   | "member"       | "id"             | "userid" |
  "channel"      | "textchannel"     | "text"         | "channelid"      | "textid" | "textchannelid" |
  "voicechannel" | "voice"           | "voiceid"      | "voicechannelid" |
  "perms"        | "dperms"          | "discordperms" | // when out of a guild, you can only specify a number 
  "category"     | "categoryid"      | "ctg"          | "ctgid"          |
  "stats"        | "bot";

/**
 * Info actions that can be used inside guilds (excluding those that also can be used outside)
 */
export type GInfoAction = "server"   | "guild"  | "serverid"      | "guildid"      |
"members"   | "channels"             | "voices" | "voicechannels" | "textchannels" | "texts" | "categories" | "ctgs" |
"emoji"     | "emojiid"              |
"role"      | "roleid"               | "roles"  |
"cperms"    | "channelperms"         |
"saltperms" | "stperms"              | "listperms";

/**
 * All actions
 */
export type InfoAction = GInfoAction | NoGInfoAction;

export type CollVal<T extends (Collection<any, any> | Storage<any, any>), R = any> =
  T extends Collection<any, infer CV> ?
    CV :
    T extends Storage<any, infer SV> ?
      SV :
      R;

export type CollKey<T extends (Collection<any, any> | Storage<any, any>), R = any> =
  T extends Collection<infer CK, any> ?
    CK :
    T extends Storage<infer SK, any> ?
      SK :
      R;

const func: cmdFunc<InfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member
}) {
  const sendIt = (emb: Embed, opts?: ExtendedMsgOptions) => {
    return send(Object.assign({ embed: emb, autoCatch: false, deletable: true }, opts))
      .catch(err => [403, 50013].includes(err.code) ?
        send("Please make sure I can send embeds in this channel.") :
        void(rejct(err, "[SEND-IT-INFO]"))
      );
  };
  let action: string = String(dummy && dummy.action ? dummy.action : String(arrArgs[0] || "")).toLowerCase();
  let isAndroid: boolean = Boolean(dummy && dummy.android !== null ? dummy.android : false);
  const isInG = (chan): chan is TextChannel => channel instanceof TextChannel;
  const isDM: boolean = !isInG(channel);
  if (/^a(?:ndroid)?/i.test(action)) {
    action = action.replace(/^a(?:ndroid)?/i, "");
    isAndroid = true;
  }
  const arrArg: string[] = arrArgs.slice(dummy && dummy.action ? 0 : 1);
  const arg: string = arrArg.join(" ");
  const noGActions = [
    "user", "member", "id", "userid",
    "channel", "textchannel", "text", "channelid", "textid", "textchannelid",
    "voicechannel", "voice", "voiceid", "voicechannelid",
    "perms", "dperms", "discordperms", // when out of a guild, you can only specify a number 
    "category", "categoryid", "ctg", "ctgid",
    "stats", "bot"];
  const gActions = noGActions.concat([
    "server", "guild", "serverid", "guildid",
    "members", "channels", "voices", "voicechannels", "textchannels", "texts", "categories", "ctgs",
    "emoji", "emojiid",
    "role", "roleid", "roles",
    "cperms", "channelperms",
    "saltperms", "stperms", "listperms" // I was going to alias it with "sperms" but then I realized...
  ]);
  const is = (...list: string[]) => list.includes(action);
  const usableActions: string[] = guild ? gActions : noGActions;
  if (!_.trim(action)) {
    return reply("Please specify something to view information for! (See the help command if you need help.)");
  }
  if (!usableActions.includes(action)) {
    if (gActions.includes(action)) {
      return reply("You can only view that info when on a server!");
    }
    return reply("Unknown action (info to view)! (See the help command if you need help.)");
  }
  if (
    guild &&
    !is(
      "roleid", "id", "userid", "perms", "dperms", "discordperms", "channelid", "serverid", "guildid",
      "categoryid", "textchannelid", "voiceid", "voicechannelid", "emojiid"
    ) &&
    isInG(channel) &&
    !channel.permissionsFor(guild.me).has(["EMBED_LINKS"])
  ) {
    return reply("I need the permission `Embed Links` on this channel to be able to send embeds! :frowning:");
  }
  const searchOpt = { guild, send, reply, promptAmbig };
  const trArg = _.trim(arg);
  if (isInG(channel)) {
    if (is(
      "roles",
      "channels", "textchannels", "texts",
      "voices", "voicechannels",
      "categories", "ctgs",
      "members"
    )) {
      const perm = is("roles") ?
        "roles" :
        (
          is("members") ?
            "members" :
            "channels"
        );
      if (!perms["info." + perm]) return reply(`Missing permission \`info ${perm}\`! :frowning:`);
      channel.startTyping();
      /**
       * Message content
       */
      let content: string;
      /**
       * Text to send if none of the subjects exist
       */
      let invalid: string;
      /**
       * Embed Title
       */
      let title: string;
      /**
       * Found subjects
       */
      let subjects: Collection<string, Role | GuildMember | GuildEmoji | GuildChannel>;
      /**
       * Page in list
       */
      let page: string;
      /**
       * Passed search terms
       */
      let argu: string;

      // specific to types
      /**
       * Content if no arg was given
       * @see content
       */
      let noArgCont: string;
      /**
       * Content if a search term was given
       * @see content
       */
      let argCont: string;

      /**
       * Invalid text if no arg was given
       * @see invalid
       */
      let noArgInvalid: string;
      /**
       * Invalid text if a search term was given
       * @see invalid
       */
      let argInvalid: string;

      /**
       * Title if no search term was given
       * @see title
       */
      let noArgTitle: string;
      /**
       * Title if a search term was given
       * @see title
       */
      let argTitle: string;

      /**
       * Type of search based on the info command given
       */
      let type: SearchType;
      /**
       * All subjects of the guild
       */
      let guildWide: Collection<string, GuildMember | GuildEmoji | Role | GuildChannel>;
      /**
       * Property of found object to use as list of subjects
       */
      let subjectProp: string;
      /**
       * Type(s) of channel to look
       */
      let channelType: Array<"text" | "voice" | "category">;
      /**
       * Sorting function
       */
      let sort: (a: any, b: any) => number;
      /**
       * String function
       */
      let textWorker: (subject: any, arr: any[], isG: boolean) => string;
      /**
       * Filtering function
       */
      let filterer: (subject: any) => boolean;

      const sepArg: string[] = trArg.split(" ");
      if (/^\d+$/.test(sepArg[sepArg.length - 1])) {
        page = sepArg.pop();
      } else {
        page = "1";
      }
      argu = sepArg.join(" ");
      /**
       * Data for every kind of channel
       */
      const channelData = {
        channels: { plural: "channels", types: ["text", "voice"] },
        texts: { plural: "text channels", types: ["text"] },
        textchannels: { plural: "text channels", types: ["text"] },
        voices: { plural: "voice channels", types: ["voice"] },
        voicechannels: { plural: "voice channels", types: ["voice"] },
        categories: { plural: "categories", types: ["category"] },
        ctgs: { plural: "categories", types: ["category"] }
      };
      /**
       * Global positions of all channels (not including categories)
       */
      const globalPos = globalPositions(guild);
      /**
       * If we are going to use the guild wide coll
       */
      const usedGuildWide: boolean = !trArg || /^\d{1,5}$/.test(trArg);
      /**
       * Escape mentions
       */
      const dankEscape = (str: string) => str.replace(/<([@#])/, "<\\$1");
      /**
       * Channel type in plural
       */
      let cPlural: string;
      /**
       * Channel type in plural capitalized
       */
      let ccPlural: string;
      switch (action) {
        case "roles":
          noArgCont = "Here are the server's roles:";
          noArgInvalid = "This server has no roles (other than the default)!";
          noArgTitle = "All Roles";
          
          argCont = `Here are the roles of the member \`{user.tag}\`:`;
          argInvalid = "That member has no roles (other than the default)!";
          argTitle = `Roles of the Member \`{user.tag}\``;
  
          type = "user";
          guildWide = guild.roles;
          sort = (a: Role, b: Role) => b.position - a.position;
          textWorker = (role: Role, arr: Role[], isGRoles: boolean) => {
            const rolePos = arr.indexOf(role);
            const position = arr.length - rolePos; // rolesArr length - rolePos to reverse the sorting
            const roleText = isAndroid ?
              dankEscape(role.name) :
              `<@&${role.id}>`;
            return `**${isNaN(position) ? `${position}:` : `\`${position}.\``}** ${roleText}`;
          };
          filterer = (r: Role) => r.id !== guild.id;
          subjectProp = "roles";
          break;
  
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
        
        case "members":
          noArgCont = "Here are the server's members:";
          noArgInvalid = "This server has no members that I know of! (Huh?)";
          noArgTitle = "All Members";
          
          argCont = `Here are the members of the role \`{name}\`:`;
          argInvalid = "That role has no members!";
          argTitle = `Members of the Role \`{name}\``;
  
          type = "role";
          guildWide = guild.members; // all members in the server if no member is specified
          sort = (a, b) => (b.roles.highest.position - a.roles.highest.position) || (b.id - a.id); // highest pos; if not, oldest member
          textWorker = (member, arr) => {
            const membPos = arr.indexOf(member);
            const position = arr.length - membPos; // Arr length - membPos to reverse the sorting;
            const memberText = isAndroid ?
              dankEscape(member.user.tag) :
              `<@!${member.id}>`;
            return `• ${memberText}${member.id === guild.ownerID ? Constants.emoji.rjt.OWNER : ""}`;
          };
          subjectProp = "members";
          break;
      }
      if (!trArg || /^\d{1,5}$/.test(trArg)) {
        subjects = guildWide;
        content = noArgCont;
        invalid = noArgInvalid;
        title = noArgTitle;
      } else {
        let subject: CollVal<typeof subjects>;
        if (channelType ? channelType.length === 1 : true) {
          const chanType = channelType ? channelType[0] : "text";
          const { subject: subjectRes } = await (
            search(
              argu, type, searchOpt, { channelType: chanType, allowForeign: false }
            )
          );
          if (subjectRes) {
            if (subjectRes instanceof GuildChannel && subjectRes.type !== channelType[0]) {
              return reply(`${capitalize(chanType === "category" ? "category" : `${chanType} channel`)} not found!`);
            }
            subject = subjectRes instanceof User ? guild.member(subjectRes) : subjectRes as typeof subject;
          } else {
            return;
          }
        subjects = _.at(subject, [subjectProp as any])[0] as any;
        const escReplace = str =>  String(_.at(subject, str.match(/\{([\w\.]+)\}/)[1])[0]).replace(/`/g, "'");
        content = argCont.replace(/\{[\w\.]+\}/g, escReplace);
        invalid = argInvalid.replace(/\{[\w\.]+\}/g, escReplace);
        title = argTitle.replace(/\{[\w\.]+\}/g, escReplace);
      }
      const arr = subjects.array().sort(sort).filter(filterer || (() => true));
      if (arr.length < 1) return reply(invalid);
      const isG = subjects === guildWide;
      const pages = paginate(arr);
      if (page.length > 5) {
        page = 1;
      } else {
        page = Number(page);
      }
      let footer = "";
      if (type !== "channel" && !isAndroid) {
        footer += `If broken, try ${p}ainfo | `;
      }
      footer += "Sorting: Highest → Lowest";
      if (pages.length > 1 && !isDM) {
        footer += ` | To go to a specific page, write ${p}info ${action} ${argu ? argu + "<page>" : "<page>"}.`;
      }
      const gen = (page: number) => {
        page = _.clamp(isNaN(page) ? 1 : page, 1, pages.length);
        const emb = new Embed()
          .setTitle(title + ` (${arr.length}) - Page ${page}/${pages.length}`);
        let desc = "";
        if (type === "channel") {
          let descs = { "text": [], "voice": [], "category": [] };
          for (const chan of pages[page - 1]) {
            descs[chan.type].push(textWorker(chan, arr, isG));
          }
          const entrs = Object.entries(descs);
          const hasMoreThanOneFilledArray = Object.values(descs).reduce((acc, curr) => curr && curr.length > 0 ? acc + 1 : acc, 0) >= 2;
          for (const [cType, results] of entrs) {
            if (results.length < 1) continue;
            if (hasMoreThanOneFilledArray) {
              desc += `**__${capitalize(channelData[cType === "category" ? "categories" : cType + "s"].plural, { all: true })}__**\n`;
            }
            for (const res of results) desc += res + "\n";
          }
        } else {
          for (const subj of pages[page - 1]) {
            if (subj.id === guild.id && type === "role") continue;
            desc += textWorker(subj, arr, isG) + "\n";
          }
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
      await sleep(200); // to maek typing count
      return sendIt(gen(page), { content, paginate: paginateObj });
    } else if (is("perms", "dperms", "discordperms", "cperms", "channelperms")) {
      if (!perms["perms"]) return reply("Missing permission `info perms`! :frowning:");
      const special = {
        "MANAGE_GUILD": "Manage Server",
        "USE_VAD": "Use Voice Activity",
        "VIEW_CHANNEL": "View Channel (Read Messages/Connect to Voice)"
      };
      const { Permissions, User, GuildMember } = Discord;
      let use;
      let type = "role";
      let chan;
      let specified;
      if (is("cperms")) {
        // wip
      } else {
        if (!guild && !/^\d+$/.test(trArg)) {
          return reply("When outside a guild, you may only specify a permissions number!");
        }
        if (!trArg) {
          type = "user";
          specified = author.tag;
          use = member.permissions;
        } else if (/^\d+$/.test(trArg) && trArg.length < 16) {
          type = "number";
          specified = trArg;
          use = new Permissions(Number(trArg));
        } else if (Constants.regex.MENTION.test(trArg) || Constants.regex.NAME_AND_DISCRIM.test(trArg)) {
          type = "user";
          const { subject } = await (search(trArg, "user", self, { allowForeign: false }));
          if (subject) {
            specified = (subject.user || subject).tag;
            use = subject.permissions;
          } else {
            return;
          }
        } else if (/^(?:user|member|role|number)(?:$|\s)/.test(trArg)) {
          const [preType, ...preName] = trArg.split(/\s+/);
          type = preType === "member" ? "user" : preType;
          const name = preName.join(" ");
          if (!name) {
            if (type === "user") {
              specified = author.tag;
              use = member.permissions;
            } else if (type === "role") {
              const rol = member.roles.highest;
              specified = rol.name;
              use = rol.permissions;
            } else if (type === "number") {
              return reply("Please specify a permissions number!");
            }
          } else {
            if (type === "user" || type === "role") {
              const { subject } = await (search(name, type, self, { allowForeign: false }));
              if (subject) {
                specified = subject instanceof User || subject instanceof GuildMember ?
                  (subject.user || subject).tag :
                  subject.name;
                use = (subject instanceof User ? guild.member(subject) : subject).permissions;
              } else {
                return;
              }
            } else if (type === "number") {
              if (name.length > 15) return reply("Please specify a valid permissions number!");
              specified - name;
              use = new Permissions(Number(name));
            }
          }
        } else {
          const { subject } = await (search(trArg, "role", self, { allowForeign: false }));
          if (subject) {
            specified = subject.name;
            use = subject.permissions;
          } else {
            return;
          }
        }
      }
      if (!(use instanceof Permissions)) return;
      let chanText = "";
      if (chan) {
        switch (chan.type) {
          case "text":
          case "voice":
            chanText = ` in the ${chan.type} channel **${chan.type === "text" ? String(chan) : chan.name}**`;
            break;
  
          case "category":
            chanText = ` in the category **${chan.name}**`;
            break;
        }
      }
      let str = `Permissions \
${type === "number" ? `stored in the number` : `for ${type === "user" ? "member" : "role"}`} **${specified}**${chanText}:
\`\`\`diff\n`;
      if (use.has("ADMINISTRATOR")) {
        str += `+ All (Includes Administrator)`;
      } else if (use.bitfield === (Permissions.ALL | Permissions.FLAGS.ADMINISTRATOR)) { // all except admin
        str += `+ All (Doesn't Include Administrator)`;
      } else if (use.bitfield < 1) {
        str += `- None`;
      } else {
        for (const flag of Object.keys(Permissions.FLAGS)) {
          str += `${use.has(flag) ? "+" : "-"} ${special[flag] || adaptSnake(flag)}\n`;
        }
      }
      return send(str + "```", { deletable: true });
    } else if (is("saltperms", "listperms", "stperms")) {
      
    }
  } else {
    if (is(
      "channel", "textchannel", "text", "textid", "channelid", "textchannelid", "voice", "voicechannel", "voiceid",
      "voicechannelid", "category", "categoryid", "ctg", "ctgid"
    )) {
      if (
        guild &&
        (
          is("category", "categoryid") && guild.channels.filter(c => c.type === "category").size < 1 ||
          is("voice", "voicechannel", "voiceid", "voicechannelid") && guild.channels.filter(c => c.type === "voice").size < 1
        )
      ) {
        if (is("category", "ctg", "ctgid", "categoryid")) return reply("There are no categories in this server!");
        return reply("There are no voice channels in this server!");
      }
      const isID = action.endsWith("id");
      let type, typeUsed, chnl;
      if (action.startsWith("text") || (action.startsWith("channel") && !trArg.startsWith("&"))) {
        type = "text";
      } else if (action.startsWith("voice") || (action.startsWith("channel") && trArg.startsWith("&"))) {
        type = "voice";
      } else {
        type = "category";
      }
      const lArg = trArg.replace(/^[#&]/, "");
      if (!lArg) {
        if (guild) {
          if (type === "text") {
            chnl = channel;
          } else if (type === "voice" && member.voiceChannel) {
            chnl = member.voiceChannel;
          } else {
            chnl = guild.channels.filter(c => c.type === type).sort((a, b) => b.position - a.position).last();
          }
        } else {
          return send("Please specify a channel (by mentioning it) or a channel ID!");
        }
      } else {
        const { subject } = await (search(lArg, "channel", self, { channelType: type, allowForeign: true }));
        if (!subject) return;
        chnl = subject;
      }
      typeUsed = chnl.type;
      if (isID) {
        return reply(`The ID of the ${typeUsed === "category" ? "category" : `${typeUsed} channel`} named \
  \`${escMarkdown(chnl.name)}\` is ${chnl.id}.`);
      }
      channel.startTyping();
      const dir = Constants.images.CHANNEL_INFO[chnl.nsfw ? "TEXT_NSFW" : typeUsed.toUpperCase()];

      const embed = new Embed() // general embed
        .setAuthor(
          `Info for ${typeUsed === "category" ? "category" : typeUsed + " channel"} "${chnl.name}"`,
          Constants.images.CHANNEL_INFO[typeUsed.toUpperCase()]
        )
        .setDescription(
          `Was created ${ago(chnl.createdAt, Date.now(), true) || "some time"} ago (${momentUTC(chnl.createdAt)})\
  ${guild ? (guild.channels.has(chnl.id) ? "" : "\n\nThis channel is from another server.") : ""}`
        )
        .setThumbnail(dir)
        .setColor("#CABE40")
        .setFooter(`${type === "category" ? "Category" : "Channel"} ID: ${chnl.id}`)
        .addField(
          `${chnl.parent ? "Relative " : ""}${typeUsed === "voice" ? "Voice " : ""}Position`,
          chnl.position,
          true
        )
        .addField(`Permission Overwrites`, chnl.permissionOverwrites.size, true);
      if (chnl.parent) embed.addField(`Category`, chnl.parent.name, true);
      if (typeUsed === "text" || typeUsed === "voice") {
        let invs;
        try {
          invs = await chnl.fetchInvites();
        } catch (err) { /* shrug */ }
        const membersArr = chnl.members
          .array()
          .sort((a, b) => a.displayName > b.displayName);
        const membersJoined = membersArr.length === guild.members.size ?
          "All members" :
          membersArr.map(m => isAndroid ? ((m || {}).user || {}).tag : String(m)).join(", ");
        if (typeUsed === "text") {
          let whs;
          try {
            whs = await chnl.fetchWebhooks();
          } catch (err) { /* shrug */ }
          embed
            .addField("Is NSFW", Constants.maps.YESNO[Boolean(chnl.nsfw)], true)
            .addField("Webhook Amount", whs ? whs.size : "Unable to view", true)
            .addField("Topic", chnl.topic || "None", true)
            .addField(
              `Members who can read this channel${membersArr.length < 1 ? "" : ` (${membersArr.length})`}`,
              membersJoined.length > Constants.numbers.max.chars.FIELD ?
                `Use \`\`${p}info viewers #${no2Tick(chnl.name)}\`\` to see (too long)` :
                (
                  membersJoined ||
                  "No members"
                ),
              false
            );
        } else if (typeUsed === "voice") {
          embed
            .addField("Bitrate", `${chnl.bitrate / 1000} kbps`, true)
            .addField("User Limit", chnl.userLimit || "Unlimited", true)
            .addField("Is full", Constants.maps.YESNO[Boolean(chnl.full)], true)
            .addField(
              `Members Connected\
  ${membersArr.length < 1 ? "" : ` (${membersArr.length + (chnl.userLimit ? `/${chnl.userLimit}` : "")})`}`,
              membersJoined.length > Constants.numbers.max.chars.FIELD ?
                `Use \`\`${p}info viewers ${no2Tick(chnl.name)}\`\` to see (too long)` :
                (
                  membersJoined ||
                  "No members"
                ), 
              false
            );
        }
      } else if (typeUsed === "category") {
        const globalPos = globalPosition(chnl.guild);
        const chArr = chnl.children
          .array()
          .sort((a, b) => globalPos.get(b.id).position - globalPos.get(a.id).position);
        const chJoined = chArr.length === globalPos.size ? "All channels" : chArr.join(", ");

        embed
          .addField(
            `Channels Within${chArr.length < 1 ? "" : ` (${chArr.length})`}`,
            chJoined.length > Constants.numbers.max.chars.FIELD ?
              `Use \`\`${p}info channels ${no2Tick(chnl.name)}\`\` to see (too long)` :
              (
                chJoined ||
                "No sub-channels"
              )
          );
      }
      return sendIt(embed);
    } else if (is("server", "guild", "guildid", "serverid")) {
      if (is("serverid", "guildid")) return reply(`The ID of the current server is \`${guildId}\`.`);
      channel.startTyping();
      const icon = guild.iconURL();
      const emb = new Embed()
        .setAuthor(
          guild.name,
          icon,
          icon
        )
        .setDescription(
          `Was created ${ago(guild.createdAt, Date.now(), true) || "some time"} ago (${momentUTC(guild.createdAt)})`
        )
        .setThumbnail(icon || Constants.images.SERVER_INFO.NO_ICON)
        .setFooter(`${icon ? "Click the title for Icon URL | " : ""}Server ID: ${guild.id}`)
        .addField("Owner", `<@!${guild.ownerID}>`, true)
        .addField(
          "Oldest Channel",
          guild.channels.filter(c => c.type === "text").sort((a, b) => a.createdTimestamp - b.createdTimestamp).first(),
          true
        )
        .addField(
          "Member Amount",
          `${guild.members.filter(m => m.presence.status !== "offline").size} online, ${guild.members.size} total`,
          true
        )
        .addField("Channel Amount", guild.channels.size, true)
        .addField("Role Amount", guild.roles.size, true)
        .addField("Emoji Amount", guild.emojis.size, true)
        .addField("Region", adaptSnake(guild.region), true)
        .addField("Verification Level", Constants.maps.VERIF[guild.verificationLevel], true);
      if (guild.features.length) emb.addField("Features", adaptSnake(guild.features) || "None");
      return sendIt(emb);
    } 
  }
  return;
}
}

export const info = new Command({
  func,
  name: "info",
  perms: {
    "info.user": true, "info.role": true, "info.channel": true, "info.server": true,
    "info.bot": true, "info.roles": true, "info.channels": true, "info.members": true,
    "info.perms": true, "info.saltperms": true
  },
  default: true,
  description: "Show information about commands/a command/a category of commands.",
  example: "{p}help\n{p}help 8ball\n{p}help Fun\n{p}help All",
  category: "Utility",
  args: {"command or category": true, "page (Default: 1)": true},
  aliases: {
    ainfo: {
      description: "Alias to info, replaces all mentions with user tags/names. Made for compatibility with Android.",
      android: true
    },
    roles: {
      description: "Alias to info roles. View all or a member's roles.",
      action: "roles",
      perms: "info.roles",
      args: { "member or page": true, "page (if member is specified)": true },
      example: `
{p}roles
{p}roles 2
{p}roles Guy#0000 3`,
      default: true
    },
    channels: {
      description: "Alias to info channels. View all channels or a category's inner channels.",
      action: "channels",
      perms: "info.channels",
      args: { "category or page": true, "page (if category is specified)": true },
      example: `
{p}channels
{p}channels 2
{p}channels Cool Stuff 3`,
      default: true
    },
    members: {
      description: "Alias to info members. View all or a role's members.",
      action: "members",
      perms: "info.members",
      args: { "role or page": true, "page (if role is specified)": true },
      example: `
{p}members
{p}members 2
{p}members Cool People 3`,
      default: true
    },
    textchannels: {
      description: "Alias to info textchannels. View all or a category's text channels.",
      action: "textchannels",
      perms: "info.channels",
      args: { "category or page": true, "page (if category is specified)": true },
      example: `
{p}textchannels
{p}textchannels 2
{p}textchannels #general 3`,
      default: true
    },
    texts: {
      description: "Alias to info textchannels. View all or a category's text channels.",
      action: "texts",
      perms: "info.channels",
      args: { "category or page": true, "page (if category is specified)": true },
      example: `
{p}texts
{p}texts 2
{p}texts #general 3`,
      default: true
    },
    voices: {
      description: "Alias to info voices. View all or a category's voice channels.",
      action: "voices",
      perms: "info.channels",
      args: { "category or page": true, "page (if category is specified)": true },
      example: `
{p}voices
{p}voices 2
{p}voices Cool Place 3`,
      default: true
    },
    voicechannels: {
      description: "Alias to info voicechannels. View all or a category's voice channels.",
      action: "voicechannels",
      perms: "info.channels",
      args: { "category or page": true, "page (if category is specified)": true },
      example: `
{p}voicechannels
{p}voicechannels 2
{p}voicechannels Cool Place 3`,
      default: true
    },
    categories: {
      description: "Alias to info categories. View all or a category's categories (if that ever becomes possible one day).",
      action: "categories",
      perms: "info.channels",
      args: { "category or page": true, "page (if category is specified)": true },
      example: `
{p}categories
{p}categories 2
{p}categories Cool Channels 3`,
      default: true
    },
    ctgs: {
      description: "Alias to info ctgs. View all or a category's categories (if that ever becomes possible one day).",
      action: "ctgs",
      perms: "info.channels",
      args: { "category or page": true, "page (if category is specified)": true },
      example: `
{p}ctgs
{p}ctgs 2
{p}ctgs Cool Channels 3`,
      default: true
    },
    perms: {
      description: "Alias to info perms. View an user's, a role's or a number's perms.",
      action: "perms",
      perms: "info.perms",
      args: {
        "a number (to check a number) or an action (user/role/number)": true,
        "user or role to check (if using action)": true
      },
      example: `
{p}perms
{p}perms user Guy#0000
{p}perms role Cool Role
{p}perms number 8`,
      default: true
    }
  },
  guildOnly: false
});