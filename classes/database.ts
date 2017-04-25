import { EventEmitter } from "events";
import { logger, Sequelize, sql } from "../util/deps";
// this file is not really needed anymore but w/e
class Database extends EventEmitter {
  public models: {[prop: string]: any};
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
  public define(name: string, func: (...stuff: any[]) => any) {
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
  public set(thing: string, val: any) {
    if (!this.models[thing]) {
      logger.error("Invalid Model:", thing, "!");
    }
    const result = this.models[thing](val);
    if (!result) {
      return false;
    }
    return result;
  }
}
