import * as re from "rethinkdbdash";
import { HelperVals, TableName, TableVals } from "../misc/tableValues";
import { bot } from "../util/bot";
import * as util from "util";
import * as _ from "lodash";
import * as Constants from "../constants/constants";
import logger from "./logger";
import { Storage } from "saltjs";
// import { rejct } from "../funcs/funcs";

function rejct(rejection, prefix) {
  // console.log(require("util").inspect(require("./deps")));
  logger.custom(prefix + rejection, { prefix: "[ERR/REJECT]", color: "red", type: "error" });
}

const r = re({ db: "saltbot" });

export type ArrayContents<T, R = any> = T extends Array<infer C> ? C : R; // tslint:disable-line

export type OrElse<T, E = any[], R = void> = T extends E ? T : R; // tslint:disable-line

export type FunctionAssign<T> = {
  [P in keyof T]?: (old: T[P]) => T[P];
};

export interface IEntry {
  id: string;
  data: any;
}

export type NonFunctionProps<T> = {
  [K in keyof T]: T[K] extends Function ? never : K; // tslint:disable-line
}[keyof T]; // tslint:disable-line

export interface ISetRes {
  success: boolean;
  err?: any;
}

export const tables: TableName[] = [
  "coins",
  "coinrewards",
  "customcommands",
  "invites",
  "triggers",
  "levels",
  "levelinfos",
  "mods",
  "mutes",
  "immunemutes",
  "activemutes",
  "perms",
  "prefixes",
  "punishments",
  "autoroles",
  "selfroles",
  "starboards",
  "verifications",
  "wordfilters",
  "warns",
  "warnexpires",
  "warnsteps",
  "welcomes"
];

tables.forEach(table => {
  r.tableList().contains(table)
    .do(tableExists => {
      return r.branch(
        tableExists,
        { tables_created: 0 },
        r.tableCreate(table),
      );
    })
    .run();
});

class Database {

  /**
   * Gets a Table.
   * @param {string} name The table name.
   * @returns {Table}
   */
  public table <T extends TableName>(name: T) {
    if (tables.includes(name.toLowerCase() as T)) return new Table(name.toLowerCase() as T);
  }

  /**
   * Sets something in a Table.
   * @param {string} id The id
   * @param {*} val The value
   * @param {string} table The table
   */
  public set <T extends TableName>(id: string, val: TableVals[T], table: T) {
    if (!tables.includes(table)) { return; }
    return this.insert(table, id, val);
  }

  /**
   * Gets something from a Table.
   * @param {string} id The id to get
   * @param {string} table The table
   * @returns {Promise<*>} Possibly the value
   */
  public async get(id: string, table: TableName) {
    if (!table || !tables.includes(table.toLowerCase() as TableName)) { return; }
    const data = await (r.table(table).filter({ id }).run());
    if (data != null && data[0] != null) return data[0].data;
  }

  private async insert(table, id, val): Promise<ISetRes> {
    if (id == null || val == null) return { success: false, err: new TypeError("Invalid ID or value.") };
    const statement = { id, data: val };
    try {
      await r.table(table).insert(statement, {
        conflict: "replace"
      }).run();
      return { success: true, err: null };
    } catch (err) {
      rejct(err, `Table ${table}:`);
      return { success: false, err };
    }
  }
}

const db = new Database();

/**
 * A table from the database.
 */
class Table<T extends TableName> { // tslint:disable-line:max-classes-per-file

  public name: T;

  constructor(name: T) {
    this.name = name;
  }

  /**
   * Add to an array.
   * @param {string} key The key
   * @param {*} val Value to add
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  public async add(key: string, val: ArrayContents<TableVals[T], null>, reject: boolean = false) {
    const arr = await this.get(key) || [];
    if (!Array.isArray(arr)) return { success: false, err: new TypeError("Non-array value.") };
    return await this.set(key, arr.concat([val]), reject);
  }

  /**
   * Add multiple items to an array.
   * @param {string} key The key
   * @param {Array<*>} val Values to add
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  public async addMult(
    key: string,
    val: TableVals[T] extends Array<any> ? TableVals[T] : null[], // tslint:disable-line:no-angle-bracket-type-assertion
    // lol, tslnt doesn't support new syntax ^
    reject = false
  ) {
    const arr = await this.get(key) || [];
    const arr2 = val || [];
    if (!Array.isArray(arr) || !Array.isArray(arr2)) {
      const err = new TypeError("Non-array value.");
      if (reject) throw err;
      return { success: false, err };
    }
    return await this.set(key, arr.concat(val), reject);
  }

  /**
   * Remove from an array.
   * @param {string} key The key
   * @param {*} obj Object to remove
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  public async remArr(key: string, obj: ArrayContents<TableVals[T], null>, reject = false) {
    const arr = await this.get(key) || [];
    if (!Array.isArray(arr)) return { success: false, err: new TypeError("Non-array value.") };
    const index = await this.indexOf(key, obj);
    return await this.spliceArr(key, index, 1, reject);
  }

  /**
   * Remove multiple items from an array.
   * @param {string} key The key
   * @param {Array<*>} objs Objects to remove
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<Array<{ success: boolean; err: any; }>>}
   */
  public async remArrMult(key: string, objs: Array<ArrayContents<TableVals[T], null>>, reject = false) {
    const arr = await this.get(key) || [];
    const arr2 = objs || [];
    if (!Array.isArray(arr) || !Array.isArray(arr2)) return { success: false, err: new TypeError("Non-array value.") };
    const results = [];
    for (const item of arr2) {
      let res;
      try {
        res = await this.spliceArr(key, await this.indexOf(key, item), 1, false);
      } catch (err) {
        res = err;
      }
      results.push(res);
    }
    if (reject) {
      for (const res of results) {
        if (!res || !res.success) throw results;
      }
    }
    return results;
  }

