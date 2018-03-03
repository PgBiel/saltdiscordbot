const _ = require("lodash");
const bot = require("../util/bot");
const { inspect } = require("util");

let CrossItems = {};

const newItem = (...args) => new CrossItems(...args);

class CrossItem {
  /**
   * Build a CrossItem
   * @param {string} name Name of the store
   * @param {string} cleaner Cleaner func name
   * @param {string} uncleaner Uncleaner func name
   * @param {*} [partial] If this is a sequence of a filter
   */
  constructor(name, cleaner, uncleaner, partial = null) {
    this.name = this._aQuot(name);
    this.cleaner = this._aQuot(cleaner);
    this.uncleaner = this._aQuot(uncleaner);
    this.partial = partial;
  }

  /**
   * See if this cross item contains an item with an ID
   * @param {string} id The ID
   * @returns {boolean} If it exists
   */
  async has(id) {
    const results = await (this._send("has", { args: [id] }));
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
    const results = await (this._send("get", { args: [id] }));
    return this._unravel(results);
  }

  /**
   * See if an item exists by finding
   * @param {string|Function} propOrFunc Property to check or function
   * @param {*} dataOrVars Data (or variables if using function)
   * @returns {boolean} If item was found
   */
  async exists(propOrFunc, dataOrVars) {
    return this.find(propOrFunc, dataOrVars);
  }

  /**
   * Find an item
   * @param {string|Function} propOrFunc Property to check or function
   * @param {*} dataOrVars Data (or variables if using function)
   * @returns {*} Item if found
   */
  async find(propOrFunc, dataOrVars, isExists = false) {
    const isVars = typeof propOrFunc === "function" ? true : false;
    const results = await (
      this._send(
        isExists ? "exists" : "find",
        isVars ? { vars: dataOrVars, args: [propOrFunc] } : { args: [propOrFunc, dataOrVars]})
    );
    if (isExists) {
      for (const res of results) if (res) return true;
      return false;
    }
    return this._unravel(results);
  }

  async filter(func, vars = {}) {
    const funcStr = String(func);
    return newItem(
      this.name, this.cleaner, this.uncleaner,
      {
        name: "filter",
        func: funcStr,
        vars
      }
    );
  }

  async size() {
    const results = await (this._send("size", { isFunc: false }));
    if (!Array.isArray(results)) return null;
    return results.reduce((prev, curr) => prev + curr, 0);
  }

  /**
   * Build a string from data
   * @param {object} data Data
   * @param {string} funcUsed Function to use
   * @param {object} [opts] Options
   * @param {boolean} [isFunc=true] If FuncUsed should be called
   * @param {string[]} [opts.args] Args to that function
   * @returns {string} Generated eval string
   * @private
   */
  async _send(funcUsed, { vars: initVars = {}, isFunc = true, args = [] } = {}) {
    const vars = Object.assign({}, (this.partial || { vars: {} }).vars, initVars);
    args = _.castArray(args).map(el => this._insp(el));
    return ((await bot.funcs.masterMsg(
      { // data to send
        name: this.name, func: String(funcUsed), isFunc, vars,
        filter: this.partial ? this.partial.func : null, cleaner: this.cleaner,
        args
      },
      { type: "coll", awaitType: "resColl", receiveMultiple: true }
    )) || []).map(el => el.data);
  }

  /**
   * Inspect data
   * @param {*} data Data
   * @param {boolean} [replaceUseless=false] If replace useless
   * @returns {string} Inspected
   * @private
   */
  _insp(data, replaceUseless = false) {
    const inspected = typeof data === "function" ? String(data) : inspect(data);
    if (!replaceUseless) return inspected;
    return inspected.replace(/\[[\w\s]+\]/g, "{}").replace(/\w+ (\{[\s\S]*\})/g, "$1");
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

CrossItems = CrossItem;

const crosses = module.exports = {
  CrossItem,
  guilds: new CrossItems("guilds", "cleanGuild", "uncleanGuild"),
  users: new CrossItems("users", "cleanUser", "uncleanUser"),
  channels: new CrossItems("channels", "cleanChannel", "uncleanChannel"),
  emojis: new CrossItems("emojis", "cleanEmoji", "uncleanEmoji")
};