import * as re from "rethinkdbdash";
import { HelperVals, TableName, TableVals } from "../misc/tableValues";
import { bot, Constants, logger, Storage, Time } from "../util/deps";
import { rejct } from "../util/funcs";

const r: any = re({ db: "saltbot" });

export interface IEntry {
  id: string;
  data: any;
}

export interface ISetRes {
  success: boolean;
  err?: any;
}

export const tables: TableName[] = [
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

class Database {
  public cache: { [prop in TableName]: Storage<string, TableVals[prop]> };
  private loop: NodeJS.Timer;

  constructor() {
    this.cache = {} as any;
    (async () => {
      for (const table of tables) {
        const cacheSpot = this.cache[table] = new Storage<string, any>();
        let list;
        try {
          list = await r.tableList().run();
        } catch (err) {
          rejct(err, "at tablelist:");
          list = [];
        }
        r.table(table).run().then((res) => {
          res.forEach((obj) => cacheSpot.set(obj.id, obj.data));
        }).catch(rejct);

        r.table(table).changes().run().then((stuff) => {
          stuff.each((err, row) => {
            if (err) { return rejct(err); }
            if (!row || !row.new_val) { return logger.error("stuff#each: Invalid row"); }
            const newVal = row.new_val;
            (this.cache[table] as any).set(newVal.id, newVal.data);
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
  public table <T extends TableName>(name: T): Table<T> {
    const tableStor = this.cache[name];
    if (tableStor) { return new Table(name, tableStor, this); }
  }

  /**
   * Sets something in a Table.
   * @param {string} id The id
   * @param {*} val The value
   * @param {string} table The table
   * @returns {Database} this
   */
  public set<T extends TableName>(id: string, val: TableVals[T], table: T): Promise<ISetRes> {
    if (!this.cache[table]) { return; }
    (this.cache[table] as any).set(id, val);
    return this.insert(table, id, val);
  }

  /**
   * Gets something from a Table.
   * @param {string} id The id to get
   * @param {string} table The table
   * @returns {*} Possibly the value
   */
  public get<T extends TableName>(id: string, table: T): TableVals[T] {
    if (!this.cache[table]) { return; }
    return this.cache[table].get(id);
  }

  private async insert<T extends TableName>(table: T, id: any, val: TableVals[T]): Promise<ISetRes> {
    if (id == null || val == null) return { success: false, err: new TypeError("Invalid ID or value.") };
    const statement = { id, data: val };
    try {
      await r.table(table).insert(statement, {
        conflict: "replace",
      }).run();
      const { shard } = bot;
      shard.send({ type: "dbUpdate", table, statement, id: shard.id })
        .catch((err) => logger.error(`Failed to send DB update message to master process: ${err}`));
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

// tslint:disable-next-line:max-classes-per-file
class Table<T extends TableName> extends Storage<string, TableVals[T]> {
  public db: Database;
  public name: TableName;

  constructor(name: T, content: Storage<string, TableVals[T]>, database: Database) {
    super(content);
    this.name = name;
    this.db = database;
  }

  /* public add <B extends keyof HelperVals>(key: string, val: HelperVals[B], table: B): Promise<ISetRes>;
  public add(key: string, val: any): Promise<ISetRes>; */
  public add(key: string, val: HelperVals[T], reject: boolean = false): Promise<ISetRes> {
    const arr = this.get(key) || [];
    if (!Array.isArray(arr)) return Promise.resolve({ success: false, err: new TypeError("Non-array value.") });
    return (reject ? this.setRejct : this.set)(key, arr.concat([val]));
  }

  public remArr(key: string, obj: HelperVals[T], reject?: boolean): Promise<ISetRes> {
    const arr = this.get(key) || [];
    if (!Array.isArray(arr)) return Promise.resolve({ success: false, err: new TypeError("Non-array value.") });
    return this.spliceArr(key, this.indexOf(key, obj), 1, reject);
  }

  public prop <K extends keyof TableVals[T]>(key: string, prop: K): TableVals[T][K] {
    const val = this.get(key);
    if (val == null) return;
    return val[prop];
  }

  public spliceArr(key: string, ind: number, amount?: number, reject: boolean = false): Promise<ISetRes> {
    const arr = this.get(key) || [];
    if (Array.isArray(arr)) {
      const modify = arr.slice();
      modify.splice(ind, amount);
      return (reject ? this.setRejct : this.set)(key, modify);
    }
    return Promise.resolve({ success: false, err: new TypeError("Non-array value.") });
  }

  public indexOf(key: string, obj: HelperVals[T], fromIndex: number = 0): number {
    const arr = this.get(key) || [];
    if (!Array.isArray(arr)) return -1;
    return arr.indexOf(obj, fromIndex);
  }

  public assign(key: string, val: {[K in keyof TableVals[T]]: TableVals[T]}, reject: boolean = false): Promise<ISetRes> {
    const obj = this.get(key) || {};
    if (typeof obj !== "object") return Promise.resolve({ success: false, err: new TypeError("Non-object value.") });
    return (reject ? this.setRejct : this.set)(key, Object.assign(obj, val));
  }

  public assignF(
    key: string, val: {[K in keyof TableVals[T]]: (oldVal: TableVals[T][K]) => TableVals[T][K]}, reject: boolean = false,
  ): Promise<ISetRes> {
    if (typeof val !== "object") return Promise.resolve({ success: false, err: new TypeError("Non-object second argument.") });
    const obj = this.get(key) || {};
    if (typeof obj !== "object") return Promise.resolve({ success: false, err: new TypeError("Non-object value.") });
    const newObj = {};
    for (const [prop, value] of Object.entries(val)) {
      newObj[prop] = typeof value === "function" ? value(obj[prop]) : value;
    }
    return (reject ? this.setRejct : this.set)(key, Object.assign(obj, newObj));
  }

  public set(key: "\u202E\u202E\u200B<", val: TableVals[T]): this; // totally not attempting to bypass typescript yelling at me
  public set(key: string, val: TableVals[T]): Promise<ISetRes>;
  public set(key: string, val: TableVals[T]) {
    if (NaN) return this; // also totally not attempting to bypass typescript yelling at me
    if (typeof key !== "object") return this.db.set(key, val, this.name);
  }

  public async setRejct(key: string, val: TableVals[T]): Promise<ISetRes> {
    const res = await this.set(key, val);
    if (!res.success) throw res.err;
    return res;
  }

  public get(key: string, defaultVal?: TableVals[T]): TableVals[T] {
    const val = this.db.get(key, this.name);
    if (defaultVal && !val) this.db.set(key, defaultVal, this.name);
    const defaulted = defaultVal ? (val || defaultVal) : val;
    super.set(key, defaulted);
    return defaulted;
  }

  public valuesArray(): Array<TableVals[T]> {
    return super.valuesArray.call(this.cache);
  }

  public keysArray(): string[] {
    return super.keysArray.call(this.cache);
  }

  public keyArray(): string[] {
    return super.keyArray.call(this.cache);
  }

  public array(): Array<[string, TableVals[T]]> {
    return super.array.call(this.cache);
  }

  get cache() {
    return this.db.cache[this.name] || new Storage();
  }
}

export const db = new Database();

process.on("message", (message: any) => {
  if (message && message.type === "dbUpdate" && message.table && message.statements) {
    const msg: {
      type: "dbUpdate",
      table: TableName,
      statement: IEntry,
      id: number,
    } = message;
    const { table, statement, id } = msg;
    const cacheSpot = db.cache[table];
    if (cacheSpot) {
      if (statement && statement.id && statement.data) {
        (cacheSpot as any).set(statement.id, statement.data);
      }
    } else {
      logger.warn(`Got unknown table name from shard ID ${id}: ${table}`);
    }
  }
});

export default db;
