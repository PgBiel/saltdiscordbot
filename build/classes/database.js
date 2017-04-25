"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const deps_1 = require("../util/deps");
// this file is not really needed anymore but w/e
class Database extends events_1.EventEmitter {
    constructor(rethonk) {
        super();
        this.models = {};
    }
    /**
     * Define a model and function for checking
     * @param {string} name The name of the model
     * @param {Function} func The checking function
     * @returns {boolean} If it succeeded
     */
    define(name, func) {
        if (this.models[name]) {
            return false;
        }
        this.models[name] = func;
        return true;
    }
    /**
     * Add a value in the database using a model
     * @param {string} name Model name
     * @param {*} val The value to set
     * @returns {*}
     */
    set(thing, val) {
        if (!this.models[thing]) {
            deps_1.logger.error("Invalid Model:", thing, "!");
        }
        const result = this.models[thing](val);
        if (!result) {
            return false;
        }
        return result;
    }
}
