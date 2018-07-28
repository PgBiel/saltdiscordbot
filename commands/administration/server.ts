import { TcmdFunc } from "../../misc/contextType";
import { serverinfo } from "../information/serverinfo";
import {
  Embed, capitalize, adaptSnake, search, Time, no2Tick, noEscape, Constants, Interval,
  parseTimeStr,
  Command
} from "../../misc/d";
import { DiscordAPIError, VoiceRegion } from "discord.js";

type ServerAction = "name"   | "icon" | "region" | "splash" | "newcome" | "dnotif" |
"veriflevel" | "explifilter" |
"afkchannel" | "afktimeout";

const func: TcmdFunc<{}> = async function(
  msg, { author, prefix: p, channel, args, arrArgs, self, perms, seePerm, send, reply, setPerms, guild, prompt }
) {
  const hasInfoServer = perms["info.server"];
  if (!args) {
    if (!hasInfoServer) return reply("View the help command to see how to use this command to edit the server! \
(Note: Server info could not be shown due to missing permission `info server`.)");
    const cont = "Here's the info for the current server (view the help command to use this command to edit!):";
    return serverinfo.exec(msg, Object.assign({ dummy: { content: cont } }, self));
  }
  const hasPerms: { [K in ServerAction]: boolean } = {
    name: await seePerm("server.name", perms, setPerms, { hperms: "MANAGE_GUILD" }),
    icon: await seePerm("server.icon", perms, setPerms, { hperms: "MANAGE_GUILD" }),
    region: await seePerm("server.region", perms, setPerms, { hperms: "MANAGE_GUILD" }),
    splash: await seePerm("server.splash", perms, setPerms, { hperms: "MANAGE_GUILD" }),
    newcome: await seePerm("server.newcome", perms, setPerms, { hperms: "MANAGE_GUILD" }),
    dnotif: await seePerm("server.dnotif", perms, setPerms, { hperms: "MANAGE_GUILD" }),

    veriflevel: await seePerm("server.veriflevel", perms, setPerms, { hperms: "MANAGE_GUILD" }),
    explifilter: await seePerm("server.explifilter", perms, setPerms, { hperms: "MANAGE_GUILD" }),

    afkchannel: await seePerm("server.afkchannel", perms, setPerms, { hperms: "MANAGE_GUILD" }),
    afktimeout: await seePerm("server.afktimeout", perms, setPerms, { hperms: "MANAGE_GUILD" })
  };

  const [_action, ...restArr] = arrArgs;
  const action: ServerAction = _action.toLowerCase() as ServerAction;
  const rest: string = restArr.join(" ");
  const actionArr: ServerAction[] = [
    "name", "icon", "region", "splash", "newcome", "dnotif",  "veriflevel", "explifilter", "afkchannel", "afktimeout"
  ];
  if (!actionArr.includes(action)) {
    return reply("Invalid action! Action must be one of `name`, `icon`, `region`, `splash`, `newcome`, `dnotif`, `veriflevel`, \
`explicitfilter`, `afkchannel` and `afktimeout`. For details, see the help command.");
  }
  if (rest || (["icon", "splash"].includes(action) ? msg.attachments.size > 0 : false)) {
    if (!hasPerms[action]) {
      return reply(`Missing permission \`${action}\`, required to use this action! (Note that it's also usable with the Discord \
permission \`Manage Server\`.)`);
    } else if (!guild.me.hasPermission("MANAGE_GUILD")) {
      return send("I do not have the permission `Manage Server`, required to edit the server! :frowning:");
    }
  } else if (!hasInfoServer) {
    return reply(`View the help command for details of that action! (Note: You were not shown info due to not having the \
permission \`info server\`.)`);
  }

  const reason: string = `["+server ${action}" command executed by ${author.tag}]`;
  const friendlyError = (err: any) => {
    if (err instanceof DiscordAPIError) {
      const embed = new Embed();
      embed
        .setTitle("Discord Error!")
        .setDescription(err.message)
        .setFooter(`Error code: ${err.code}`);
      return embed;
    } else {
      return null;
    }
  };
  channel.startTyping();
  if (action === "name") {
    if (rest) {
      if (rest.length < 2 || rest.length > 100) return reply("The new server name must have between 2 and 100 characters!");
      if (rest === guild.name) return reply("That already is the server's name! :smiley:");
      try {
        await guild.setName(rest, reason);
        return reply("Successfully set the server's name to ``" + noEscape(no2Tick(rest)) + "``!", { deletable: true });
      } catch (err) {
        const embed = friendlyError(err);
        return reply("Failed to change the server name! :frowning: (Try again?)", { embed, deletable: true });
      }
    } else {
      return reply(
        "The server's name is currently ``" + noEscape(no2Tick(guild.name)) + "``! (Specify one to change.)",
        { deletable: true }
      );
    }
  } else if (action === "icon" || action === "splash") {
    if (action === "splash" && !guild.features.includes("INVITE_SPLASH")) return send("This server does not have the Invite \
Splash feature (which requires partnership with Discord or being verified)!");
    if (rest && /^(none|delete|remove)$/i.test(rest)) {
      if (!guild.icon) return reply(`This server has no ${action} to be removed! :p`);
      const { res: result } = await prompt({
        question: `Are you sure you want to remove the server ${action}? \
This will expire in 15 seconds. Type __y__es or __n__o.`,
        invalidMsg: "__Y__es or __n__o?",
        filter: msg2 => {
          return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
        },
        timeout: Time.seconds(15)
      });
      if (!result) {
        return;
      }
      if (/^[nc]/i.test(result)) {
        send("Command cancelled.");
        return;
      }
      try {
        if (action === "icon") {
          await guild.setIcon(null, reason);
        } else {
          await guild.setSplash(null, reason);
        }
        return reply(`Successfully removed the server ${action}!`);
      } catch (err) {
        const embed = friendlyError(err);
        return reply(
          `Failed to remove the server ${action}! :frowning: (Try again?)`, { embed, deletable: Boolean(embed) }
        );
      }
    } else if (msg.attachments.size < 1) {
      return reply("Please attach the desired image to your message.");
    } else if (msg.attachments.size > 0) {
      const img = msg.attachments.first();
      if (!/\.(png|jpe?g|gif|web[mp]|bmp)$/i.test(img.name)) return reply("That's not an image! :frowning:");
      if (img.width < 1) return reply("Hey, that image is way too small! :eyes:");
      try {
        if (action === "icon") {
          await guild.setIcon(img.url, reason);
        } else {
          await guild.setSplash(img.url, reason);
        }
        const embed = new Embed();
        embed
          .setTitle(`New ${capitalize(action)}`)
          .setImage(img.url);
        return reply("Successfully changed the server's " + action + "!", { embed, deletable: true });
      } catch (err) {
        const embed = friendlyError(err);
        return reply(
          "Failed to change the server's " + action + "! :frowning: (Try again? Check if the image is OK?)",
          { embed, deletable: Boolean(embed) }
        );
      }
    } else {
      const url: string = (action === "icon" ? guild.iconURL : guild.splashURL)();
      if (!url) return reply(`This server has no ${action}! (Attach an image to set.)`);
      const embed: Embed = new Embed();
      embed
        .setTitle(`Server's ${capitalize(action)}`)
        .setImage(url);
      return reply(`Here's the server's ${action}: (Attach an image to change.)`, { embed, deletable: true });
    }
  } else if (action === "region") {
    const regions = await guild.fetchVoiceRegions();
    if (rest) {
      const mapName: { [name: string]: VoiceRegion } = {};
      const mapId: { [id: string]: VoiceRegion } = {};
      regions.forEach((r, id) => { mapName[r.name.toLowerCase()] = r; mapId[id] = r; });

      let regToUse: VoiceRegion;
      const argumented = rest.toLowerCase();
      if (argumented in mapName) {
        regToUse = mapName[argumented];
      } else if (argumented in mapId) {
        regToUse = mapId[argumented];
      } else if (argumented.replace(/\s+|_/g, "-") in mapId) {
        regToUse = mapId[argumented.replace(/\s+|_/g, "-")];
      } else {
        return reply(
          "Unknown voice region! Options: " + regions.map(r => r.name + (r.vip ? " (VIP)" : "")).join(", ") + ".",
          { deletable: true }
        );
      }
      if (regToUse.vip && !guild.features.includes("VIP_REGIONS")) {
        return reply("That is a VIP Region, which this server isn't capable of using (only for partners & verified servers)!");
      }
      if (regToUse.id === guild.region) {
        return reply("That is already the server's region! (" + regToUse.name + ") :smiley:");
      }
      try {
        await guild.setRegion(regToUse.id, reason);
        return reply("Successfully changed the server region to " + regToUse.name + "!");
      } catch (err) {
        const embed = friendlyError(err);
        return reply("Failed to change region! (Try again?)", { embed, deletable: Boolean(embed) });
      }
    } else {
      return reply(
        `The server's current region is \
${(regions.find(r => r.id === guild.region) || { name: adaptSnake(guild.region)}).name}! (Specify one to change.)`,
        { deletable: true }
      );
    }
  } else if (action === "newcome") {
    const current = guild.systemChannel;
    if (rest) {
      if (/^(none|disable|remove)$/i.test(rest)) {
        if (!current) return reply("This server has no New Member Messages channel!");
        const { res: result } = await prompt({
          question: `Are you sure you want to disable New Member Messages? \
This will expire in 15 seconds. Type __y__es or __n__o.`,
          invalidMsg: "__Y__es or __n__o?",
          filter: msg2 => {
            return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
          },
          timeout: Time.seconds(15)
        });
        if (!result) {
          return;
        }
        if (/^[nc]/i.test(result)) {
          send("Command cancelled.");
          return;
        }
        try {
          await guild.setSystemChannel(null, reason);
          return reply("Successfully disabled the New Member Messages!");
        } catch (err) {
          const embed = friendlyError(err);
          return reply(
            "Failed to disable New Member Messages! :frowning: (Try again?)", { embed, deletable: Boolean(embed) }
          );
        }
      } else {
        const { subject } = await search(rest, "channel", self, { channelType: "text", allowForeign: false });
        if (!subject) return;
        if (subject.id === guild.systemChannelID) return reply("That already is the New Member Messages \
channel! (" + subject.toString() + ")", { deletable: true });
        try {
          await guild.setSystemChannel(subject, reason);
          return reply("Successfully set the New Member Messages channel to " + subject.toString() + "!", { deletable: true });
        } catch (err) {
          const embed = friendlyError(err);
          return reply(
            "Failed to set the New Member Messages channel! :frowning: (Try again?)", { embed, deletable: Boolean(embed) }
          );
        }
      }
    } else {
      if (!current) return reply("This server has no New Member Messages channel! (Specify one to set.)", { deletable: true });
      return reply(
        `The server's current New Member Messages channel is ${current}! (Specify one to change.)`, { deletable: true }
      );
    }
  } else if (action === "dnotif") {
    const current = guild.messageNotifications;
    if (rest) {
      let newMode: "ALL" | "MENTIONS";
      if (/^all(\s+messages)?$/i.test(rest)) {
        newMode = "ALL";
      } else if (/^(only\s+)?mentions?$/i.test(rest)) {
        newMode = "MENTIONS";
      } else {
        return reply("Invalid Default Notifications type! Must be either `all` or `mentions`.");
      }
      if (newMode === current) return reply(
        `That is already the current server's Defeault Notifications setting! (${Constants.maps.DEFNOTIF[newMode]})`
      );
      try {
        await (guild.setDefaultMessageNotifications as any)(newMode, reason); // reason didn't appear in typings :( glitch
        return reply(`Successfully set the Default Notifications setting to ${Constants.maps.DEFNOTIF[newMode]}!`);
      } catch (err) {
        const embed = friendlyError(err);
        return reply(
          "Failed to change the Default Notifications setting! :frowning: (Try again?)",
          { embed, deletable: Boolean(embed) }
        );
      }
    } else {
      return reply(`Currently, the default notification setting for this server is ${Constants.maps.DEFNOTIF[current]}! \
(Specify \`all\` or \`mentions\` to change.)`, { deletable: true });
    }
  } else if (action === "veriflevel" || action === "explifilter") {
    const isVer = action === "veriflevel";
    const current: number = isVer ? guild.verificationLevel : guild.explicitContentFilter;
    const map: Array<{ name: string, desc: string}> = Constants.maps.modsettings[isVer ? "VERIF" : "EXPLICIT"];

    const nameMap: { [name: string]: { num: number, desc: string }} = {};
    map.forEach((obj, i) => nameMap[obj.name.toLowerCase()] = { num: i, desc: obj.desc });

    const buildEmbed = (num: number) => {
      const { name, desc } = map[num];
      const embed = new Embed();
      embed
        .setTitle(`${isVer ? "Verification" : text} Level ${num}/${map.length - 1}`)
        .addField("Name", name)
        .addField("Description", desc);
      return embed;
    };
    const text = isVer ? "Verification Level" : "Explicit Content Filter";
    if (rest) {
      if (!(rest in map) && !(rest.toLowerCase() in nameMap)) {
        return reply(`Invalid level! Please specify a level's number (0 to ${map.length - 1}) or name \
(${map.map(o => `\`${o.name}\``).join(", ")})!`, { deletable: true });
      }
      let levelNum: number;
      if (rest in map) {
        levelNum = Number(rest);
      } else if (rest.toLowerCase() in nameMap) {
        levelNum = nameMap[rest.toLowerCase()].num;
      } else {
        return reply("Well, well... Looks like we've got a SHERLOCK HOLMES?");
      }
      if (levelNum === current) {
        return reply(`That already is the server's ${text + (isVer ? "" : " level")}! (${levelNum})`);
      }
      try {
        if (isVer) {
          await guild.setVerificationLevel(levelNum, reason);
        } else {
          await guild.setExplicitContentFilter(levelNum, reason);
        }
        return reply(
          `Successfully changed the ${text + (isVer ? "" : " level")}! New level:`,
          { embed: buildEmbed(levelNum), deletable: true }
        );
      } catch (err) {
        const embed = friendlyError(err);
        return reply(
          `Failed to change the ${text + (isVer ? "" : " level")}! (Try again?)`, { embed, deletable: Boolean(embed) }
        );
      }
    } else {
      return reply(`The server's ${text} is currently ${isVer ? "the following" : "at the following level"}: \
(Specify a level to change.)`, { embed: buildEmbed(current), deletable: true });
    }
  } else if (action === "afkchannel") {
    const current = guild.afkChannel;
    if (rest) {
      if (/^(none|disable|remove)$/i.test(rest)) {
        if (!current) return reply("This server has no AFK voice channel!");
        const { res: result } = await prompt({
          question: `Are you sure you want to disable the AFK channel? \
This will expire in 15 seconds. Type __y__es or __n__o.`,
          invalidMsg: "__Y__es or __n__o?",
          filter: msg2 => {
            return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
          },
          timeout: Time.seconds(15)
        });
        if (!result) {
          return;
        }
        if (/^[nc]/i.test(result)) {
          send("Command cancelled.");
          return;
        }
        try {
          await guild.setSystemChannel(null);
          return reply("Successfully disabled the AFK voice channel!");
        } catch (err) {
          const embed = friendlyError(err);
          return reply(
            "Failed to disable the AFK voice channel! :frowning: (Try again?)",
            { embed, deletable: Boolean(embed) }
          );
        }
      } else {
        const { subject } = await search(rest, "channel", self, { channelType: "voice", allowForeign: false });
        if (!subject) return;
        if (subject.id === guild.afkChannelID) return reply("That voice channel already is the server's AFK channel! \
(" + subject.name + ")");
        try {
          await guild.setAFKChannel(subject, reason);
          return reply("Successfully set the AFK channel to the voice channel " + subject.name + "!");
        } catch (err) {
          const embed = friendlyError(err);
          return reply("Failed to change the AFK channel! :frowning: (Try again?)", { embed, deletable: Boolean(embed) });
        }
      }
    } else {
      if (!current) return reply("This server has no AFK channel! (Specify one to set.)");
      return reply(`The server's current AFK voice channel is ${current.name}! (Specify one to change.)`, { deletable: true });
    }
  } else if (action === "afktimeout") {
    const current = guild.afkTimeout;
    if (rest) {
      const parsedObj = parseTimeStr(rest);
      if (parsedObj[parseTimeStr.invalid]) return reply("Invalid time! Please specify a valid AFK timeout.");
      const time = new Interval(Object.entries(parsedObj));
      if (!Constants.numbers.afkTimeoutVals.MILLISECONDS.includes(time.time)) {
        return reply(`Invalid AFK Timeout! It must be one of: \
${Constants.numbers.afkTimeoutVals.MILLISECONDS.map(n => new Interval(n)).join(", ")}.`);
      }
      if (time.totalSeconds === current) return reply(
        `That is already the current server's AFK Timeout! (${time})`
      );
      try {
        await guild.setAFKTimeout(time.totalSeconds, reason);
        return reply(`Successfully set the AFK Timeout setting to ${time}!`);
      } catch (err) {
        const embed = friendlyError(err);
        return reply(
          "Failed to change the AFK Timeout! :frowning: (Try again?)",
          { embed, deletable: true }
        );
      }
    } else {
      return reply(`Currently, the AFK timeout for this server is ${new Interval(current * 1000)}! \
(Specify an amount of time to change.)`, { deletable: true });
    }
  }
};

