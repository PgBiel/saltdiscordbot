import { EventEmitter } from "events";

class Messager extends EventEmitter {

  /**
   * Promisify an event
   * @param {*} event The event
   * @param {number} [timeLimit=null] Max time limit otherwise rejection
   * @returns {Promise<*>}
   */
  public awaitFor(event: any, timeLimit: number = null): Promise<any> {
    return new Promise((res, rej) => {
      let successfull = false;
      const funcToThing = (stuff: any) => {
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
  public awaitForThenEmit(emev: any, emdata: any, event: any, timeLimit: number = null): Promise<any> {
    return new Promise((res, rej) => {
      let successfull = false;
      const funcToThing = (stuff: any) => {
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

export default new Messager();
