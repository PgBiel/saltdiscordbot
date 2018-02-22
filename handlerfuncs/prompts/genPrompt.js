const prompt = require("./prompt");

module.exports = msg => {
  return options => {
    return async function() {
      const { res, cancelled, skipped } = await (prompt(msg)(Object.assign({ question: this.text }, options)));
      if (options.array) {
        if (typeof options.index === "number" && !isNaN(options.index)) {
          options.array[options.index] = res;
        } else {
          options.array.push(res);
        }
      }
      if (typeof options.branch === "function") {
        const branch = (this.branch(options.branch(res, cancelled, skipped)) || { exec: async _ => _ });
        if (options.exec && (options.goCancelled ? true : !cancelled)) await branch.exec();
      }
    };
  };
};
