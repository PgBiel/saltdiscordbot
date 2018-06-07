import temp from "../../util/temp";
import fetchCached from "../handler/fetchCachedGuilds";
import rejct from "../util/rejct";
import rejctF from "../util/rejctF";
import handler = require("../../cmdhandler/commandHandler");
import { Message } from "discord.js";

/**
 * function to be executed when a message is detected
 * @param msg MEssage to process
 */
export default async function botMessage(msg: Message) {
  if (msg && msg.guild && !fetchCached(msg.guild.id)) {
    try {
      await msg.guild.members.fetch();
      temp.set("cacheGuilds", (temp.get("cacheGuilds") || []).concat([msg.guild.id]));
    } catch (err) {
      rejct(err, "[BOTMESSAGE-FETCH GUILD CACHE]");
    }
  }
  const { default: required }: typeof handler = require("../../cmdhandler/commandHandler");
  const thingy = required(msg);
  if (thingy.catch) thingy.catch(rejctF("[BOTMESSAGE-RUN-COMMAND-HANDLER]"));
}
