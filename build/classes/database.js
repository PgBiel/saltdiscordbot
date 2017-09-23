"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const re = require("rethinkdbdash");
const deps_1 = require("../util/deps");
const funcs_1 = require("../util/funcs");
const r = re({ db: "saltbot" });
exports.tables = [
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
    constructor() {
        this.cache = {};
        (async () => {
            for (const table of exports.tables) {
                const cacheSpot = this.cache[table] = new deps_1.Storage();
                let list;
                try {
                    list = await r.tableList().run();
                }
                catch (err) {
                    funcs_1.rejct(err, "at tablelist:");
                    list = [];
                }
                r.table(table).run().then((res) => {
                    res.forEach((obj) => cacheSpot.set(obj.id, obj.data));
                }).catch(funcs_1.rejct);
                r.table(table).changes().run().then((stuff) => {
                    stuff.each((err, row) => {
                        if (err) {
                            return funcs_1.rejct(err);
                        }
                        if (!row || !row.new_val) {
                            return deps_1.logger.error("stuff#each: Invalid row");
                        }
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
        if (tableStor) {
            return new Table(name, tableStor, this);
        }
    }
    /**
     * Sets something in a Table.
     * @param {string} id The id
     * @param {*} val The value
     * @param {string} table The table
     * @returns {Database} this
     */
    set(id, val, table) {
        if (!this.cache[table]) {
            return;
        }
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
        if (!this.cache[table]) {
            return;
        }
        return this.cache[table].get(id);
    }
    async insert(table, id, val) {
        if (id == null || val == null)
            return { success: false, err: new TypeError("Invalid ID or value.") };
        const statement = { id, data: val };
        try {
            await r.table(table).insert(statement, {
                conflict: "replace",
            }).run();
            const { shard } = deps_1.bot;
            shard.send({ type: "dbUpdate", table, statement, id: shard.id })
                .catch((err) => deps_1.logger.error(`Failed to send DB update message to master process: ${err}`));
            return { success: true, err: null };
        }
        catch (err) {
            funcs_1.rejct(err, `Table ${table}:`);
            return { success: false, err };
        }
    }
}
// tslint:disable-next-line:max-classes-per-file
class Table extends deps_1.Storage {
    constructor(name, content, database) {
        super(content);
        this.name = name;
        this.db = database;
    }
    /* public add <B extends keyof HelperVals>(key: string, val: HelperVals[B], table: B): Promise<ISetRes>;
    public add(key: string, val: any): Promise<ISetRes>; */
    add(key, val, reject = false) {
        const arr = this.get(key) || [];
        if (!Array.isArray(arr))
            return Promise.resolve({ success: false, err: new TypeError("Non-array value.") });
        return (reject ? this.setRejct : this.set)(key, arr.concat([val]));
    }
    remArr(key, obj, reject) {
        const arr = this.get(key) || [];
        if (!Array.isArray(arr))
            return Promise.resolve({ success: false, err: new TypeError("Non-array value.") });
        return this.spliceArr(key, this.indexOf(key, obj), 1, reject);
    }
    prop(key, prop) {
        const val = this.get(key);
        if (val == null)
            return;
        return val[prop];
    }
    spliceArr(key, ind, amount, reject = false) {
        const arr = this.get(key) || [];
        if (Array.isArray(arr)) {
            const modify = arr.slice();
            modify.splice(ind, amount);
            return (reject ? this.setRejct : this.set)(key, modify);
        }
        return Promise.resolve({ success: false, err: new TypeError("Non-array value.") });
    }
    indexOf(key, obj, fromIndex = 0) {
        const arr = this.get(key) || [];
        if (!Array.isArray(arr))
            return -1;
        return arr.indexOf(obj, fromIndex);
    }
    assign(key, val, reject = false) {
        const obj = this.get(key) || {};
        if (typeof obj !== "object")
            return Promise.resolve({ success: false, err: new TypeError("Non-object value.") });
        return (reject ? this.setRejct : this.set)(key, Object.assign(obj, val));
    }
    assignF(key, val, reject = false) {
        if (typeof val !== "object")
            return Promise.resolve({ success: false, err: new TypeError("Non-object second argument.") });
        const obj = this.get(key) || {};
        if (typeof obj !== "object")
            return Promise.resolve({ success: false, err: new TypeError("Non-object value.") });
        const newObj = {};
        for (const [prop, value] of Object.entries(val)) {
            newObj[prop] = typeof value === "function" ? value(obj[prop]) : value;
        }
        return (reject ? this.setRejct : this.set)(key, Object.assign(obj, newObj));
    }
    set(key, val) {
        if (NaN)
            return this; // also totally not attempting to bypass typescript yelling at me
        if (typeof key !== "object")
            return this.db.set(key, val, this.name);
    }
    async setRejct(key, val) {
        const res = await this.set(key, val);
        if (!res.success)
            throw res.err;
        return res;
    }
    get(key, defaultVal) {
        const val = this.db.get(key, this.name);
        if (defaultVal && !val)
            this.db.set(key, defaultVal, this.name);
        const defaulted = defaultVal ? (val || defaultVal) : val;
        super.set(key, defaulted);
        return defaulted;
    }
    valuesArray() {
        return super.valuesArray.call(this.cache);
    }
    keysArray() {
        return super.keysArray.call(this.cache);
    }
    keyArray() {
        return super.keyArray.call(this.cache);
    }
    array() {
        return super.array.call(this.cache);
    }
    get cache() {
        return this.db.cache[this.name] || new deps_1.Storage();
    }
}
exports.db = new Database();
process.on("message", (message) => {
    if (message && message.type === "dbUpdate" && message.table && message.statements) {
        const msg = message;
        const { table, statement, id } = msg;
        const cacheSpot = exports.db.cache[table];
        if (cacheSpot) {
            if (statement && statement.id && statement.data) {
                cacheSpot.set(statement.id, statement.data);
            }
        }
        else {
            deps_1.logger.warn(`Got unknown table name from shard ID ${id}: ${table}`);
        }
    }
});
exports.default = exports.db;
