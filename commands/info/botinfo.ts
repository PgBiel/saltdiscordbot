import { cmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "./info";
import { bot, cross, Embed, ago, momentUTC, Constants, Command, rejct, Guild, User, Interval } from "../../misc/d";
import { NonFunctionProps } from "../../classes/database";
import { CrossItem } from "../../classes/cross";
import { GuildEmoji } from "discord.js";
import { AnyChannel } from "../../funcs/clean/uncleanChannel";

export type CrossIContents<T, R = any> = T extends CrossItem<infer O> ? O : R;

const func: cmdFunc<AInfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member, sendIt
}) {
  if (!perms["info.bot"]) return reply("Missing permission `info role`! :frowning:");
  const { action, android } = dummy || {} as never;
  if (["botid", "statsid"].includes(action)) return reply(`My ID is ${bot.user.id}.`);
  channel.startTyping();
  const av = bot.user.displayAvatarURL();
  const created = bot.user.createdAt;
  /**
   * If Pg is in this guild
   */
  const pgHere = !android && guild && guild.members.has(Constants.identifiers.OWNER);
  /**
   * If aplet is in this guild
   */
  const apletHere = !android && guild && guild.members.has(Constants.identifiers.APLET);

  async function checkTotal(name: NonFunctionProps<typeof cross>): Promise<number>;
  async function checkTotal<
    N extends NonFunctionProps<typeof cross>, // name of a cross item
    P extends keyof CrossIContents<typeof cross[N]>, // property of the class of the chosen cross item
    Ps extends (CrossIContents<typeof cross[N]>)[P] // type of that property
  >(
    name: N, prop: P, possible: Ps[], not?: boolean
  ): Promise<number>;
  async function checkTotal<N extends NonFunctionProps<typeof cross>>(
    name: N,
    prop?: keyof CrossIContents<typeof cross[N]>,
    possible?: Array<(CrossIContents<typeof cross[N]>)[keyof CrossIContents<typeof cross[N]>]>,
    not = false
  ): Promise<number> {
    try {
      if (prop) {
        const crosser: CrossItem<Guild | User | GuildEmoji | AnyChannel> = cross[name];
        return await (
          crosser.filter(
            s => {
              const incl = possible.includes(s[prop as string]);
              return not ? !incl : incl;
            },
            { prop, possible, not }
          ).size()
        );
      }
      return await (cross[name].size());
    } catch (err) { rejct(err, `[CHECK-TOTAL ${name}]`); }
  }
  const totalChannels = await checkTotal("channels", "type", ["text", "voice"]);
  const totalGuilds = await checkTotal("guilds");
  const totalCategories = await checkTotal("channels", "type", ["category"]);
  const totalText = await checkTotal("channels", "type", ["text"]);
  const totalVoice = await checkTotal("channels", "type", ["voice"]);
  const totalUsers = await checkTotal("users");
  const emb: Embed = new Embed()
    .setAuthor(bot.user.username, av, av)
    .setThumbnail(av)
    .setFooter(`Click the title for avatar URL | My ID: ${bot.user.id} | Happy to be alive! ^-^`)
    .setDescription(`Was created ${ago(created, Date.now(), true) || "some time"} ago (${momentUTC(created)})`)
    .addField(
      "Developers",
      `🔥PgSuper🔥#3693 ${android ? "" : `(<@${pgHere ? "!" : ""}${Constants.identifiers.OWNER}>) `} \
and Aplet123#9551${android ? "" : `(<@${apletHere ? "!" : ""}${Constants.identifiers.APLET}>)`}`, false)
    .addField("Uptime", new Interval(bot.uptime).toString(true), true)
    .addField("Programming Language", "JavaScript", true)
    .addField("Library", "discord.js", true)
    .addField("Servers", totalGuilds, true)
    .addField("Users", totalUsers, true)
    .addField("Total Channels", totalChannels, true)
    .addField("Total Categories", totalCategories, true)
    .addField("Text Channels", totalText, true)
    .addField("Voice Channels", totalVoice, true);
  return sendIt(emb);
};

export const botinfo = new Command({
  description: "View my info.",
  func,
  name: "botinfo",
  perms: "info.bot",
  args: {},
  category: "Info",
  guildOnly: true,
  example: `
{p}{name}`,
  default: true,
  aliases: {
    statsinfo: {
      // lol
    },
    stats: {

    },
    botid: {
      description: "View my id",
      action: "guildid"
    },
    statsid: {
      description: "View my id",
      action: "guildid"
    }
  }
});
