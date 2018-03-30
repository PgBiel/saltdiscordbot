import * as _ from "lodash";
import { bot } from "../util/bot";
import { inspect } from "util";
import { Guild, User } from "../util/deps";
import { Channel, Emoji, GuildEmoji, Collection } from "discord.js";
import { AnyChannel } from "../funcs/clean/uncleanChannel";
import { AnyEmoji } from "../funcs/clean/uncleanEmoji";

interface IPartial {
  name: "filter";
  func: string | Function;
  vars: object;
}

interface ISendOptions {
  vars?: object;
  isFunc?: boolean;
  args?: any[];
}

export function inspector(data: any, replaceUseless: boolean = false): string {
  const inspected = typeof data === "function" ? String(data) : inspect(data);
  if (!replaceUseless) return inspected;
  return inspected.replace(/\[[\w\s]+\]/g, "{}").replace(/\w+ (\{[\s\S]*\})/g, "$1");
}

class CrossItem<R> {

  private name: string;
  private cleaner: string;
  private uncleaner: string;
  private partial?: IPartial;
  /**
   * Build a CrossItem
   * @param {string} name Name of the store
   * @param {string} cleaner Cleaner func name
   * @param {string} uncleaner Uncleaner func name
   * @param {*} [partial] If this is a sequence of a filter
   */
  constructor(
    name: string, cleaner: string, uncleaner: string, partial: IPartial = null
  ) {
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
  public async has(id: string): Promise<boolean> {
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
  public async get(id: string): Promise<R> {
    const results = await (this._send("get", { args: [id] }));
    return this._unravel(results);
  }

  /**
   * See if an item exists by finding
   * @param {string|Function} propOrFunc Property to check or function
   * @param {*} dataOrVars Data (or variables if using function)
   * @returns {boolean} If item was found
   */
  public async exists(propOrFunc: string | Function, dataOrVars?: any): Promise<boolean> {
    const isVars = typeof propOrFunc === "function" ? true : false;
    const results = await (
      this._send(
        "exists",
        isVars ? { vars: dataOrVars, args: [propOrFunc] } : { args: [propOrFunc, dataOrVars] }
      )
    );
    for (const res of results) if (res) return true;
    return false;
  }

  /**
   * Find an item
   * @param {string|Function} propOrFunc Property to check or function
   * @param {*} dataOrVars Data (or variables if using function)
   * @returns {*} Item if found
   */
  public async find(propOrFunc: keyof R, dataOrVars?: any): Promise<R>;
  public async find(
    propOrFunc: (val: R, key: string, coll: Collection<string, R>) => boolean
  ): Promise<R>;
  public async find(
    propOrFunc: keyof R | ((val: R, key: string, coll: Collection<string, R>) => boolean),
    dataOrVars?: any
  ): Promise<R> {
    const isVars = typeof propOrFunc === "function" ? true : false;
    const results = await (
      this._send(
        "find",
        isVars ? { vars: dataOrVars, args: [propOrFunc] } : { args: [propOrFunc, dataOrVars] }
      )
    );
    return this._unravel(results);
  }

  /**
   * Filter the collection
   * @param {Function} func Function to filter
   * @param {object} [vars={}] Variables to use in function
   */
  public filter(
    func: (val: R, key: string, coll: Collection<string, R>) => boolean,
    vars: { [variable: string]: any } = {}
  ): CrossItem<R> {
    const funcStr = String(func);
    return new CrossItem<R>(
      this.name, this.cleaner, this.uncleaner,
      {
        name: "filter",
        func: funcStr,
        vars
      }
    );
  }

  /**
   * Gets the size of this store.
   * @returns {Promise<number>}
   */
  public async size(): Promise<number> {
    const results = await (this._send("size", { isFunc: false }));
    if (!Array.isArray(results)) return null;
    return results.reduce((prev, curr) => prev + curr, 0);
  }

  /**
   * Fetch data
   * @param {string} funcUsed Function to use
   * @param {object} [opts] Options
   * @param {boolean} [isFunc=true] If FuncUsed should be called
   * @param {string[]} [opts.args] Args to that function
   * @returns {*[]} data
   * @private
   */
  private async _send(funcUsed: string, { vars: initVars = {}, isFunc = true, args = [] }: ISendOptions = {}): Promise<any[]> {
    const vars = Object.assign({}, (this.partial || { vars: {} }).vars, initVars);
    args = _.castArray(args).map(el => inspector(el));
    const res = await bot.funcs.masterMsg(
      { // data to send
        name: this.name, func: String(funcUsed), isFunc, vars,
        filter: this.partial ? this.partial.func : null, cleaner: this.cleaner,
        args
      },
      { type: "coll", awaitType: "resColl", receiveMultiple: true }
    );
    return (res || []).map(el => el.data);
  }

  /**
   * Escape `
   * @param {string} str string
   * @returns {string}
   * @private
   */
  private _aQuot(str: string): string {
    return String(str).replace(/`/g, "");
  }

  /**
   * Find the object in the array
   * @param {*} obj Object
   * @returns {*}
   * @private
   */
  private async _unravel(obj: any): Promise<R> {
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

export { CrossItem };

export const guilds = new CrossItem<Guild>("guilds", "cleanGuild", "uncleanGuild");
export const users = new CrossItem<User>("users", "cleanUser", "uncleanUser");
export const channels = new CrossItem<AnyChannel>("channels", "cleanChannel", "uncleanChannel");
export const emojis = new CrossItem<GuildEmoji>("emojis", "cleanEmoji", "uncleanEmoji");

export const crosses = {
  CrossItem,
  guilds,
  users,
  channels,
  emojis
};
export default crosses;
