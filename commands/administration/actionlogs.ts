import Command from "../../classes/command";
import { TcmdFunc } from "../../misc/contextType";
import { TextChannel, Collection } from "discord.js";
import { db, uncompress, compress } from "../../misc/d";

const func: TcmdFunc<{}> = async function(
  msg, {
    prompt, guildId, reply, searcher, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms, seePerm,
    genPromptD, guild, promptAmbig
  },
) {
  let logs: string = await (db.table("mods").prop(guildId, "logs"));
  if (logs) logs = uncompress(String(logs));
  const logsOn: boolean = await (db.table("mods").prop(guildId, "logsOn"));
  const isOn = logsOn || logsOn == null;
  if (!args) {
    if (!logs || !guild.channels.cache.has(logs)) {
      return reply(`There is no set action logs channel at the moment! (To manage, see help command.)`);
    }
    return reply(`The current action logs channel is set to <#${logs}>, and action logs are currently \
${isOn ? "enabled" : "disabled"}! (To manage, see help command.)`);
  }
  const { channels: preChannels } = guild;
  const channels: Collection<string, TextChannel> = preChannels
    .cache.filter(c => c.type === "GUILD_TEXT") as Collection<string, TextChannel>;
  const action = arrArgs[0].toLowerCase();
  if (["set", "unset", "enable", "disable", "toggle"].includes(action)) {
    if (!seePerm("actionlogs", perms, setPerms, { srole: "admin", hperms: "MANAGE_GUILD" })) {
      return reply("Missing permission `actionlogs`! Could also use this command with the Administrator saltrole or the \
`Manage Servers` Discord permission.");
    }
    if (action === "set") { // set action log channel
      if (args.length < 2) return reply("Please specify a channel to set action logs to!");
      /**
       * Channel name to set as action logs
       */
      const name: string = arrArgs[1];
      if (!/^(?:<#\d+>|#?[\w-]+)$/i.test(name)) return reply("Please provide a valid channel name!");
      let cToUse: TextChannel;
      if (/^<#\d+>$/.test(name)) {
        const cId: string = name.match(/^<#(\d+)>$/)[1];
        if (!channels.has(cId)) return reply("Unknown channel!");
        cToUse = channels.get(cId);
      } else {
        const mName: string = name.replace(/^#/, "");
        const result = searcher.searchChannel(mName, "text");
        if (!result || result.length < 1) return reply("Unknown channel!");
        if (result.length < 2) {
          cToUse = result[0];
        } else if (result.length > 1 && result.length < 10) {
          const cResult = await promptAmbig(result, "channels", { type: "channel", channelType: "text" });  // TODO: new channel types
          if (cResult.cancelled) return;
          cToUse = cResult.subject;
        }
      }
      await (db.table("mods").assignF(
        guildId,
        { logs: () => compress(cToUse.id), logsOn: isOn => isOn == null ? true : isOn },
        true
      ));
      reply(`Successfully set the action logging channel to ${cToUse}!`);
    } else if (["enable", "disable", "unset", "toggle"].includes(action)) {
      if (!logs || !guild.channels.cache.has(logs)) return reply(`Action logs must be set to a channel first! To do so, use \
\`${p}actionlogs set #channel\`, where \`#channel\` is the channel you want to set it to.`);
      if (["enable", "disable", "unset"].includes(action)) { // note: unset === disable
        if ((action === "enable" && logsOn) || (action !== "enable" && !logsOn)) {
          return reply(`Action logs are already ${action === "enable" ? "on" : "off"}!`);
        }
        await (db.table("mods").assign(guildId, { logsOn: action === "enable" ? true : false }, true));
        reply(`Successfully ${action === "enable" ? "enabled" : "disabled"} action logs!`);
      } else if (action === "toggle") {
        await (db.table("mods").assignF(guildId, { logsOn: isOn => !isOn }, true));
        reply(`Successfully toggled action logs ${logsOn ? "off" : "on"}!`);
      }
    }
  } else {
    reply("Unknown action! See help command for help.");
  }
};

export const actionlogs = new Command({
  func,
  name: "actionlogs",
  perms: "actionlogs",
  default: false,
  description: `Manage action logs. Specify no parameters to simply view the channel at which action logs are set to.

You can specify an action after the command name (if you have the permission \`actionlog\`):
If specifying action \`set\`, specify a channel to set it as the action log channel.
If specifying \`enable\` or \`disable\`, you will enable and disable action logs, respectively.
If specifying \`unset\`, you will disable action logs (alias to \`disable\`).
If specifying \`toggle\`, you will toggle if action logs are enabled or disabled.`,
  example: `{p}actionlogs
{p}actionlogs set #channel
{p}actionlogs enable
{p}actionlogs toggle`,
  category: "Administration",
  args: { action: true, "channel (if setting action logs channel)": true },
  guildOnly: true
});
