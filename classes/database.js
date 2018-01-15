const re = require("rethinkdbdash");
// const { HelperVals, TableName, TableVals } = require("../misc/tableValues");
const { bot } = require("../util/bot");
const Constants = require("../misc/Constants");
const logger = require("./logger");
const { Storage } = require("saltjs");
// const { rejct } = require("../util/funcs");

function rejct(rejection, prefix) {
  // console.log(require("util").inspect(require("./deps")));
  logger.custom(prefix + rejection, { prefix: "[ERR/REJECT]", color: "red", type: "error" });
}

const r = re({ db: "saltbot" });

/* export interface IEntry {
  id: string;
  data: any;
}

export interface ISetRes {
  success: boolean;
  err?: any;
} */

const tables = [
  "coins",
  "coinRewards",
  "customcommands",
  "invites",
  "triggers",
  "levels",
  "levelInfos",
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
  "warns",
  "warnexpires",
  "warnsteps",
  "welcomes"
];
exports.tables = tables;

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
  table(name) {
    if (tables.includes(name.toLowerCase())) return new Table(name.toLowerCase(), new Storage());
  }

  /**
   * Sets something in a Table.
   * @param {string} id The id
   * @param {*} val The value
   * @param {string} table The table
   */
  set(id, val, table) {
    if (!tables.includes(table)) { return; }
    return this.insert(table, id, val);
  }

  /**
   * Gets something from a Table.
   * @param {string} id The id to get
   * @param {string} table The table
   * @returns {Promise<*>} Possibly the value
   */
  async get(id, table) {
    if (!table || !tables.includes(table.toLowerCase())) { return; }
    const data = await r.table(table).get(id).run();
    if (data != null) return data.data;
  }

  async insert(table, id, val) {
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
class Table extends Storage {

  constructor(name, content) {
    super(content);
    this.name = name;
  }

  /**
   * Add to an array.
   * @param {string} key The key
   * @param {*} val Value to add
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  add(key, val, reject = false) {
    const arr = this.get(key) || [];
    if (!Array.isArray(arr)) return Promise.resolve({ success: false, err: new TypeError("Non-array value.") });
    return (reject ? this.setRejct : this.set).call(this, key, arr.concat([val]));
  }

  /**
   * Remove from an array.
   * @param {string} key The key
   * @param {*} obj Object to remove
   * @param {boolean} [reject] If should reject on promise
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  remArr(key, obj, reject) {
    const arr = this.get(key) || [];
    if (!Array.isArray(arr)) return Promise.resolve({ success: false, err: new TypeError("Non-array value.") });
    return this.spliceArr(key, this.indexOf(key, obj), 1, reject);
  }

  /**
   * Get the property of an object.
   * @param {string} key The key
   * @param {string} prop The property
   * @returns {*}
   */
  prop(key, prop) {
    const val = this.get(key);
    if (val == null) return;
    return val[prop];
  }

  /**
   * Splice an array.
   * @param {string} key The key
   * @param {number} ind The index
   * @param {number} [amount] Amount to splice (default 1)
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  spliceArr(key, ind, amount, reject = false) {
    const arr = this.get(key) || [];
    if (Array.isArray(arr)) {
      const modify = arr.slice();
      modify.splice(ind, amount);
      return (reject ? this.setRejct : this.set).call(this, key, modify);
    }
    return Promise.resolve({ success: false, err: new TypeError("Non-array value.") });
  }

  /**
   * Get the index of an object in an array.
   * @param {string} key The key
   * @param {*} obj The object
   * @param {number} [fromIndex=0] From which index to start
   * @returns {Promise<number>}
   */
  async indexOf(key, obj, fromIndex = 0) {
    const arr = (await this.get(key)) || [];
    if (!Array.isArray(arr)) return -1;
    return arr.indexOf(obj, fromIndex);
  }

  /**
   * Assign a property/multiple properties to an object.
   * @param {string} key The key
   * @param {Object} val An object to merge props with
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  assign(key, val, reject = false) {
    const obj = this.get(key) || {};
    if (typeof obj !== "object") return Promise.resolve({ success: false, err: new TypeError("Non-object value.") });
    return (reject ? this.setRejct : this.set).call(this, key, Object.assign(obj, val));
  }

  /**
   * Assign a property/multiple properties using functions.
   * @param {string} key The key
   * @param {Object} val An object to merge props with, each value must be a function fed with old value. 
     The return value of it will be used
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  assignF(key, val, reject = false) {
    if (typeof val !== "object") return Promise.resolve({ success: false, err: new TypeError("Non-object second argument.") });
    const obj = this.get(key) || {};
    if (typeof obj !== "object") return Promise.resolve({ success: false, err: new TypeError("Non-object value.") });
    const newObj = {};
    for (const [prop, value] of Object.entries(val)) {
      newObj[prop] = typeof value === "function" ? value(obj[prop]) : value;
    }
    return (reject ? this.setRejct : this.set).call(this, key, Object.assign(obj, newObj));
  }

  /**
   * Set a value.
   * @param {string} key The key
   * @param {*} val The value
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  set(key, val) {
    return db.set(key, val, this.name);
  }

  /**
   * Set a value with reject on promise.
   * @param {string} key The key
   * @param {*} val The value
   * @returns {Promise<{ success: boolean; err: any; }>}
   */
  async setRejct(key, val) {
    const res = await this.set(key, val);
    if (!res.success) throw res.err;
    return res;
  }

  /**
   * Get a value.
   * @param {string} key The key
   * @param {*} [defaultVal] A default value to be returned (and set) when none is present
   * @returns {Promise<*>}
   */
  async get(key, defaultVal) {
    const val = await db.get(key, this.name);
    if (defaultVal && val == null) db.set(key, defaultVal, this.name);
    const defaulted = defaultVal ? (val == null ? defaultVal : val) : val;
    return defaulted;
  }

  /**
   * Array of values
   * @returns {Promise<Array<*>>}
   */
  async valuesArray() {
    return super.valuesArray.call(await this.cache());
  }

  /**
   * Array of keys
   * @returns {Promise<string[]>}
   */
  async keysArray() {
    return super.keysArray.call(await this.cache());
  }

  /**
   * Array of keys (alias)
   * @returns {Promise<string[]>}
   */
  async keyArray() {
    return super.keyArray.call(await this.cache());
  }

  /**
   * Array representation of this Table
   * @returns {Promise<Array<string, *>>}
   */
  async array() {
    return super.array.call(await this.cache());
  }

  /**
   * Storage representing this Table, otherwise make new
   * @returns {Promise<Storage<string, *>>}
   */
  async cache() {
    const data = await r.table(this.name).run();
    const store = new Storage();
    for (const obj of data) {
      store.set(obj.id, obj.data);
    }
    return store;
  }

  /**
   * Alias of cache()
   */
  storage() {
    return this.cache();
  }
}

module.exports = db;
