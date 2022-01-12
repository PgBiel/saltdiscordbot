import { Client } from "discord.js";
import bot from "../../util/bot";

/**
 * Broadcast eval to shards. (Probably better to just "bot.shard.broadcastEval")
 * @param func The function to execute
 */
export default function bcEval(func: (client: Client) => any) {
  return bot.shard.broadcastEval(func);
}
