const { EventEmitter } = require("events");

class Messager extends EventEmitter {

  /**
   * Promisify an event
   * @param {*} event The event
   * @param {number} [timeLimit=null] Max time limit otherwise rejection
   * @returns {Promise<*>}
   */
  awaitFor(event, timeLimit = null) {
    return new Promise((res, rej) => {
      let successfull = false;
      const funcToThing = stuff => {
        successfull = true;
        res(stuff);
      };
      this.once(event, funcToThing);
      if (!(isNaN(timeLimit)) && timeLimit > 0) {
        setTimeout(() => {
        if (successfull) {
          return;
        }
        this.removeListener(event, funcToThing);
        rej(null);
        }, timeLimit);
      }
    });
  }

  /**
   * Await an event and emit another
   * @param {*} emev The event to emit
   * @param {*} emdata The data to emit with the event
   * @param {*} event The event to await
   * @param {number} [timeLimit=null] Max time limit otherwise rejection
   * @returns {Promise<*>}
   */
  awaitForThenEmit(emev, emdata, event, timeLimit = null) {
    return new Promise((res, rej) => {
      let successfull = false;
      const funcToThing = stuff => {
        successfull = true;
        res(stuff);
      };
      this.once(event, funcToThing);
      this.emit(emev, emdata);
      if (!(isNaN(timeLimit)) && timeLimit > 0) {
        setTimeout(() => {
          if (successfull) {
            return;
          }
          this.removeListener(event, funcToThing);
          rej(null);
        }, timeLimit);
      }
    });
  }
}

module.exports = new Messager();
