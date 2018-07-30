import { TcmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "./info";
import {
  search, Embed, ago, momentUTC, Constants, Command, GuildChannel, TextChannel, no2Tick, globalPositions, escMarkdown
} from "../../misc/d";
import { AnyChannel } from "../../funcs/clean/uncleanChannel";
import { DMChannel, Guild, VoiceChannel, Invite, Collection, CategoryChannel } from "discord.js";

const func: TcmdFunc<AInfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member, sendIt
}) {
  if (!perms["info.channel"]) return reply("Missing permission `info channel`! :frowning:");
  const { android, action, arg: _arg, trArg } = dummy || {} as never;
  const arg: string = trArg || _arg || args || "";

  if (
    guild &&
    (
      ["category", "categoryid"].includes(action) && guild.channels.filter(c => c.type === "category").size < 1 ||
        ["voice", "voicechannel", "voiceid", "voicechannelid"].includes(action) &&
        guild.channels.filter(c => c.type === "voice").size < 1
    )
  ) {
    if (["category", "ctg", "ctgid", "categoryid"].includes(action)) return reply(
      "There are no categories in this server!"
    );
    return reply("There are no voice channels in this server!");
  }
  /**
   * If the user is asking for an id instead of channel info
   */
  const isID: boolean = action.endsWith("id");
  /**
   * Type chosen by user
   */
  let type: "dm" | "group" | "text" | "voice" | "category" | "unknown";
  /**
   * Type that the result channel has (can change depending if the user used IDs or not)
   */
  let typeUsed: typeof type;
  /**
   * Channel matched
   */
  let chnl: AnyChannel;
  if (action.startsWith("text") || (action.startsWith("channel") && !arg.startsWith("&"))) {
    type = "text";
  } else if (action.startsWith("voice") || (action.startsWith("channel") && arg.startsWith("&"))) {
    type = "voice";
  } else {
    type = "category";
  }
  /**
   * Search term for channel
   */
  const lArg = (arg || "").replace(/^[#&]/, "");
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
  const cIsG = (chan): chan is GuildChannel => chan instanceof GuildChannel;
  const cName = chnl instanceof DMChannel ? "lol dm channels have no name" : (chnl as GuildChannel).name;
  typeUsed = chnl.type;

  if (isID) { // if we're requesting ID, then just give it
    return reply(`The ID of the ${typeUsed === "category" ? "category" : `${typeUsed} channel`} named \
  \`${escMarkdown(cName)}\` is ${chnl.id}.`);
  }
  channel.startTyping();
  /**
   * URL of icon to use
   */
  const dir: string = Constants
    .images
    .CHANNEL_INFO[chnl instanceof TextChannel && chnl.nsfw ? "TEXT_NSFW" : typeUsed.toUpperCase()]
    || Constants.images.SERVER_INFO.NO_ICON;

  const embed = new Embed() // general embed
    .setAuthor(
      `Info for ${typeUsed === "category" ? "category" : typeUsed + " channel"} "${cName}"`,
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
      `${cIsG(chnl) && chnl.parent ? "Relative " : ""}${chnl.type === "voice" ? "Voice " : ""}Position`,
      cIsG(chnl) ? chnl.position : "none",
      true
    )
    .addField(`Permission Overwrites`, cIsG(chnl) ? chnl.permissionOverwrites.size : "none", true);
  if (cIsG(chnl) && chnl.parent) embed.addField(`Category`, chnl.parent.name, true);
  if (chnl instanceof TextChannel || chnl instanceof VoiceChannel) { // there's some stuff common to txt & voice channels
    let invs: Collection<string, Invite>;
    try {
      invs = await chnl.fetchInvites();
    } catch (err) { /* shrug */ }
    const membersArr = chnl.members
      .array()
      .sort((a, b) => Number(a.displayName > b.displayName));
    const membersJoined = membersArr.length === guild.members.size ?
      "All members" :
      membersArr.map(m => android ? ((m || {} as never).user || {} as never).tag : String(m)).join(", ");
    if (chnl instanceof TextChannel) { // add txt channel data
      let whs;
      try {
        whs = await chnl.fetchWebhooks();
      } catch (err) { /* shrug */ }
      embed
        .addField("Is NSFW", Constants.maps.YESNO[String(Boolean(chnl.nsfw))], true)
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
    } else if (chnl instanceof VoiceChannel) { // add VC data
      embed
        .addField("Bitrate", `${chnl.bitrate / 1000} kbps`, true)
        .addField("User Limit", chnl.userLimit || "Unlimited", true)
        .addField("Is full", Constants.maps.YESNO[String(Boolean(chnl.full))], true)
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
  } else if (chnl instanceof CategoryChannel) { // add category info
    const globalPos = globalPositions(chnl.guild);
    const chArr: GuildChannel[] = chnl.children
      .array()
      .sort((a, b) => globalPos.get(b.id).position - globalPos.get(a.id).position);
    const chJoined: string = chArr.length === globalPos.size ? "All channels" : chArr.join(", ");

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
};

export const channelinfo = new Command({
  description: "Specify a channel to view its info (See `channel` for managing channels).",
  func,
  name: "channelinfo",
  perms: "info.channel",
  args: { channel: true },
  category: "Information",
  guildOnly: true,
  example: `
{p}{name}
{p}{name} #text-channel
{p}{name} &Voice Channel
{p}{name} 123456789`,
  default: true,
  aliases: {
    textchannelinfo: {
      action: "text",
      example: `
{p}{name}
{p}{name} #text-channel
{p}{name} 123456789`
    },
    channelid: {
      description: "Specify a channel to view its ID",
      action: "channelid"
    },
    voiceinfo: {
      description: "Specify a voicechannel to view its info (See `voicechannel` for managing voicechannels).",
      action: "voice",
      args: { voicechannel: true },
      example: `
{p}voiceinfo
{p}voiceinfo Music
{p}voiceinfo 123456789`,
      show: true,
      aliases: {
        voiceid: {
          description: "Specify a voice channel to view its ID",
          action: "voiceid",
          args: { voicechannel: true },
          example: `
{p}voiceid
{p}voiceid Music
{p}voiceid 123456789`
        },
      }
    },
    categoryinfo: {
      description: "(See `category` for managing categories). Specify a category to view its \
info",
      action: "category",
      args: { category: true },
      aliasShow: false,
      example: `
{p}categoryinfo
{p}categoryinfo Cool Channels
{p}categoryinfo 123456789`,
      default: true,
      show: true,
      aliases: {
        ctginfo: {
          description: "(See `category` for managing categories). Specify a category to view its \
    info",
          action: "category",
          args: { category: true },
          example: `
{p}ctginfo
{p}ctginfo Cool Channels
{p}ctginfo 123456789`,
        },
        categoryid: {
          description: "Specify a category channel to view its ID",
          action: "categoryid",
          args: { category: true },
          example: `
{p}categoryid
{p}categoryid Cool Channels
{p}categoryid 123456789`
        },
        ctgid: {
          description: "Specify a category channel to view its ID",
          action: "categoryid",
          args: { category: true },
          example: `
{p}ctgid
{p}ctgid Cool Channels
{p}ctgid 123456789`
        }
      }
    }
  }
});
