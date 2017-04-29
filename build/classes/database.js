"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class Database extends events_1.EventEmitter {
    constructor() {
        super();
        // this.models = {};
    }
    /**
     * Define a model and function for checking
     * @param {string} name The name of the model
     * @param {Function} func The checking function
     * @returns {boolean} If it succeeded
     */
    /* public define(name: string, func: (...stuff: any[]) => any) {
      if (this.models[name]) {
        return false;
      }
      this.models[name] = func;
      return true;
    } */
    /**
     * Find a value in the database
     * @param {Sequelize.Model} model The model
     * @param {*} val The value to find
     * @returns {Promise<*>}
     */
    async find(model, val) {
        return await model.find(val);
    }
    /**
     * Find a value in the database or create it if not existent
     * @param {Sequelize.Model} model The model
     * @param {*} val The value to add
     * @returns {Promise<[*, boolean]>}
     */
    async findAdd(model, val) {
        return await model.findOrCreate(val);
    }
    /**
     * Add a value in the database using a model, alias for its .create
     * @param {Sequelize.Model} model The model
     * @param {*} val The value to add
     * @returns {Promise<*>}
     */
    async add(model, val) {
        return await model.create(val);
    }
}
exports.default = new Database();