  /**
   * Get the property of an object.
   * @param {string} key The key
   * @param {string} prop The property
   * @returns {Promise<*>}
   */
  public async prop <P extends keyof TableVals[T]>(key: string, prop: P): Promise<TableVals[T][P]> {
    const val = await this.get(key);
    if (val == null) return;
    return val[prop];
  }

  /**
   *
   * @param {string} key The key
   * @param {Function} func Function to sort with
   * @param {boolean} [modify=false] If should modify the array in place
   * @param {boolean} [rejct=false] If should reject on promise
   */
  public async sortArr(
    key: string,
    func: (a: ArrayContents<TableVals[T]>, b: ArrayContents<TableVals[T]>) => number,
    modify: true, rejct?: boolean
  ): Promise<ISetRes>;
  public async sortArr(
    key: string,
    func: (a: ArrayContents<TableVals[T]>, b: ArrayContents<TableVals[T]>) => number,
    modify?: false, rejct?: boolean
  ): Promise<OrElse<TableVals[T], any[], void>>;
  public async sortArr(
    key: string,
    func: (a: ArrayContents<TableVals[T]>, b: ArrayContents<TableVals[T]>) => number,
    modify = false, rejct = false
  ): Promise<ISetRes | OrElse<TableVals[T], any[], void>> {
    const arr = (await this.get(key)) || [];
    if (Array.isArray(arr)) {
      if (!modify) return arr.sort(func) as OrElse<TableVals[T], any[], void>;
      return this.set(key, arr.sort(func), rejct);
    }
    if (modify) {
      const res = { success: false, err: new TypeError("Non-array value.") };
      if (rejct) throw res;
      return res;
    }
  }

  /**
   * Find an item in an array
   * @param {string} key Key
   * @param {Function} func Function to use to find
   * @param {*} [thisArg] Argument for "this"
   * @returns {*} Item found if any
   */
  public async findArr(
    key: string,
    func: (value: ArrayContents<TableVals[T]>, index: number, obj: Array<ArrayContents<TableVals[T]>>) => boolean,
    thisArg?: object | void
  ) {
    const arr = (await this.get(key)) || [];
    if (Array.isArray(arr)) return (arr as Array<ArrayContents<TableVals[T]>>).find(func, thisArg);
  }

  /**
   * Find an item in an array, returning its index
   * @param {string} key Key
   * @param {Function} func Function to use to find
   * @param {*} [thisArg] Argument for "this"
   * @returns {number} Index of the found item, if any
   */
  public async findIndexArr(
    key: string,
    func: (value: ArrayContents<TableVals[T]>, index: number, obj: Array<ArrayContents<TableVals[T]>>) => boolean,
    thisArg?: object | void
  ) {
    const arr = (await this.get(key)) || [];
    if (Array.isArray(arr)) return (arr as Array<ArrayContents<TableVals[T]>>).findIndex(func, thisArg);
  }

  /**
   * Filter items in an array
   * @param {string} key Key
   * @param {Function} func Function to use to filter
   * @param {*} [thisArg] Argument for "this"
   * @returns {Array<*>} Filtered items
   */
  public async filterArr(
    key: string,
    func: (value: ArrayContents<TableVals[T]>, index: number, array: Array<ArrayContents<TableVals[T]>>) => boolean,
    thisArg?: object | void
  ) {
    const arr = (await this.get(key)) || [];
    if (Array.isArray(arr)) return (arr as Array<ArrayContents<TableVals[T]>>).filter(func, thisArg);
  }

