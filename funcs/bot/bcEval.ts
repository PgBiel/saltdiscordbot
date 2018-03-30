import bot from "../../util/bot";

/**
 * Broadcast eval to shards
 * @param script The script to execute
 */
export default function bcEval(script: string) {
  return bot.shard.broadcastEval(script);
}
