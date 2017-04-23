let conn;
const EventEmitter = require("events");
class Database extends EventEmitter {
  constructor(rethonk) {
    super();
    this.models = {};
    const r = rethonk;
    r.connect({ host: "localhost", port: 8080, db: "salt" }, (err, connect) => {
      if (err) throw new Error(`Could not connect to rethonk: ${err}`);
      conn = connect;
    });
  }

  /**
   * Define a model and function for checking
   * @param {string} name The name of the model
   * @param {Function} func The checking function
   * @returns {boolean} If it succeeded
   */
  define(name, func) {
    if (this.models[name]) return false;
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
      logger.error("Invalid Model:", thing, "!");
    }
    const result = this.models[thing].func(val);
    if (!result) return false;
    return result;
  }
}