  /**
   * Splice an array.
   * @param {string} key The key
   * @param {number} ind The index
   * @param {number} [amount] Amount to splice (default 1)
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  public async spliceArr(key: string, ind: number, amount?: number, reject = false): Promise<ISetRes> {
    const arr = (await this.get(key)) || [];
    if (Array.isArray(arr)) {
      const modify = arr.slice();
      modify.splice(ind, amount);
      return await this.set(key, modify, reject);
    }
    return { success: false, err: new TypeError("Non-array value.") };
  }

  /**
   * Shift an array.
   * @param {string} key The key
   * @param {boolean} [reject=false] If should reject on promise
   */
  public async shift(key: string, reject = false) {
    return await this.spliceArr(key, 0, 1, reject);
  }

  /**
   * Get the index of an object in an array.
   * @param {string} key The key
   * @param {*} obj The object
   * @param {number} [fromIndex=0] From which index to start
   * @param {boolean} [deep=true] If should do deep compare
   * @returns {Promise<number>}
   */
  public async indexOf(key: string, obj: ArrayContents<TableVals[T], null>, fromIndex = 0, deep = true) {
    const arr = await this.get(key) || [];
    if (Array.isArray(arr)) {
      if (!deep) return arr.indexOf(obj);
      for (let i = _.max([Number(fromIndex), 0]); i < arr.length; i++) {
        if (_.isEqual(obj, arr[i])) return i;
      }
    }
    return -1;
  }

  /**
   * Assign a property/multiple properties to an object.
   * @param {string} key The key
   * @param {Object} val An object to merge props with
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  public async assign(
    key: string, val: { [P in keyof (TableVals[T])]?: TableVals[T][P] }, reject = false
  ): Promise<ISetRes> {
    const obj = await this.get(key) || {};
    if (typeof obj !== "object") return { success: false, err: new TypeError("Non-object value.") };
    return await this.set(key, Object.assign(obj, val), reject);
  }

  /**
   * Assign a property/multiple properties using functions.
   * @param {string} key The key
   * @param {Object} val An object to merge props with, each value must be a function fed with old value.
   * The return value of it will be used
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  public async assignF(
    key: string, val: FunctionAssign<TableVals[T]>, reject = false
  ): Promise<ISetRes> {
    if (typeof val !== "object") return Promise.resolve({ success: false, err: new TypeError("Non-object second argument.") });
    const obj = await this.get(key) || {};
    if (typeof obj !== "object") return Promise.resolve({ success: false, err: new TypeError("Non-object value.") });
    const newObj = {};
    for (const [prop, value] of Object.entries(val)) {
      newObj[prop] = typeof value === "function" ? value(obj[prop]) : value;
    }
    return await this.set(key, Object.assign(obj, newObj), reject);
  }

  /**
   * Set a value.
   * @param {string} key The key
   * @param {*} val The value
   * @param {boolean} [reject=false] If should reject on fail
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  public async set(key: string, val: TableVals[T], reject = false) {
    const res = await db.set(key, val, this.name);
    if (reject && !res.success) throw res.err;
    return res;
  }

  /**
   * Get a value.
   * @param {string} key The key
   * @param {*} [defaultVal] A default value to be returned (and set) when none is present
   * @param {boolean} [replaceDefault=false] If the default value should be applied
   * @returns {Promise<*>}
   */
  public get(key: string, defaultVal?: TableVals[T], replaceDefault = false): Promise<TableVals[T]> {
    if (key !== "INHUMAN  REACTION") {
      return new Promise(async (res, rej) => {
        const val = await db.get(key, this.name);
        if (defaultVal && replaceDefault && val == null) db.set(key, defaultVal, this.name);
        const defaulted = defaultVal ? (val == null ? defaultVal : val) : val;
        res(defaulted);
      });
    }
  }

  /**
   * Array of values
   * @returns {Promise<Array<*>>}
   */
  public async valuesArray() {
    return (await this.cache()).valuesArray();
  }

  /**
   * Array of keys
   * @returns {Promise<string[]>}
   */
  public async keysArray() {
    return (await this.cache()).keysArray();
  }

  /**
   * Array of keys (alias)
   * @returns {Promise<string[]>}
   */
  public async keyArray() {
    return (await this.cache()).keyArray();
  }

  /**
   * Array representation of this Table
   * @returns {Promise<Array<string, *>>}
   */
  public async array() {
    return (await this.cache()).array();
  }

  /**
   * Storage representing this Table, otherwise make new
   * @returns {Promise<Storage<string, *>>}
   */
  public async cache() {
    const data = await r.table(this.name).run();
    const store = new Storage<string, TableVals[T]>();
    for (const obj of data as any) {
      store.set(obj.id, obj.data);
    }
    return store;
  }

  /**
   * Alias of cache()
   */
  public storage() {
    return this.cache();
  }

  public toString() {
    return `[table ${this.name}]`;
  }

  public [util.inspect.custom]() {
    return `[Table ${this.name}]`;
  }
}

export default db;
