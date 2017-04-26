import { EventEmitter } from "events";
import { Constants, logger, Sequelize, sql } from "../util/deps";

class Database extends EventEmitter {
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
  public async find(model: Sequelize.Model<any, any>, val: {[row: string]: any}): Promise<any> {
    return await model.find(val);
  }
  /**
   * Find a value in the database or create it if not existent
   * @param {Sequelize.Model} model The model
   * @param {*} val The value to add
   * @returns {Promise<[*, boolean]>}
   */
  public async findAdd(model: Sequelize.Model<any, any>, val: {[row: string]: any}): Promise<[any, boolean]> {
    return await model.findOrCreate(val);
  }
  /**
   * Add a value in the database using a model, alias for its .create
   * @param {Sequelize.Model} model The model
   * @param {*} val The value to add
   * @returns {Promise<*>}
   */
  public async add(model: Sequelize.Model<any, any>, val: {[row: string]: any}): Promise<any> {
    return await model.create(val);
  }
}
export default new Database();