export const servercmd = new Command({
  func,
  name: "server",
  perms: {
    "info.server": true, "server.name": false,
    "server.icon": false, "server.region": false, "server.splash": false,
    "server.newcome": false, "server.dnotif": false, "server.veriflevel": false,
    "server.explifilter": false, "server.afkchannel": false, "server.afktimeout": false
  },
  default: true,
  description: `Manage the server (or view its info, if nothing is specified).

There are 10 different actions: **name**, **icon**, **region**, **splash**, **newcome**, **dnotif**, **veriflevel**,
**explifilter**, **afkchannel** and **afktimeout**.

__**• Normal settings**__

**name**: Change the server's name by specifying the new name. If nothing is specified, you are informed of the current name.

**icon**: Change the server icon by attaching an image. Specify "none"/"disable"/"remove" to remove. \
If nothing is specified, view current icon.

**region**: Change the server's region (used by voice channels) by specifying it. (To view a list of valid regions, just \
type an invalid region, or even "list".) If nothing is specified, view current region.

**splash**: Change the Invite Splash (background displayed when the invite link is followed – feature only available for \
Discord partners and Verified servers) for the server, by attaching an image. Specify "none"/"disable"/"remove" to remove. \
If nothing is specified, view current splash.

**newcome**: Change the text channel used for New Member Messages by specifying one. If nothing is specified, view current \
channel.

**dnotif**: Change the default notification settings for a member (Either All Messages or Only Mentions), by specifying it. \
If nothing specified, view it.

__**• Moderation settings**__
**veriflevel**: Change the verification level of the server by specifying it (number 0-4 or its name). If nothing specified, \
view it.

**explifilter**: Change the Explicit Content Filter level by specifying it (number 0-2 or its name). If nothing specified, \
view it.

__**• AFK Channel-related settings**__
**afkchannel**: Change the AFK Voice channel by specifying the channel. Specify "none"/"disable"/"remove" to disable. \
If nothing specified, view it.

**afktimeout**: Change the AFK Timeout (time until person is considered AFK), by specifying one of the following timestamps: \
${Constants.numbers.afkTimeoutVals.MILLISECONDS.map(n => new Interval(n)).join(", ")}.

__                                           __
**Permissions:** Use \`info server\` permission for being able to view info of specific actions; Use \`server <action>\` \
permission to be able to use such action (e.g. \`server name\` to use the name action to modify the server's name).`,
  example: `{p}{name}
{p}{name} name
{p}{name} region US East
{p}{name} veriflevel 5
{p}{name} newcome #welcome-channel
{p}{name} afktimeout 1 minute`,
  category: "Administration",
  args: { action: true, parameter: true },
  aliases: {
    guild: {},
    srv: {}
  }
});
