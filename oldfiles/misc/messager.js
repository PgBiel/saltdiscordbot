const EventEmitter = require("events");
const Messager = class Messager extends EventEmitter {
  constructor(){
    super();
  }

  awaitFor(event, timeLimit=null) {
    return new Promise((res, rej) => {
      let successfull = false;
      const funcToThing = stuff=>{
        successfull = true;
        res(stuff);
      };
      this.once(event, funcToThing);
      if (!(isNaN(timeLimit)) && timeLimit > 0) setTimeout(()=>{
        if (successfull) return;
        this.removeListener(event, funcToThing);
        rej(null);
      }, timeLimit);
    });
  }

  awaitForThenEmit(emev, emdata, event, timeLimit=null) {
    return new Promise((res, rej) => {
      let successfull = false;
      const funcToThing = stuff=>{
        successfull = true;
        res(stuff);
      };
      this.once(event, funcToThing);
      this.emit(emev, emdata);
      if (!(isNaN(timeLimit)) && timeLimit > 0) setTimeout(()=>{
        if (successfull) return;
        this.removeListener(event, funcToThing);
        rej(null);
      }, timeLimit);
    });
  }
};
module.exports = new Messager;