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
  constructor(name, cleaner, uncleaner, partial) {
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
    const results = await (bot.shard.broadcastEval(this._build("has", { args: [id] })));
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
    const results = await (bot.shard.broadcastEval(this._build("get", { args: [id] })));
    return this._unravel(results);
  }

  /**
   * See if an item exists by finding
   * @param {string|Function} propOrFunc Property to check or function
   * @param {*} data Data
   * @returns {boolean} If item was found
   */
  async exists(propOrFunc, data) {
    const results = await (bot.shard.broadcastEval(this._build("exists", { args: [propOrFunc, data] })));
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
    const results = await (bot.shard.broadcastEval(this._build("find", { args: [propOrFunc, data] })));
    return this._unravel(results);
  }

  async filter(func, vars = {}) {
    const funcStr = String(func);
    let regexStr = "([^\\w])(";
    for (const varKey of Object.keys(vars)) {
      const varr = _.escapeRegExp(varKey);
      regexStr += regexStr === "([^\\w])(" ? varr : " | " + varr;
    }
    const regex = new RegExp(regexStr += ")(?=[^\\w])", "g");
    return newItem(
      this.name, this.cleaner, this.uncleaner,
      {
        name: "filter",
        func: bot.funcs.endChar(funcStr, " ").replace(regex, (_m, s, v) => s + this._insp(vars[v], true))
      }
    );
  }

  /**
   * Build a string from data
   * @param {object} data Data
   * @param {string} funcUsed Function to use
   * @param {object} [opts] Options
   * @param {string} [opts.varName=this] Var name
   * @param {string[]} [opts.args] Args to that function
   * @returns {string} Generated eval string
   * @private
   */
  _build(funcUsed, { varName = "this", args = [] } = {}) {
    args = _.castArray(args).map(el => this._insp(el));
    varName = String(varName);
    funcUsed = String(funcUsed);
    return `${varName}.funcs`
      + `[${this._insp(this.cleaner)}]`
      + `(${varName}[${this._insp(this.name)}]` // open parenthesis
      + `.${funcUsed}(${args})`
      + (this.partial ? `.${(this.partial.name)}(${this._insp(this.partial.func)})` : "")
      + `)`; // close parenthesis
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
  users: new CrossItems("user", "cleanUser", "uncleanUser"),
  channels: new CrossItems("channels", "cleanChannel", "uncleanChannel"),
  emojis: new CrossItems("emojis", "cleanEmoji", "uncleanEmoji")
};