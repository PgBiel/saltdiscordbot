const bot = require("../../util/bot");

module.exports = function bcEval() {
  return bot.shard.broadcastEval.apply(bot.shard, Array.from(arguments));
};
