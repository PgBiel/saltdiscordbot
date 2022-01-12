import { bot, Guild } from "../../util/deps";
import temp from "../../util/temp";
import rejct from "../util/rejct";
import { ICleanGuild } from "./cleanGuild";

export default function uncleanGuild(guild: ICleanGuild) {
  if (guild == null || typeof guild !== "object") return guild as never;
  return bot.guilds.resolve(guild.id);
  // const { roles, emojis, channels, members } = guild;
  // const gg: Guild = new Guild(bot, Object.assign({}, guild, { channels: [] })); // add channels ourselves
  // if (gg.channels.size < 1) for (const chnl of channels) gg.channels.add(chnl); // add channels
  // return gg;
}
