const re = require("rethinkdbdash");
// const { HelperVals, TableName, TableVals } = require("../misc/tableValues");
const { bot, Constants, logger, Storage, Time } = require("../util/deps");
const { rejct } = require("../util/funcs");

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
  "warnsteps",
  "welcomes",
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
  /* props:
  public cache: { [prop in TableName]: Storage<string, TableVals[prop]> };
  private loop: NodeJS.Timer;
  */

  constructor() {
    this.cache = {};
    (async () => {
      for (const table of tables) {
        const cacheSpot = this.cache[table] = new Storage();
        let list;
        try {
          list = await r.tableList().run();
        } catch (err) {
          rejct(err, "at tablelist:");
          list = [];
        }
        r.table(table).run().then(res => {
          res.forEach(obj => cacheSpot.set(obj.id, obj.data));
        }).catch(rejct);

        r.table(table).changes().run().then(stuff => {
          stuff.each((err, row) => {
            if (err) { return rejct(err); }
            if (!row || !row.new_val) { return logger.error("stuff#each: Invalid row"); }
            const newVal = row.new_val;
            this.cache[table].set(newVal.id, newVal.data);
          });
        });
      }
    })();
  }

  /**
   * Gets a Table.
   * @param {string} name The table name.
   * @returns {Table}
   */
  table(name) {
    const tableStor = this.cache[name];
    if (tableStor) return new Table(name, tableStor);
  }

  /**
   * Sets something in a Table.
   * @param {string} id The id
   * @param {*} val The value
   * @param {string} table The table
   * @returns {Database} this
   */
  set(id, val, table) {
    if (!this.cache[table]) { return; }
    this.cache[table].set(id, val);
    return this.insert(table, id, val);
  }

  /**
   * Gets something from a Table.
   * @param {string} id The id to get
   * @param {string} table The table
   * @returns {*} Possibly the value
   */
  get(id, table) {
    if (!this.cache[table]) { return; }
    return this.cache[table].get(id);
  }

  async insert(table, id, val) {
    if (id == null || val == null) return { success: false, err: new TypeError("Invalid ID or value.") };
    const statement = { id, data: val };
    try {
      await r.table(table).insert(statement, {
        conflict: "replace",
      }).run();
      const { shard } = bot;
      shard.send({ type: "dbUpdate", table, statement, id: shard.id })
        .catch(err => logger.error(`Failed to send DB update message to master process: ${err}`));
      return { success: true, err: null };
    } catch (err) {
      rejct(err, `Table ${table}:`);
      return { success: false, err };
    }
  }

  /* private update(id: string, table: string) {
    const tabula = this.queue.get(table);
    if (!tabula) { return; }
    tabula.push({
      id,
      data: this.cache[table].get(id),
    });
  } */
}

const db = new Database();

// tslint:disable-next-line:max-classes-per-file
class Table extends Storage {
  /* props:
  public db: Database;
  public name: TableName;
  */

  constructor(name, content) {
    super(content);
    this.name = name;
  }

  /* public add <B extends keyof HelperVals>(key: string, val: HelperVals[B], table: B): Promise<ISetRes>;
  public add(key: string, val: any): Promise<ISetRes>; */
  /**
   * Add to an array.
   * @param {string} key The key
   * @param {*} val Value to add
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<Object>}
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
   * @returns {Promise<Object>}
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
  prop (key, prop) {
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
   * @returns {Promise<Object>}
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
   * @returns {number}
   */
  indexOf(key, obj, fromIndex = 0) {
    const arr = this.get(key) || [];
    if (!Array.isArray(arr)) return -1;
    return arr.indexOf(obj, fromIndex);
  }

  /**
   * Assign a property/multiple properties to an object.
   * @param {string} key The key
   * @param {Object} val An object to merge props with
   * @param {boolean} [reject=false] If should reject on promise
   * @returns {Promise<Object>}
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
   * @returns {Promise<Object>}
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

  /* public set(key: "\u202E\u202E\u200B<", val: TableVals[T]): this; // totally not attempting to bypass typescript yelling at me
  public set(key: string, val: TableVals[T]): Promise<ISetRes>; */
  /**
   * Set a value.
   * @param {string} key The key
   * @param {*} val The value
   * @returns {Promise<Object>}
   */
  set(key, val) {
    // if (NaN) return this; // also totally not attempting to bypass typescript yelling at me
    return db.set(key, val, this.name);
  }

  /**
   * Set a value with reject on promise.
   * @param {string} key The key
   * @param {*} val The value
   * @returns {Promise<Object>}
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
   * @returns {*}
   */
  get(key, defaultVal) {
    const val = db.get(key, this.name);
    if (defaultVal && !val) db.set(key, defaultVal, this.name);
    const defaulted = defaultVal ? (val || defaultVal) : val;
    super.set(key, defaulted);
    return defaulted;
  }

  /**
   * Array of values
   * @returns {Array<*>}
   */
  valuesArray() {
    return super.valuesArray.call(this.cache);
  }

  /**
   * Array of keys
   * @returns {string[]}
   */
  keysArray() {
    return super.keysArray.call(this.cache);
  }

  /**
   * Array of keys (alias)
   * @returns {string[]}
   */
  keyArray() {
    return super.keyArray.call(this.cache);
  }

  /**
   * Array representation of this Table
   * @returns {Array<string, *>}
   */
  array() {
    return super.array.call(this.cache);
  }

  /**
   * Storage representing this Table, otherwise make new
   */
  get cache() {
    return db.cache[this.name] || new Storage();
  }

  /**
   * Alias of cache()
   */
  get storage() {
    return this.cache;
  }
}

process.on("message", message => {
  if (message && message.type === "dbUpdate" && message.table && message.statements) {
    const msg = message;
    const { table, statement, id } = msg;
    const cacheSpot = db.cache[table];
    if (cacheSpot) {
      if (statement && statement.id && statement.data) {
        cacheSpot.set(statement.id, statement.data);
      }
    } else {
      logger.warn(`Got unknown table name from shard ID ${id}: ${table}`);
    }
  }
});

module.exports = db;
