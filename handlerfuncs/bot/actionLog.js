const actionLogger = require("../../classes/actionlogger");

module.exports = msg => {
  return options => {
    if (!msg.guild) {
      return;
    }
    const newOptions = Object.assign({ guild: msg.guild }, options);
    return actionLogger.log(newOptions);
  };
};
