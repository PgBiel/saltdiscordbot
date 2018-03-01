const bot = require("../util/bot");

class CrossItems {
  /**
   * Build a CrossItem
   * @param {string} name Name of the store
   * @param {string} cleaner Cleaner func name
   * @param {string} uncleaner Uncleaner func name
   */
  constructor(name, cleaner, uncleaner) {
    this.name = name;
    this.cleaner = cleaner;
    this.uncleaner = uncleaner;
  }

  async has(id) {
    const results = await (bot.shard.broadcastEval(`this[\`${this.name}\`].has(\`${id || 1}\`)`));
    for (const res of results) {
      if (res) return true;
    }
    return false;
  }

  async get(id) {
    const results = await (bot.shard.broadcastEval(
      `this.funcs[\`${this.cleaner}\`](this[\`${this.name}\`].get(\`${id || 1}\`))`
    ));
    for (const res of results) {
      if (res) {
        let guild;
        if (res.guildId) guild = await crosses.guilds.get(res.guildId);
        return bot.funcs[this.uncleaner](res, guild);
      }
    }
    return null;
  }
}

const crosses = module.exports = {
  guilds: new CrossItems("guilds", "cleanGuild", "uncleanGuild"),
  channels: new CrossItems("channels", "cleanChannel", "uncleanChannel"),
  emojis: new CrossItems("emojis", "cleanEmoji", "uncleanEmoji")
};