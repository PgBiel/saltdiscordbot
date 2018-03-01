const _ = require("lodash");
const bot = require("../util/bot");
const { inspect } = require("util");

class CrossItems {
  /**
   * Build a CrossItem
   * @param {string} name Name of the store
   * @param {string} cleaner Cleaner func name
   * @param {string} uncleaner Uncleaner func name
   */
  constructor(name, cleaner, uncleaner) {
    this.name = this._aQuot(name);
    this.cleaner = this._aQuot(cleaner);
    this.uncleaner = this._aQuot(uncleaner);
  }

  /**
   * See if this cross item contains an item with an ID
   * @param {string} id The ID
   * @returns {boolean} If it exists
   */
  async has(id) {
    const results = await (bot.shard.broadcastEval(`this[${this._insp(this.name)}].has(\`${this._aQuot(id || 1)}\`)`));
    for (const res of results) {
      if (res) return true;
    }
    return false;
  }

  /**
   * Get a cross item with an ID
   * @param {string} id The ID
   * @returns {*} Item if it exists
   */
  async get(id) {
    const results = await (bot.shard.broadcastEval(
      `this.funcs[${this._insp(this.cleaner)}](this[${this._insp(this.name)}].get(\`${this._aQuot(id || 1)}\`))`
    ));
    return this._unravel(results);
  }

  /**
   * See if an item exists by finding
   * @param {string|Function} propOrFunc Property to check or function
   * @param {*} data Data
   * @returns {boolean} If item was found
   */
  async exists(propOrFunc, data) {
    const results = await (bot.shard.broadcastEval(
      `this.funcs[${this._insp(this.cleaner)}](this[${this._insp(this.name)}].exists(\
${this._insp(propOrFunc)}, ${this._insp(data)}))`
    ));
    for (const res of results) {
      if (res) return true;
    }
    return false;
  }

  /**
   * Find an item
   * @param {string|Function} propOrFunc Property to check or function
   * @param {*} data Data
   * @returns {*} Item if found
   */
  async find(propOrFunc, data) {
    const results = await (bot.shard.broadcastEval(
      `this.funcs[${this._insp(this.cleaner)}](this[${this._insp(this.name)}].find(\
${this._insp(propOrFunc)}, ${this._insp(data)}))`
    ));
    return this._unravel(results);
  }

  /**
   * Inspect data
   * @param {*} data Data
   * @returns {string} Inspected
   * @private
   */
  _insp(data) {
    return typeof data === "function" ? String(data) : inspect(data);
  }

  /**
   * Escape `
   * @param {string} str string
   * @returns {string}
   * @private
   */
  _aQuot(str) {
    return String(str).replace(/`/g, "");
  }

  /**
   * Find the object in the array
   * @param {*} obj Object 
   * @returns {*}
   * @private
   */
  async _unravel(obj) {
    for (const res of _.castArray(obj)) {
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